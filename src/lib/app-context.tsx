import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export type Lang = "ar" | "en";

type AppCtx = {
  theme: Theme;
  lang: Lang;
  dir: "rtl" | "ltr";
  toggleTheme: () => void;
  toggleLang: () => void;
  t: (key: keyof typeof AR) => string;
};

const AR = {
  // App shell
  appName: "منصة الإنماء الذكية للتدقيق",
  appSub: "مدعومة بمحرك RAGulator AI",
  navMain: "القوائم الرئيسية",
  navDashboard: "لوحة التحكم",
  navIngestion: "تهيئة بيئة التدقيق",
  navWorkspace: "مساحة عمل التدقيق",
  navReport: "تقرير ICAAP النهائي",
  secureConn: "اتصال آمن بمؤسسة النقد",
  lastSync: "آخر مزامنة قبل ٣ دقائق · إصدار ٢٠٢٥.١١",
  logout: "تسجيل الخروج",
  searchPh: "ابحث في اللوائح والتقارير...",
  userName: "فهد العتيبي",
  userInitials: "فع",
  userRole: "المدقق المالي المعتمد",
  uploadWorkspace: "مساحة الرفع والمعالجة",
  workflowReviewAndAnalyze: "المراجعة والتحليل",
  workflowFinalReport: "التقرير النهائي",
  dragDrop: "اسحب وأفلت الملفات",
  browse: "استعراض الملفات",
  queue: "قائمة الانتظار",
  processing: "المعالجة",
  ocr: "التعرف الضوئي (OCR)",
  chunking: "التجزئة الدلالية",
  embedding: "بناء المتجهات",
  indexing: "الفهرسة",
  ready: "جاهز للذكاء الاصطناعي",
  themeToggle: "تبديل السمة",
  langToggle: "English",

  // Dashboard
  dashTitle: "نظام الإنماء للتدقيق الذكي — ICAAP",
  dashSubtitle: "لوحة التحكم التنفيذية · تقييم كفاية رأس المال الداخلي السنوي",
  statReportsLabel: "المستندات المؤرشفة في قاعدة المعرفة",
  statReportsTrend: "+٨ منذ آخر دورة",
  statComplianceLabel: "نسبة الالتزام لمتطلبات SAMA",
  statComplianceTrend: "ضمن الحدود المستهدفة",
  statAlertsLabel: "التنبيهات الرقابية النشطة",
  statAlertsValue: "١ تنبيه نشط",
  statAlertsTrend: "يتطلب المراجعة",
  alertTitle: "تنبيه رقابي: فجوة محتملة في نسبة تغطية السيولة (LCR) — دورة ICAAP 2026",
  alertBody:
    "رصد المحرك الذكي اختلافاً بين القوائم المالية السنوية لبنك الإنماء (ص ١٢) والحد الأدنى المطلوب في تحديثات مؤسسة النقد لعام ٢٠٢٦.",
  alertCta: "مراجعة التعارض",
  startNewAudit: "بدء دورة تدقيق ICAAP",
  recentProjects: "دورات ICAAP السابقة",
  viewAll: "عرض الكل",
  colName: "اسم الدورة / المستند",
  colDate: "تاريخ الاعتماد",
  colType: "المرحلة",
  colStatus: "الحالة",
  statusCompleted: "مكتمل",
  statusInReview: "قيد المراجعة",
  row1Name: "تقرير ICAAP السنوي ٢٠٢٥",
  row1Date: "١٥ فبراير ٢٠٢٥",
  row1Type: "مُعتمد ومقدَّم إلى SAMA",
  row2Name: "تقرير ICAAP السنوي ٢٠٢٤",
  row2Date: "٢٠ فبراير ٢٠٢٤",
  row2Type: "مُعتمد ومقدَّم إلى SAMA",
  row3Name: "دورة ICAAP 2026 — مراجعة الأدلة والنتائج",
  row3Date: "قيد التنفيذ",
  row3Type: "مساحة عمل التدقيق",
  row4Name: "دورة ICAAP 2026 — تهيئة بيئة التدقيق",
  row4Date: "قيد التنفيذ",
  row4Type: "رفع المستندات والمعالجة",
  row5Name: "تقرير ICAAP السنوي ٢٠٢٣",
  row5Date: "١٨ فبراير ٢٠٢٣",
  row5Type: "مُعتمد ومقدَّم إلى SAMA",

  // Ingestion
  ingTitle: "تهيئة بيئة تدقيق ICAAP 2026",
  ingSubtitle: "ارفع المستندات الداعمة لدورة ICAAP السنوية — مدخلات محرك التدقيق الذكي",
  ingSecureTitle: "بيئة معزولة ومشفرة نهاية إلى نهاية",
  ingSecureBody: "جميع الملفات تُعالَج داخل شبكة بنك الإنماء الداخلية · التزام تام بلوائح SAMA CSF",
  zone1Title: "تقارير ICAAP السابقة",
  zone1Hint: "تقارير ICAAP للسنوات ٢٠٢٣–٢٠٢٥",
  zone2Title: "التقارير السنوية والقوائم المالية",
  zone2Hint: "التقارير السنوية والقوائم المالية المدققة",
  zone3Title: "لوائح SAMA وإفصاحات بازل والسياسات الداخلية",
  zone3Hint: "PDF · Excel · Word — لوائح ICAAP وبازل وسياسات المخاطر",
  uploadSuccess: "تم الرفع بنجاح",
  maxSize: "الحد الأقصى ٥٠ ميجابايت",
  ragTitle: "محرك RAG — معالجة المستندات",
  ragSubtitle: "استخراج، تجزئة دلالية، وبناء المتجهات الذكية",
  ragStep1: "تم استخراج وقراءة الجداول المالية والنصوص من التقارير واللوائح بنجاح",
  ragStep2: "تم الانتهاء من التجزئة الدلالية وبناء المتجهات الذكية (LlamaIndex & Qdrant)",
  ragStep3: "جاري العمل على ربط المصادر ومطابقتها دلالياً لربطها بتقرير الـ ICAAP...",
  plTitle: "معالجة المستندات آلياً",
  plSubtitle: "تسلسل مراحل المعالجة الفورية للمصادر · جاهزية قاعدة المعرفة لدورة ICAAP 2026",
  plUploading: "الرفع",
  plExtracting: "استخراج النص",
  plOcr: "التعرف الضوئي (OCR)",
  plChunking: "التجزئة الدلالية",
  plEmbedding: "بناء المتجهات",
  plIndexing: "الفهرسة",
  plKbUpdated: "تحديث قاعدة المعرفة",
  plReady: "جاهز",
  plStatusDone: "مكتمل",
  plStatusRunning: "قيد التنفيذ",
  plStatusPending: "بانتظار",
  // Uploaded documents inventory (ingestion)
  invTitle: "المستندات المرفوعة لدورة ICAAP 2026",
  invSubtitle: "مدخلات محرك التدقيق الذكي · مصادر معتمدة لتوليد التقرير",
  invColName: "اسم الملف",
  invColType: "نوع المستند",
  invColTime: "وقت الرفع",
  invColStatus: "حالة المعالجة",
  invColProgress: "التقدم",
  invColActions: "إجراءات",
  invActPreview: "معاينة",
  invActReindex: "إعادة الفهرسة",
  invActDelete: "حذف",
  invType1: "تقرير ICAAP سابق",
  invType2: "قائمة مالية سنوية",
  invType3: "لائحة SAMA",
  invType4: "إفصاح بازل",
  invType5: "سياسة داخلية",
  invStatusReady: "جاهز",
  invStatusProcessing: "قيد المعالجة",
  invStatusQueued: "في الانتظار",
  invFile1: "ICAAP_Annual_Report_2025.pdf",
  invFile2: "Alinma_Annual_Report_2025.pdf",
  invFile3: "SAMA_ICAAP_Guidelines_2026.pdf",
  invFile4: "Basel_III_Pillar3_Disclosures.pdf",
  invFile5: "Internal_Credit_Risk_Policy_v4.docx",
  invFile6: "Financial_Statements_FY2025.xlsx",
  // Findings panel (workspace)
  fpTitle: "ملاحظات التدقيق والفجوات",
  fpSubtitle: "أدلة مسترجعة ومقترحات تحسين لدورة ICAAP 2026",
  fpFindings: "النتائج الرئيسية",
  fpCompliance: "ملاحظات الالتزام",
  fpMissing: "معلومات ناقصة",
  fpSuggestions: "مقترحات تحسين",
  fpFinding1: "نسبة كفاية رأس المال ١٩.٥٪ متوافقة مع متطلبات بازل ٣ وSAMA.",
  fpCompliance1: "تم استيفاء جميع بنود اختبارات الجهد بموجب منهجية SAMA لعام ٢٠٢٦.",
  fpMissing1: "لم يتم رفع تحليل حساسية سعر الفائدة لعام ٢٠٢٥ (مطلوب لبند ٥.٣).",
  fpSuggestion1: "توسيع تحليل التركز الائتماني ليشمل قطاع المقاولات إلى جانب العقارات.",
  fpApprove: "اعتماد ومتابعة توليد التقرير النهائي",

  // Workspace
  wsTitle: "مساحة عمل التدقيق",
  wsSubtitle: "مراجعة الأدلة المسترجعة، ملاحظات الالتزام، والفجوات قبل توليد تقرير ICAAP النهائي",
  wsChatHeader: "مراجعة الأدلة المسترجعة والملاحظات",
  wsSourceHeader: "ملف المصدر: إفصاحات بازل ٣ - الربع الثالث.pdf",
  wsAuditor: "المدقق المالي",
  wsAssistant: "AIdit — المساعد الذكي",
  wsUserQuestion: "هل يغطي رأس المال الحالي للبنك مخاطر التركز الائتماني في قطاع العقارات؟",
  wsAiAnswer:
    "نعم، بناءً على إفصاحات بازل ٣ لبنك الإنماء (الربع الثالث)، فإن نسبة كفاية رأس المال (CAR) تبلغ",
  wsAiAnswerCont:
    ". وفي حال تطبيق سيناريو الضغط الشديد حسب لوائح SAMA، فإن رأس المال الاقتصادي الإضافي كافٍ لتغطية تركزات القطاع العقاري.",
  wsInputPh: "اسأل المساعد الذكي عن أي بند أو معلومة مالية...",
  wsConfidence: "درجة الثقة",
  wsSourceDoc: "المستند المصدر",
  wsSourceDocVal: "بازل ٣ · الربع الثالث",
  wsPageNo: "رقم الصفحة",
  wsPageNoVal: "ص ٤٥",
  wsChunk: "مقطع مسترجع",
  wsShowQuote: "عرض المقطع المسترجع",
  wsHideQuote: "إخفاء الاقتباس",
  wsQuoteText:
    "«بلغت نسبة كفاية رأس المال (CAR) لدى بنك الإنماء ١٩.٥٪ كما في ٣٠ سبتمبر ٢٠٢٥، متجاوزةً الحد الأدنى المطلوب من مؤسسة النقد العربي السعودي والبالغ ١٠.٥٪ (شامل احتياطي الحفاظ على رأس المال)…»",
  wsSrc1: "تقرير الإنماء المالي (ص ٤٥)",
  wsSrc2: "وثيقة SAMA للـ ICAAP (بند ٤.٢)",
  copy: "نسخ",
  export: "تصدير",
  wsPdfTitle: "إفصاحات بازل ٣ — الربع الثالث ٢٠٢٥",
  wsPdfP1:
    "يهدف هذا التقرير إلى استعراض متطلبات كفاية رأس المال وفقاً لإطار بازل ٣ المعتمد من مؤسسة النقد العربي السعودي (SAMA)، ويشمل الإفصاحات الكمية والنوعية عن مكونات رأس المال الرقابي والأصول المرجحة بالمخاطر.",
  wsPdfH1: "بلغت نسبة كفاية رأس المال (CAR) لدى بنك الإنماء ١٩.٥٪ كما في ٣٠ سبتمبر ٢٠٢٥،",
  wsPdfP2:
    "متجاوزةً الحد الأدنى المطلوب من مؤسسة النقد العربي السعودي والبالغ ١٠.٥٪ (شامل احتياطي الحفاظ على رأس المال).",
  wsPdfP3: "فيما يتعلق بمخاطر التركز الائتماني، لوحظ ارتفاع نسبي في التعرضات لقطاع العقارات التجارية.",
  wsPdfH2:
    "وقد أُجريت اختبارات جهد سيناريو الضغط الشديد وفقاً لمنهجية SAMA (بند ٤.٢) لقياس مدى كفاية رأس المال الاقتصادي لتغطية هذه التركزات.",
  wsPdfP4:
    "تشير النتائج إلى أن رأس المال الاقتصادي الإضافي المخصص لمخاطر التركز يبلغ ٢٫١ مليار ريال سعودي، وهو ما يوفر هامش أمان كافٍ حتى في السيناريوهات القصوى المفترضة في تحديثات مؤسسة النقد لعام ٢٠٢٥.",
  wsPdfFooter: "الصفحة ٤٥ من ٩٢ — قسم إدارة المخاطر",

  // Report
  rpTitle: "تقرير ICAAP النهائي — دورة ٢٠٢٦",
  rpSubtitle: "المسودة النهائية للتقرير السنوي المقدَّم إلى مؤسسة النقد العربي السعودي",
  rpConfidenceLabel: "درجة الثقة والدقة",
  rpConfidenceHigh: "مستوى ثقة مرتفع جداً",
  rpAccuracy: "دقة",
  rpCompliantTitle: "متوافق بالكامل",
  rpCompliantBody: "متوافق بالكامل مع معايير SAMA ومتطلبات لجنة بازل ٣ لإدارة المخاطر.",
  rpChecklist: "قائمة التحقق",
  rpCheck1: "كفاية رأس المال (CAR)",
  rpCheck2: "اختبارات الجهد (Stress Testing)",
  rpCheck3: "مخاطر التركز الائتماني",
  rpCheck4: "مخاطر السيولة (LCR)",
  rpCheck5: "الحوكمة وإدارة المخاطر",
  rpDeptHeader: "بنك الإنماء — الإدارة العامة لإدارة المخاطر",
  rpDocTitle: "تقرير تقييم كفاية رأس المال الداخلي (ICAAP) — التقرير السنوي ٢٠٢٦",
  rpDocMeta: "مقدَّم إلى مجلس الإدارة ومؤسسة النقد العربي السعودي · دورة ٢٠٢٦ · المسودة النهائية",
  rpSec1Title: "١. الملخص التنفيذي",
  rpSec1Body:
    "يعرض هذا التقرير نتائج تقييم بنك الإنماء لكفاية رأس المال الداخلي وفقاً لمتطلبات مؤسسة النقد العربي السعودي وإطار بازل ٣. بلغت نسبة كفاية رأس المال الإجمالية ١٩.٥٪، متجاوزةً الحد الأدنى الرقابي بنسبة كافية لاستيعاب سيناريوهات الضغط الشديد.",
  rpSec2Title: "٢. الحوكمة وإدارة المخاطر",
  rpSec2Body:
    "تعتمد إدارة المخاطر في بنك الإنماء على إطار حوكمة متكامل يشمل لجنة المخاطر المنبثقة عن مجلس الإدارة، ولجنة الأصول والخصوم (ALCO)، ولجنة الاستثمار. ويُطبَّق نموذج خطوط الدفاع الثلاثة لضمان الاستقلالية والمتابعة الرقابية.",
  rpSec3Title: "٣. اختبارات الجهد (Stress Testing)",
  rpSec3Body:
    "أُجريت اختبارات جهد شاملة على ثلاث فئات من السيناريوهات: الأساسي، الضاغط، والضاغط الشديد. أظهرت النتائج متانة رأس المال حتى في أسوأ الافتراضات، مع بقاء نسبة كفاية رأس المال أعلى من الحد الأدنى المطلوب في جميع السيناريوهات.",
  rpSec4Title: "٤. تركز مخاطر الائتمان",
  rpSec4Body:
    "خُصِّص رأس مال اقتصادي إضافي بقيمة ٢٫١ مليار ريال لتغطية تركزات القطاع العقاري، وذلك بناءً على منهجية المتطلبات الرأسمالية الاقتصادية المعتمدة من SAMA (بند ٤.٢).",
  rpSec5Title: "٥. الاستنتاجات والتوصيات",
  rpSec5Body:
    "يخلص التقرير إلى أن بنك الإنماء يحتفظ بمستوى رأس مال يفوق الحد الأدنى المطلوب بشكل مريح، مع توصيات بتعزيز آليات مراقبة نسبة تغطية السيولة (LCR) في الربع الرابع.",
  rpSubmit: "إرسال للاعتماد النهائي",
  rpExport: "تصدير التقرير بصيغة PDF",
  rpSaveDraft: "حفظ كمسودة",
} as const;

