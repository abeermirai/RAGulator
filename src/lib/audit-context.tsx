import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "@/lib/api-client";
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
  llmAvailable: boolean;
  llmProvider: string | null;
};

const AuditContext = createContext<AuditCtx | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [findings, setFindings] = useState<FindingsResponse | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const lastAnalyzedFingerprint = useRef("");

  const healthQuery = useQuery({
    queryKey: ["audit-health"],
    queryFn: () => auditApi.health(),
    retry: 1,
    refetchInterval: 30_000,
  });

  const cycleQuery = useQuery({
    queryKey: ["audit-cycle"],
    queryFn: () => auditApi.getDefaultCycle(),
    enabled: healthQuery.isSuccess,
    refetchInterval: 10_000,
  });

  const cycleId = cycleQuery.data?.id;

  const docsQuery = useQuery({
    queryKey: ["audit-documents", cycleId],
    queryFn: () => auditApi.listDocuments(cycleId!),
    enabled: !!cycleId,
    refetchInterval: (query) => {
      const docs = query.state.data ?? [];
      return docs.some((d) => d.status === "processing" || d.status === "queued") ? 1500 : false;
    },
  });

  const documents = docsQuery.data ?? [];

  const pipelineQuery = useQuery({
    queryKey: ["audit-pipeline", cycleId],
    queryFn: () => auditApi.getPipeline(cycleId!),
    enabled: !!cycleId,
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

  const uploadMutation = useMutation({
    mutationFn: ({ file, zone }: { file: File; zone: DocumentZone }) =>
      auditApi.uploadDocument(cycleId!, file, zone),
    onSuccess: () => {
      resetAnalysisState();
      qc.invalidateQueries({ queryKey: ["audit-documents", cycleId] });
      qc.invalidateQueries({ queryKey: ["audit-pipeline", cycleId] });
      qc.invalidateQueries({ queryKey: ["audit-cycle"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => auditApi.deleteDocument(cycleId!, docId),
    onSuccess: () => {
      resetAnalysisState();
      qc.invalidateQueries({ queryKey: ["audit-documents", cycleId] });
      qc.invalidateQueries({ queryKey: ["audit-pipeline", cycleId] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => auditApi.analyze(cycleId!),
    onSuccess: (data) => {
      setFindings(data.findings);
      setReport(null);
      if (data.sample_query) {
        setMessages([
          { id: "sample-q", role: "user", content: data.sample_query.question },
          { id: "sample-a", role: "assistant", content: data.sample_query.answer, response: data.sample_query },
        ]);
      }
    },
  });

  const queryMutation = useMutation({
    mutationFn: (question: string) => auditApi.query(cycleId!, question),
    onSuccess: (response, question) => {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: question },
        { id: `a-${Date.now()}`, role: "assistant", content: response.answer, response },
      ]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => auditApi.generateReport(cycleId!),
    onSuccess: setReport,
  });

  const exportMutation = useMutation({
    mutationFn: () => auditApi.exportReportPdf(cycleId!),
  });

  // Re-analyze whenever the set of ready documents changes
  useEffect(() => {
    if (!cycleId || !pipelineQuery.data?.ready || !readyDocFingerprint) return;
    if (lastAnalyzedFingerprint.current === readyDocFingerprint) return;
    lastAnalyzedFingerprint.current = readyDocFingerprint;
    analyzeMutation.mutate();
  }, [cycleId, pipelineQuery.data?.ready, readyDocFingerprint]);

  const refreshAll = useCallback(() => {
    resetAnalysisState();
    qc.invalidateQueries({ queryKey: ["audit-cycle"] });
    qc.invalidateQueries({ queryKey: ["audit-documents", cycleId] });
    qc.invalidateQueries({ queryKey: ["audit-pipeline", cycleId] });
  }, [qc, cycleId, resetAnalysisState]);

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
        if (!cycleId) throw new Error("No audit cycle");
        await uploadMutation.mutateAsync({ file, zone });
      },
      deleteDocument: async (docId) => {
        await deleteMutation.mutateAsync(docId);
      },
      runAnalysis: async () => {
        resetAnalysisState();
        return analyzeMutation.mutateAsync();
      },
      askQuestion: async (question) => queryMutation.mutateAsync(question),
      loadReport: async () => reportMutation.mutateAsync(),
      exportReportPdf: async () => exportMutation.mutateAsync(),
      refreshAll,
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
      cycleId,
      uploadMutation,
      deleteMutation,
      analyzeMutation,
      queryMutation,
      reportMutation,
      exportMutation,
      refreshAll,
      resetAnalysisState,
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
