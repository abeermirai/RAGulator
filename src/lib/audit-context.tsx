import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auditApi, getStoredCycleId, storeCycleId } from "@/lib/api-client";
import type {
  AnalyzeResponse,
  AuditCycle,
  ChatMessage,
  DocumentRecord,
  DocumentZone,
  FindingsResponse,
  PipelineResponse,
  QueryResponse,
  ReportResponse,
} from "@/lib/types/audit";
import { toast } from "sonner";

type AuditCtx = {
  cycle: AuditCycle | null;
  documents: DocumentRecord[];
  pipeline: PipelineResponse | null;
  findings: FindingsResponse | null;
  report: ReportResponse | null;
  messages: ChatMessage[];
  apiOnline: boolean;
  analyzing: boolean;
  loading: boolean;
  uploadFile: (file: File, zone: DocumentZone) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
  runAnalysis: () => Promise<AnalyzeResponse>;
  askQuestion: (question: string) => Promise<QueryResponse>;
  loadReport: () => Promise<ReportResponse>;
  exportReportPdf: () => Promise<void>;
  refreshAll: () => void;
  startNewSession: () => Promise<void>;
  llmAvailable: boolean;
  llmProvider: string | null;
};

const AuditContext = createContext<AuditCtx | null>(null);

function applyAnalysis(data: AnalyzeResponse, setFindings: (f: FindingsResponse) => void, setMessages: (m: ChatMessage[]) => void) {
  setFindings(data.findings);
  if (data.sample_query) {
    setMessages([
      { id: "sample-q", role: "user", content: data.sample_query.question },
      { id: "sample-a", role: "assistant", content: data.sample_query.answer, response: data.sample_query },
    ]);
  }
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [findings, setFindings] = useState<FindingsResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [cycleId, setCycleId] = useState<string | null>(getStoredCycleId());
  const lastAnalyzedFingerprint = useRef("");

  const healthQuery = useQuery({
    queryKey: ["audit-health"],
    queryFn: () => auditApi.health(),
    retry: 1,
    refetchInterval: 30_000,
  });

  const cycleQuery = useQuery({
    queryKey: ["audit-cycle", cycleId],
    queryFn: async () => {
      if (cycleId) {
        try {
          return await auditApi.getCycle(cycleId);
        } catch {
          // stale stored id
        }
      }
      const cycle = await auditApi.getDefaultCycle();
      storeCycleId(cycle.id);
      setCycleId(cycle.id);
      return cycle;
    },
    enabled: healthQuery.isSuccess,
  });

  const activeCycleId = cycleQuery.data?.id ?? cycleId;

  const docsQuery = useQuery({
    queryKey: ["audit-documents", activeCycleId],
    queryFn: () => auditApi.listDocuments(activeCycleId!),
    enabled: !!activeCycleId,
    refetchInterval: (query) => {
      const docs = query.state.data ?? [];
      return docs.some((d) => d.status === "processing" || d.status === "queued") ? 1500 : false;
    },
  });

  const documents = docsQuery.data ?? [];

  const pipelineQuery = useQuery({
    queryKey: ["audit-pipeline", activeCycleId],
    queryFn: () => auditApi.getPipeline(activeCycleId!),
    enabled: !!activeCycleId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && !data.ready ? 1500 : false;
    },
  });

  const readyDocFingerprint = useMemo(
    () =>
      documents
        .filter((d) => d.status === "ready")
        .map((d) => d.id)
        .sort()
        .join(","),
    [documents],
  );

  const resetAnalysisState = useCallback(() => {
    lastAnalyzedFingerprint.current = "";
    setFindings(null);
    setMessages([]);
    setReport(null);
  }, []);

  const analyzeMutation = useMutation({
    mutationFn: () => auditApi.analyze(activeCycleId!),
    onSuccess: (data) => {
      applyAnalysis(data, setFindings, setMessages);
      setReport(null);
      qc.setQueryData(["audit-findings", activeCycleId], data.findings);
    },
    onError: (err) => {
      lastAnalyzedFingerprint.current = "";
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, zone }: { file: File; zone: DocumentZone }) => {
      let id = activeCycleId;
      if (!id) {
        const cycle = await auditApi.startNewCycle();
        storeCycleId(cycle.id);
        setCycleId(cycle.id);
        id = cycle.id;
      }
      return auditApi.uploadDocument(id, file, zone);
    },
    onSuccess: () => {
      resetAnalysisState();
      qc.invalidateQueries({ queryKey: ["audit-documents", activeCycleId] });
      qc.invalidateQueries({ queryKey: ["audit-pipeline", activeCycleId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => auditApi.deleteDocument(activeCycleId!, docId),
    onSuccess: () => {
      resetAnalysisState();
      qc.invalidateQueries({ queryKey: ["audit-documents", activeCycleId] });
      qc.invalidateQueries({ queryKey: ["audit-pipeline", activeCycleId] });
    },
  });

  const queryMutation = useMutation({
    mutationFn: (question: string) => auditApi.query(activeCycleId!, question),
    onSuccess: (response, question) => {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: question },
        { id: `a-${Date.now()}`, role: "assistant", content: response.answer, response },
      ]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => auditApi.generateReport(activeCycleId!),
    onSuccess: setReport,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Report failed"),
  });

  const exportMutation = useMutation({
    mutationFn: () => auditApi.exportReportPdf(activeCycleId!),
  });

  // Auto-analyze when documents finish indexing
  useEffect(() => {
    if (!activeCycleId || !pipelineQuery.data?.ready || !readyDocFingerprint) return;
    if (lastAnalyzedFingerprint.current === readyDocFingerprint) return;
    lastAnalyzedFingerprint.current = readyDocFingerprint;
    analyzeMutation.mutate();
  }, [activeCycleId, pipelineQuery.data?.ready, readyDocFingerprint]);

  const startNewSession = useCallback(async () => {
    resetAnalysisState();
    const cycle = await auditApi.startNewCycle();
    storeCycleId(cycle.id);
    setCycleId(cycle.id);
    qc.invalidateQueries({ queryKey: ["audit-cycle"] });
  }, [qc, resetAnalysisState]);

  const refreshAll = useCallback(() => {
    resetAnalysisState();
    qc.invalidateQueries({ queryKey: ["audit-cycle", activeCycleId] });
    qc.invalidateQueries({ queryKey: ["audit-documents", activeCycleId] });
    qc.invalidateQueries({ queryKey: ["audit-pipeline", activeCycleId] });
  }, [qc, activeCycleId, resetAnalysisState]);

  const value = useMemo<AuditCtx>(
    () => ({
      cycle: cycleQuery.data ?? null,
      documents,
      pipeline: pipelineQuery.data ?? null,
      findings,
      report,
      messages,
      apiOnline: healthQuery.isSuccess,
      analyzing: analyzeMutation.isPending,
      loading: cycleQuery.isLoading || docsQuery.isLoading,
      uploadFile: async (file, zone) => {
        await uploadMutation.mutateAsync({ file, zone });
      },
      deleteDocument: async (docId) => {
        await deleteMutation.mutateAsync(docId);
      },
      runAnalysis: async () => {
        lastAnalyzedFingerprint.current = "";
        return analyzeMutation.mutateAsync();
      },
      askQuestion: async (question) => queryMutation.mutateAsync(question),
      loadReport: async () => reportMutation.mutateAsync(),
      exportReportPdf: async () => exportMutation.mutateAsync(),
      refreshAll,
      startNewSession,
      llmAvailable: healthQuery.data?.llm_available ?? false,
      llmProvider: healthQuery.data?.llm_provider ?? null,
    }),
    [
      cycleQuery.data,
      documents,
      pipelineQuery.data,
      findings,
      report,
      messages,
      healthQuery.isSuccess,
      analyzeMutation.isPending,
      cycleQuery.isLoading,
      docsQuery.isLoading,
      uploadMutation,
      deleteMutation,
      analyzeMutation,
      queryMutation,
      reportMutation,
      exportMutation,
      refreshAll,
      startNewSession,
      healthQuery.data?.llm_available,
      healthQuery.data?.llm_provider,
    ],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used within AuditProvider");
  return ctx;
}