const EN: Record<keyof typeof AR, string> = {
  appName: "Alinma Intelligent Audit Platform",
  appSub: "Powered by RAGulator AI",
  navMain: "Main Menu",
  navDashboard: "Dashboard",
  navIngestion: "Prepare Audit Environment",
  navWorkspace: "Audit Workspace",
  navReport: "Final ICAAP Report",
  secureConn: "Secure link to SAMA",
  lastSync: "Synced 3m ago · v2025.11",
  logout: "Sign out",
  searchPh: "Search regulations and reports...",
  userName: "Fahad Al-Otaibi",
  userInitials: "FO",
  userRole: "Certified Financial Auditor",
  uploadWorkspace: "Upload & processing",
  workflowReviewAndAnalyze: "Review & analysis",
  workflowFinalReport: "Final report",
  dragDrop: "Drag & drop files",
  browse: "Browse files",
  queue: "Upload queue",
  processing: "Processing",
  ocr: "OCR",
  chunking: "Chunking",
  embedding: "Embedding",
  indexing: "Indexing",
  ready: "Ready for AI",
  themeToggle: "Toggle theme",
  langToggle: "العربية",

  dashTitle: "Alinma Smart Audit System — ICAAP",
  dashSubtitle: "Executive dashboard · Annual Internal Capital Adequacy Assessment Process",
  statReportsLabel: "Documents indexed in the knowledge base",
  statReportsTrend: "+8 since last cycle",
  statComplianceLabel: "SAMA compliance rate",
  statComplianceTrend: "Within target range",
  statAlertsLabel: "Active regulatory alerts",
  statAlertsValue: "1 active alert",
  statAlertsTrend: "Requires review",
  alertTitle: "Regulatory alert: potential LCR gap — ICAAP 2026 cycle",
  alertBody:
    "The AI engine detected a discrepancy between Alinma Bank's annual financial statements (p.12) and the minimum threshold in SAMA's 2026 updates.",
  alertCta: "Review discrepancy",
  startNewAudit: "Start ICAAP audit cycle",
  recentProjects: "Previous ICAAP cycles",
  viewAll: "View all",
  colName: "Cycle / document",
  colDate: "Approval date",
  colType: "Stage",
  colStatus: "Status",
  statusCompleted: "Completed",
  statusInReview: "In review",
  row1Name: "ICAAP Annual Report 2025",
  row1Date: "15 Feb 2025",
  row1Type: "Approved & submitted to SAMA",
  row2Name: "ICAAP Annual Report 2024",
  row2Date: "20 Feb 2024",
  row2Type: "Approved & submitted to SAMA",
  row3Name: "ICAAP 2026 — Evidence & findings review",
  row3Date: "In progress",
  row3Type: "Audit workspace",
  row4Name: "ICAAP 2026 — Environment preparation",
  row4Date: "In progress",
  row4Type: "Document ingestion",
  row5Name: "ICAAP Annual Report 2023",
  row5Date: "18 Feb 2023",
  row5Type: "Approved & submitted to SAMA",

  ingTitle: "Prepare ICAAP 2026 audit environment",
  ingSubtitle: "Upload supporting documents for the annual ICAAP cycle — inputs for the AI audit engine",
  ingSecureTitle: "Isolated, end-to-end encrypted environment",
  ingSecureBody:
    "All files are processed inside Alinma Bank's internal network · Fully compliant with SAMA CSF regulations",
  zone1Title: "Previous ICAAP reports",
  zone1Hint: "ICAAP annual reports 2023–2025",
  zone2Title: "Annual reports & financial statements",
  zone2Hint: "Audited annual reports and financial statements",
  zone3Title: "SAMA guidelines, Basel documents & internal policies",
  zone3Hint: "PDF · Excel · Word — ICAAP, Basel and risk policy documents",
  uploadSuccess: "Uploaded successfully",
  maxSize: "Max 50 MB",
  ragTitle: "RAG engine — document processing",
  ragSubtitle: "Extraction, semantic chunking, and vector embedding",
  ragStep1: "Financial tables and text from reports and regulations extracted successfully",
  ragStep2: "Semantic chunking and smart vector embedding completed (LlamaIndex & Qdrant)",
  ragStep3: "Linking and semantically matching sources to the ICAAP report...",
  plTitle: "Automated document processing",
  plSubtitle: "Real-time ingestion stages · Knowledge base readiness for ICAAP 2026",
  plUploading: "Uploading",
  plExtracting: "Extracting text",
  plOcr: "OCR",
  plChunking: "Chunking",
  plEmbedding: "Embedding",
  plIndexing: "Indexing",
  plKbUpdated: "Knowledge base updated",
  plReady: "Ready",
  plStatusDone: "Completed",
  plStatusRunning: "In progress",
  plStatusPending: "Pending",

  wsTitle: "Audit workspace",
  wsSubtitle: "Review retrieved evidence, compliance observations, and gaps before generating the final ICAAP report",
  wsChatHeader: "Review retrieved evidence & findings",
  wsSourceHeader: "Source file: Basel III Disclosures — Q3.pdf",
  wsAuditor: "Financial Auditor",
  wsAssistant: "AIdit — AI Assistant",
  wsUserQuestion:
    "Does the bank's current capital cover credit concentration risk in the real estate sector?",
  wsAiAnswer:
    "Yes, based on Alinma Bank's Basel III disclosures (Q3), the Capital Adequacy Ratio (CAR) stands at",
  wsAiAnswerCont:
    ". Under a severe stress scenario per SAMA regulations, the additional economic capital is sufficient to cover the real estate sector concentrations.",
  wsInputPh: "Ask the AI assistant about any clause or financial figure...",
  wsConfidence: "Confidence",
  wsSourceDoc: "Source document",
  wsSourceDocVal: "Basel III · Q3",
  wsPageNo: "Page",
  wsPageNoVal: "p. 45",
  wsChunk: "Retrieved chunk",
  wsShowQuote: "Show retrieved passage",
  wsHideQuote: "Hide passage",
  wsQuoteText:
    "\"Alinma Bank's Capital Adequacy Ratio (CAR) reached 19.5% as of 30 Sep 2025, exceeding SAMA's minimum requirement of 10.5% (including the capital conservation buffer)…\"",
  wsSrc1: "Alinma Financial Report (p. 45)",
  wsSrc2: "SAMA ICAAP document (§ 4.2)",
  copy: "Copy",
  export: "Export",
  wsPdfTitle: "Basel III Disclosures — Q3 2025",
  wsPdfP1:
    "This report presents Capital Adequacy requirements under the Basel III framework adopted by SAMA, including quantitative and qualitative disclosures on regulatory capital components and risk-weighted assets.",
  wsPdfH1:
    "Alinma Bank's Capital Adequacy Ratio (CAR) reached 19.5% as of 30 Sep 2025,",
  wsPdfP2:
    "exceeding SAMA's minimum requirement of 10.5% (including the capital conservation buffer).",
  wsPdfP3:
    "Regarding credit concentration risk, a relative increase was observed in exposures to the commercial real estate sector.",
  wsPdfH2:
    "Severe stress-test scenarios were conducted per SAMA methodology (§ 4.2) to gauge the sufficiency of economic capital to cover these concentrations.",
  wsPdfP4:
    "Results indicate that the additional economic capital allocated to concentration risk amounts to SAR 2.1 billion, providing a safety margin even under the most extreme scenarios in SAMA's 2025 updates.",
  wsPdfFooter: "Page 45 of 92 — Risk Management Division",

  rpTitle: "Final ICAAP Report — 2026 cycle",
  rpSubtitle: "Final draft of the annual report submitted to the Saudi Central Bank (SAMA)",
  rpConfidenceLabel: "Confidence & accuracy",
  rpConfidenceHigh: "Very high confidence",
  rpAccuracy: "Accuracy",
  rpCompliantTitle: "Fully compliant",
  rpCompliantBody:
    "Fully compliant with SAMA standards and Basel III risk management requirements.",
  rpChecklist: "Checklist",
  rpCheck1: "Capital Adequacy Ratio (CAR)",
  rpCheck2: "Stress Testing",
  rpCheck3: "Credit concentration risk",
  rpCheck4: "Liquidity risk (LCR)",
  rpCheck5: "Governance & risk management",
  rpDeptHeader: "Alinma Bank — Group Risk Management",
  rpDocTitle: "Internal Capital Adequacy Assessment Process (ICAAP) — Annual Report 2026",
  rpDocMeta: "Submitted to the Board and Saudi Central Bank (SAMA) · 2026 cycle · Final draft",
  rpSec1Title: "1. Executive Summary",
  rpSec1Body:
    "This report presents Alinma Bank's Internal Capital Adequacy Assessment results in line with SAMA requirements and the Basel III framework. The overall Capital Adequacy Ratio reached 19.5%, exceeding the regulatory minimum with sufficient headroom to absorb severe stress scenarios.",
  rpSec2Title: "2. Governance & Risk Management",
  rpSec2Body:
    "Risk management at Alinma Bank relies on an integrated governance framework including the Board Risk Committee, the Asset-Liability Committee (ALCO), and the Investment Committee. A three-lines-of-defence model ensures independence and oversight.",
  rpSec3Title: "3. Stress Testing",
  rpSec3Body:
    "Comprehensive stress tests were conducted across three scenario classes: baseline, adverse, and severely adverse. Results demonstrate capital resilience even under the worst assumptions, with the Capital Adequacy Ratio remaining above the required minimum in all scenarios.",
  rpSec4Title: "4. Credit Concentration Risk",
  rpSec4Body:
    "An additional economic capital of SAR 2.1 billion has been allocated to cover real estate sector concentrations, based on the economic capital methodology approved by SAMA (§ 4.2).",
  rpSec5Title: "5. Conclusions & Recommendations",
  rpSec5Body:
    "The report concludes that Alinma Bank maintains a capital level comfortably above the regulatory minimum, with recommendations to strengthen LCR monitoring mechanisms in Q4.",
  rpSubmit: "Submit for final approval",
  rpExport: "Export report as PDF",
  rpSaveDraft: "Save as draft",
  invTitle: "Documents uploaded for the ICAAP 2026 cycle",
  invSubtitle: "Inputs to the AI audit engine · approved sources for report generation",
  invColName: "File name",
  invColType: "Document type",
  invColTime: "Upload time",
  invColStatus: "Processing status",
  invColProgress: "Progress",
  invColActions: "Actions",
  invActPreview: "Preview",
  invActReindex: "Re-index",
  invActDelete: "Delete",
  invType1: "Previous ICAAP report",
  invType2: "Annual financial statement",
  invType3: "SAMA guideline",
  invType4: "Basel disclosure",
  invType5: "Internal policy",
  invStatusReady: "Ready",
  invStatusProcessing: "Processing",
  invStatusQueued: "Queued",
  invFile1: "ICAAP_Annual_Report_2025.pdf",
  invFile2: "Alinma_Annual_Report_2025.pdf",
  invFile3: "SAMA_ICAAP_Guidelines_2026.pdf",
  invFile4: "Basel_III_Pillar3_Disclosures.pdf",
  invFile5: "Internal_Credit_Risk_Policy_v4.docx",
  invFile6: "Financial_Statements_FY2025.xlsx",
  fpTitle: "Audit findings & gaps",
  fpSubtitle: "Retrieved evidence and improvement suggestions for the ICAAP 2026 cycle",
  fpFindings: "Key findings",
  fpCompliance: "Compliance observations",
  fpMissing: "Missing information",
  fpSuggestions: "Improvement suggestions",
  fpFinding1: "CAR of 19.5% complies with Basel III and SAMA requirements.",
  fpCompliance1: "All stress-testing items satisfied under SAMA's 2026 methodology.",
  fpMissing1: "2025 interest-rate sensitivity analysis has not been uploaded (required for §5.3).",
  fpSuggestion1: "Extend credit concentration analysis to include the contracting sector alongside real estate.",
  fpApprove: "Approve & proceed to final report generation",
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    try {
      const t = (localStorage.getItem("alinma-theme") as Theme) || "light";
      const l = (localStorage.getItem("alinma-lang") as Lang) || "ar";
      setTheme(t);
      setLang(l);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    root.setAttribute("lang", lang);
    try {
      localStorage.setItem("alinma-theme", theme);
      localStorage.setItem("alinma-lang", lang);
    } catch {}
  }, [theme, lang]);

  const value = useMemo<AppCtx>(
    () => ({
      theme,
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      toggleTheme: () => setTheme((v) => (v === "light" ? "dark" : "light")),
      toggleLang: () => setLang((v) => (v === "ar" ? "en" : "ar")),
      t: (key) => (lang === "ar" ? AR[key] : EN[key]),
    }),
    [theme, lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (c) return c;
  // Safe fallback for components rendered outside the provider (e.g. SSR
  // shell, error boundaries). Keeps the app rendering with defaults.
  return {
    theme: "light" as Theme,
    lang: "ar" as Lang,
    dir: "rtl" as const,
    toggleTheme: () => {},
    toggleLang: () => {},
    t: (key: keyof typeof AR) => AR[key],
  };
}