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
  const analyzedRef = useRef(false);

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

  const pipelineQuery = useQuery({
    queryKey: ["audit-pipeline", cycleId],
    queryFn: () => auditApi.getPipeline(cycleId!),
    enabled: !!cycleId,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && !data.ready ? 1500 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, zone }: { file: File; zone: DocumentZone }) =>
      auditApi.uploadDocument(cycleId!, file, zone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["audit-documents", cycleId] });
      qc.invalidateQueries({ queryKey: ["audit-pipeline", cycleId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => auditApi.deleteDocument(cycleId!, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["audit-documents", cycleId] });
      qc.invalidateQueries({ queryKey: ["audit-pipeline", cycleId] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => auditApi.analyze(cycleId!),
    onSuccess: (data) => {
      setFindings(data.findings);
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

  useEffect(() => {
    if (pipelineQuery.data?.ready && cycleId && !findings && !analyzedRef.current) {
      analyzedRef.current = true;
      analyzeMutation.mutate();
    }
  }, [pipelineQuery.data?.ready, cycleId, findings]);

  const refreshAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["audit-documents", cycleId] });
    qc.invalidateQueries({ queryKey: ["audit-pipeline", cycleId] });
  }, [qc, cycleId]);

  const value = useMemo<AuditCtx>(
    () => ({
      cycle: cycleQuery.data ?? null,
      documents: docsQuery.data ?? [],
      pipeline: pipelineQuery.data ?? null,
      findings,
      report,
      messages,
      apiOnline: healthQuery.isSuccess,
      loading: cycleQuery.isLoading || docsQuery.isLoading,
      uploadFile: async (file, zone) => {
        if (!cycleId) throw new Error("No audit cycle");
        await uploadMutation.mutateAsync({ file, zone });
      },
      deleteDocument: async (docId) => {
        await deleteMutation.mutateAsync(docId);
      },
      runAnalysis: async () => analyzeMutation.mutateAsync(),
      askQuestion: async (question) => queryMutation.mutateAsync(question),
      loadReport: async () => reportMutation.mutateAsync(),
      exportReportPdf: async () => exportMutation.mutateAsync(),
      refreshAll,
      llmAvailable: healthQuery.data?.llm_available ?? false,
      llmProvider: healthQuery.data?.llm_provider ?? null,
    }),
    [
      cycleQuery.data,
      docsQuery.data,
      pipelineQuery.data,
      findings,
      report,
      messages,
      healthQuery.isSuccess,
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
