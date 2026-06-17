const PROFILE_CACHE_KEY = "chat_wapp_profiles_v1";
const PIPELINES_CACHE_KEY = "chat_wapp_pipelines_v1";
const KINDLING_DECK_RESET_KEY = "kindling_deck_reset_2026_06_17_call_action_reset";
const PROFILE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PROFILE_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
];

const state = {
  token: localStorage.getItem("chat_wapp_token") || "",
  me: null,
  chats: [],
  settings: null,
  accessRules: [],
  pipelines: loadPipelinesCache(),
  activeChatId: localStorage.getItem("chat_wapp_chat") || "",
  pollTimer: null,
  route: window.location.pathname,
  profiles: loadProfileCache(),
  prototypeView: localStorage.getItem("kindling_view") || "deck",
  activeProspectId: localStorage.getItem("kindling_active_prospect") || "evolv3",
  dismissedProspects: loadPrototypeList("kindling_dismissed"),
  snoozedProspects: loadPrototypeList("kindling_snoozed"),
  actedProspects: loadPrototypeList("kindling_acted"),
  prototypeActivity: loadPrototypeList("kindling_activity"),
  deckViewMode: sessionStorage.getItem("kindling_deck_view_mode") || "focused",
  deckOrder: loadSessionList("kindling_deck_order"),
  sidebarCollapsed: sessionStorage.getItem("kindling_sidebar_collapsed") === "1",
  commandChatId: localStorage.getItem("kindling_command_chat") || "",
  commandMessages: [],
  commandOpen: false,
  commandStatus: "",
  commandValue: "",
  commandResult: "",
  commandConfirm: null,
  commandScopedProspectId: null,
  commandDocked: false,
  searchOpen: false,
  searchQuery: "",
  searchIndex: 0,
  prototypeModal: null,
};

const kindlingData = {
  prospects: [
    {
      id: "evolv3",
      company: "Evolv3",
      descriptor: "R&D tax advisory - West Perth, Western Australia - size unknown",
      offering: "Custom AI systems for SMEs",
      warmth: "cold",
      fitScore: 76,
      confidence: 0.95,
      dataRing: "enhanced",
      duplicateStatus: "unknown",
      mode: "signal_led",
      companySummary: "Perth-based R&D tax advisory firm helping Australian businesses navigate the R&D tax incentive, strengthen innovation management practices, and access eligible funding support.",
      whyNow: "No sharp timing trigger yet; the enriched profile shows documentation-heavy R&D advisory work and verified public contact paths.",
      gap: "R&D claims work likely depends on repeatable evidence gathering, eligibility checks, lodgement support, and audit-ready documentation.",
      angle: "Lead with a contained workflow audit around claim evidence intake and lodgement support.",
      contact: { name: "Evolv3 team", role: "Public contact path", email: "info@evolv3.net", phone: "1300 703 829", source: "Contact page", confidence: "High", contactUrl: "https://evolv3.net/contact-us/" },
      evidence: [
        { label: "Active website confirmed as evolv3.net", source: "Evolv3 homepage", captured: "16/06/2026", confidence: "High", url: "https://evolv3.net/", type: "website" },
        { label: "West Perth contact address, phone, and email published", source: "Contact us - Evolv3", captured: "16/06/2026", confidence: "High", url: "https://evolv3.net/contact-us/", type: "company" },
        { label: "R&D tax services include eligibility, lodgement, audit support, second opinions, and overseas advanced findings", source: "R&D tax services - Evolv3", captured: "16/06/2026", confidence: "High", url: "https://evolv3.net/rd-tax-services/", type: "pipeline_enrichment" },
        { label: "Homepage states the firm helps businesses across Australia", source: "Evolv3 homepage", captured: "16/06/2026", confidence: "Medium", url: "https://evolv3.net/", type: "scan" },
      ],
      services: ["R&D tax incentive advisory", "eligibility reviews", "registration and lodgement support", "audit support", "second opinions", "overseas advanced findings"],
      operatingAreas: ["Australia"],
      confidenceNotes: [
        "The provided website domain differs from the current public site and contact pages, which use evolv3.net.",
        "Location is supported by the published West Perth WA 6005 address.",
        "Services are inferred from homepage and services-page language, not from a formal service catalog.",
      ],
      fieldsUpdated: [
        { field: "website", value: "https://evolv3.net/", previousValue: "https://innovation-management-funding.com.au/", confidence: 0.97, sourceUrl: "https://evolv3.net/", reason: "The public homepage and contact page use evolv3.net as the active website." },
        { field: "location", value: "West Perth, Western Australia, Australia", previousValue: "Perth, Australia", confidence: 0.88, sourceUrl: "https://evolv3.net/contact-us/", reason: "The contact page publishes a West Perth WA 6005 street address." },
        { field: "industry", value: "R&D tax advisory", previousValue: "R&D tax advisory", confidence: 0.96, sourceUrl: "https://evolv3.net/", reason: "The homepage describes Evolv3 as a specialist R&D tax advisory company." },
        { field: "summary", value: "Evolv3 is a Perth-based R&D tax advisory firm helping Australian businesses navigate the R&D tax incentive, strengthen innovation management practices, and access funding support for eligible research and development activity.", previousValue: "", confidence: 0.92, sourceUrl: "https://evolv3.net/", reason: "The homepage and services pages support this company-level summary." },
        { field: "contact.phone", value: "1300 703 829", previousValue: "", confidence: 0.99, sourceUrl: "https://evolv3.net/contact-us/", reason: "The contact page publishes the phone number." },
        { field: "contact.email", value: "info@evolv3.net", previousValue: "", confidence: 0.99, sourceUrl: "https://evolv3.net/contact-us/", reason: "The contact page publishes the email address directly." },
      ],
      gaps: [
        "No independently verified LinkedIn or registry data was needed because the company site provided enough support for company-level fields.",
        "No authoritative source was found for employee count, founding date, or legal entity details in this step.",
      ],
      history: ["No outreach drafts recorded yet", "Enriched from current public site and contact page"],
      computeTrail: ["Created by scan", "Matched by scan", "Enriched company-level fields from public site", "No outreach draft recorded yet"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Created by scan" }, { stage: "Stage 1", cost: "$0", outcome: "Matched by scan" }, { stage: "Stage 2", cost: "$0", outcome: "Company enrichment complete" }],
      draft: "",
      hasOutreachDraft: false,
      status: "partial",
    },
    {
      id: "insight-advisory-group",
      company: "Insight Advisory Group",
      descriptor: "Accounting and business advisory - West Leederville, Perth, WA - size unknown",
      offering: "Custom AI systems for SMEs",
      warmth: "cold",
      fitScore: 82,
      confidence: 0.97,
      dataRing: "matched",
      duplicateStatus: "possible_duplicate",
      mode: "signal_led",
      companySummary: "West Leederville accounting, tax, bookkeeping, superannuation, consulting, valuation, M&A, wealth, and innovation advisory firm serving personal and business clients.",
      whyNow: "No sharp timing trigger yet; the enriched profile shows workflow-heavy advisory services, client-sensitive data, and verified public contact paths.",
      gap: "Professional services delivery likely depends on repeatable context capture, document handling, review loops, and principal judgment across multiple advisory lines.",
      angle: "Lead with a practical AI audit around advisory leverage, valuation and M&A context, and reducing manual client-work handoff.",
      contact: { name: "Insight team", role: "Public contact path", email: "info@insightperth.com", phone: "(08) 6315 2700", source: "Official website and contact page", confidence: "High", contactUrl: "https://insightperth.com/contact/" },
      evidence: [
        { label: "Official site redirects from insightperth.com.au to insightperth.com", source: "Insight Advisory Group homepage", captured: "16/06/2026", confidence: "High", url: "https://insightperth.com/", type: "pipeline_enrichment" },
        { label: "West Leederville office address, phone, and contact page verified", source: "Insight Advisory Group contact page", captured: "16/06/2026", confidence: "High", url: "https://insightperth.com/contact/", type: "pipeline_enrichment" },
        { label: "Published service lines include tax, bookkeeping, superannuation, consulting, valuations, M&A, wealth, and innovation", source: "Insight Advisory Group homepage", captured: "16/06/2026", confidence: "High", url: "https://insightperth.com/", type: "scan" },
        { label: "Data ring scored with possible duplicate and 0.97 confidence", source: "Profile metadata", captured: "16/06/2026", confidence: "High", url: "https://insightperth.com.au/", type: "scan" },
      ],
      services: ["Tax & Advisory", "Bookkeeping", "Superannuation", "Consulting", "Valuations", "Mergers & Acquisitions", "Wealth", "Innovation"],
      operatingAreas: ["West Leederville", "Perth", "Western Australia"],
      confidenceNotes: [
        "Official website redirects from insightperth.com.au to insightperth.com; canonical site used for the website field.",
        "Industry is inferred from the firm's stated service lines and may be broader than a formal taxonomy label.",
        "Operating areas are inferred from the Perth and West Leederville address and should not be treated as a full service-radius map.",
      ],
      fieldsUpdated: [
        { field: "website", value: "https://insightperth.com/", previousValue: "https://insightperth.com.au/", confidence: 0.98, sourceUrl: "https://insightperth.com/", reason: "The official site redirects to insightperth.com and presents it as the active canonical domain." },
        { field: "location", value: "West Leederville, Perth, WA", previousValue: "Perth, WA", confidence: 0.96, sourceUrl: "https://insightperth.com/contact/", reason: "The contact page lists the office address as L4/3 Loftus Street, West Leederville WA 6007." },
        { field: "contact.phone", value: "(08) 6315 2700", previousValue: "", confidence: 0.99, sourceUrl: "https://insightperth.com/contact/", reason: "The contact page and footer both publish this phone number." },
        { field: "contact.email", value: "info@insightperth.com", previousValue: "", confidence: 0.99, sourceUrl: "https://insightperth.com/", reason: "The homepage and footer publish this email address." },
        { field: "contact.contactUrl", value: "https://insightperth.com/contact/", previousValue: "", confidence: 0.98, sourceUrl: "https://insightperth.com/contact/", reason: "The official contact page is available and clearly designated for contacting the firm." },
      ],
      gaps: [
        "No independent source was needed beyond the official site.",
        "No additional public facts were verified for founding year or team size in the patch.",
        "Public evidence supports leverage, valuation, and advisory-workflow fit, but not an explicit current growth constraint.",
      ],
      history: ["No outreach drafts recorded yet", "Enriched with verified canonical website, Perth address, contact details, and service lines"],
      computeTrail: ["Created by scan", "Matched by scan", "Data ring scored with possible duplicate", "Enriched company-level fields from official site", "No outreach draft recorded yet"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Created by scan" }, { stage: "Stage 1", cost: "$0", outcome: "Matched by scan" }, { stage: "Stage 2", cost: "$0", outcome: "Company enrichment complete" }, { stage: "Stage 3", cost: "$0", outcome: "Fit synthesis recorded" }],
      draft: "",
      hasOutreachDraft: false,
      status: "partial",
    },
    {
      id: "complete-financial-planning",
      company: "Complete Financial Planning",
      descriptor: "Financial planning and wealth advisory - Midland, WA - size unknown",
      offering: "Custom AI systems for SMEs",
      warmth: "cold",
      fitScore: 74,
      confidence: 0.95,
      dataRing: "enhanced",
      duplicateStatus: "unknown",
      mode: "signal_led",
      companySummary: "Family-owned financial planning practice in Midland, WA providing strategic, ongoing advice for everyday families and small businesses across retirement, superannuation, insurance, wealth, and aged-care planning.",
      whyNow: "No sharp timing trigger yet; the enriched profile shows advice-heavy service work, verified contact paths, and a family-owned practice model where continuity and repeatable client context matter.",
      gap: "Ongoing financial advice likely depends on repeatable fact-finding, document handling, review preparation, and careful handoff across personal, business, insurance, and aged-care advice.",
      angle: "Lead with a contained audit around client review preparation, evidence intake, and reducing manual advice-work handoff.",
      contact: { name: "Complete team", role: "Public contact path", email: "admin@completefinancialplanning.net", phone: "(08) 9250 5599", source: "Official contact page", confidence: "High", contactUrl: "https://www.completefinancialplanning.net/contact/" },
      evidence: [
        { label: "Official website confirms Complete Financial Planning business profile", source: "Complete Financial Planning", captured: "16/06/2026", confidence: "High", url: "https://www.completefinancialplanning.net/", type: "pipeline_enrichment" },
        { label: "About page supports family-owned positioning and strategic ongoing advice", source: "About Us | Complete Financial Planning", captured: "16/06/2026", confidence: "High", url: "https://www.completefinancialplanning.net/about-us/", type: "pipeline_enrichment" },
        { label: "Services include retirement planning, SMSF, wealth creation, insurance, business risk, aged care, and Centrelink advice", source: "Services | Complete Financial Planning", captured: "16/06/2026", confidence: "High", url: "https://www.completefinancialplanning.net/services/", type: "pipeline_enrichment" },
        { label: "Official contact page publishes phone, email, and contact URL", source: "Contact | Complete Financial Planning", captured: "16/06/2026", confidence: "High", url: "https://www.completefinancialplanning.net/contact/", type: "pipeline_enrichment" },
      ],
      services: ["Retirement planning", "Superannuation and SMSF", "Wealth creation", "Personal insurance", "Business risk insurance", "Aged care and Centrelink advice"],
      operatingAreas: ["Western Australia", "Eastern states"],
      confidenceNotes: [
        "Website confirms the company is family owned and run.",
        "Service-area coverage is stated broadly as Western Australia and the eastern states, not a more granular territory map.",
        "Phone, email, and street address are sourced from the official contact page.",
      ],
      fieldsUpdated: [
        { field: "website", value: "https://www.completefinancialplanning.net", previousValue: "https://www.completefinancialplanning.net", confidence: 0.99, sourceUrl: "https://www.completefinancialplanning.net/", reason: "Official home page confirms the business website." },
        { field: "summary", value: "Family-owned financial planning practice in Midland, WA providing strategic, ongoing advice for everyday families and small businesses. The firm offers retirement planning, superannuation and SMSF, wealth creation, personal insurance, business risk insurance, and aged care/Centrelink advice.", previousValue: "", confidence: 0.94, sourceUrl: "https://www.completefinancialplanning.net/about-us/", reason: "About and services pages support a concise company-level summary." },
        { field: "services", value: "Retirement planning; Superannuation and SMSF; Wealth creation; Personal insurance; Business risk insurance; Aged care and Centrelink advice", previousValue: "", confidence: 0.96, sourceUrl: "https://www.completefinancialplanning.net/services/", reason: "Official services page lists these offerings." },
        { field: "operatingAreas", value: "Western Australia; eastern states", previousValue: "", confidence: 0.83, sourceUrl: "https://www.completefinancialplanning.net/", reason: "Home page states the company has clients from all around Western Australia and the eastern states." },
        { field: "contact", value: "(08) 9250 5599 | admin@completefinancialplanning.net | https://www.completefinancialplanning.net/contact/", previousValue: "", confidence: 0.98, sourceUrl: "https://www.completefinancialplanning.net/contact/", reason: "Official contact page publishes phone, email, and contact URL." },
      ],
      gaps: [
        "No independent third-party source was needed for this step; all supported facts came from the company site.",
        "A more granular operating-area map was not published.",
      ],
      history: ["No outreach drafts recorded yet", "Enriched from the company site with verified contact, services, and service-area details"],
      computeTrail: ["Created by scan", "Matched by scan", "Enhanced from company website", "No outreach draft recorded yet"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Created by scan" }, { stage: "Stage 1", cost: "$0", outcome: "Matched by scan" }, { stage: "Stage 2", cost: "$0", outcome: "Company enrichment complete" }],
      draft: "",
      hasOutreachDraft: false,
      status: "partial",
    },
    {
      id: "next-g-wealth",
      company: "Next G Wealth",
      descriptor: "Financial planning and wealth management - West Perth, WA 6005 - size unknown",
      offering: "Custom AI systems for SMEs",
      warmth: "cold",
      fitScore: 72,
      confidence: 0.95,
      dataRing: "enhanced",
      duplicateStatus: "unknown",
      mode: "signal_led",
      companySummary: "Boutique financial planning practice in Perth, WA offering fee-for-service advice focused on helping clients achieve financial and lifestyle goals with transparency, integrity, and simple fee structures.",
      whyNow: "No sharp timing trigger yet; the enriched profile shows advice-heavy financial planning work, verified phone reachability, and no public email path.",
      gap: "Fee-for-service wealth advice likely depends on repeatable discovery, document handling, review preparation, and clear client follow-through across planning, SMSF, debt, and insurance work.",
      angle: "Lead with a phone-first workflow audit around client review preparation and reducing manual advice-work handoff.",
      contact: { name: "Next G team", role: "Public contact path", email: "", phone: "(08) 9226 3639", source: "Official contact page", confidence: "High", contactUrl: "https://www.nextgwealth.com.au/contact-us" },
      evidence: [
        { label: "Homepage confirms boutique fee-for-service financial planning positioning", source: "Next G Wealth - Home", captured: "16/06/2026", confidence: "High", url: "https://www.nextgwealth.com.au/", type: "pipeline_enrichment" },
        { label: "Contact page confirms West Perth office address and phone number", source: "Next G Wealth - Contact Us", captured: "16/06/2026", confidence: "High", url: "https://www.nextgwealth.com.au/contact-us", type: "pipeline_enrichment" },
        { label: "Homepage lists investment, tax planning, SMSF, superannuation, retirement, debt, and life-risk insurance services", source: "Next G Wealth - Home", captured: "16/06/2026", confidence: "High", url: "https://www.nextgwealth.com.au/", type: "scan" },
      ],
      services: ["Investment and tax planning", "Self-managed super fund guidance", "Superannuation and retirement planning", "Home loan and personal debt strategy", "Life risk insurance"],
      operatingAreas: ["Perth, WA", "West Perth, WA"],
      confidenceNotes: [
        "Official site confirms boutique planning practice, fee-for-service positioning, and specialist services.",
        "Official contact page confirms West Perth office address and phone number.",
        "No public email address was verified on the current website pages reviewed.",
      ],
      fieldsUpdated: [
        { field: "location", value: "8/3 Lawrence Ave, West Perth WA 6005", previousValue: "West Perth, WA 6005", confidence: 0.97, sourceUrl: "https://www.nextgwealth.com.au/contact-us", reason: "Official contact page lists the office address in full." },
        { field: "summary", value: "Boutique financial planning practice in Perth, WA offering fee-for-service advice focused on helping clients achieve financial and lifestyle goals with transparency, integrity, and simple fee structures.", previousValue: "", confidence: 0.94, sourceUrl: "https://www.nextgwealth.com.au/", reason: "Homepage describes the firm as a boutique planning practice with fee-for-service positioning and stated values." },
        { field: "services", value: "Investment and tax planning; SMSF guidance; superannuation and retirement planning; home loan and personal debt strategy; life risk insurance", previousValue: "", confidence: 0.93, sourceUrl: "https://www.nextgwealth.com.au/", reason: "Homepage lists these specialist services explicitly." },
        { field: "contact.phone", value: "(08) 9226 3639", previousValue: "", confidence: 0.99, sourceUrl: "https://www.nextgwealth.com.au/contact-us", reason: "Contact page lists the phone number directly." },
        { field: "contact.contactUrl", value: "https://www.nextgwealth.com.au/contact-us", previousValue: "", confidence: 0.98, sourceUrl: "https://www.nextgwealth.com.au/contact-us", reason: "Official contact page is the public contact URL." },
      ],
      gaps: [
        "Verified public email address not found on the current official site pages reviewed.",
      ],
      history: ["No outreach drafts recorded yet", "Verified official website, West Perth office, phone number, boutique financial planning focus, and core services"],
      computeTrail: ["Created by scan", "Matched by scan", "Enhanced from official website", "No outreach draft recorded yet"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Created by scan" }, { stage: "Stage 1", cost: "$0", outcome: "Matched by scan" }, { stage: "Stage 2", cost: "$0", outcome: "Company enrichment complete" }],
      draft: "",
      hasOutreachDraft: false,
      status: "partial",
    },
    {
      id: "dry-kirkness",
      company: "Dry Kirkness",
      descriptor: "Chartered accounting - West Perth, WA, Australia - size unknown",
      offering: "Custom AI systems for SMEs",
      warmth: "cold",
      fitScore: 88,
      confidence: 0.98,
      dataRing: "matched",
      duplicateStatus: "possible_duplicate",
      mode: "signal_led",
      companySummary: "Established West Perth chartered accounting firm providing tax accounting, business advisory, audit and assurance, bookkeeping, SMSF, agribusiness, not-for-profit, virtual CFO, and cybersecurity audit services.",
      whyNow: "Careers content says the firm is experiencing significant growth and recruiting across audit, accounting, taxation, administration, and bookkeeping.",
      gap: "Multi-service accounting work likely creates repeatable compliance, reporting, audit, tax, advisory, and client-handoff workflows where controlled AI systems could reduce manual load.",
      angle: "Lead with a growth-capacity workflow audit around audit, tax, bookkeeping, and virtual CFO handoffs.",
      contact: { name: "Dry Kirkness team", role: "Public contact path", email: "dk@drykirkness.com.au", phone: "+61 8 9481 1118", source: "Official contact page", confidence: "High", contactUrl: "https://www.drykirkness.com.au/contact-us/" },
      evidence: [
        { label: "Official website verifies firm identity, services, and contact paths", source: "Dry Kirkness official site", captured: "16/06/2026", confidence: "High", url: "https://www.drykirkness.com.au/", type: "pipeline_enrichment" },
        { label: "Contact page publishes West Perth address, phone, email, and contact path", source: "Dry Kirkness contact page", captured: "16/06/2026", confidence: "High", url: "https://www.drykirkness.com.au/contact-us/", type: "pipeline_enrichment" },
        { label: "Services pages cover tax, advisory, audit, bookkeeping, SMSF, agribusiness, NFP, virtual CFO, and cybersecurity audits", source: "Dry Kirkness services pages", captured: "16/06/2026", confidence: "High", url: "https://www.drykirkness.com.au/services/", type: "pipeline_enrichment" },
        { label: "People and careers pages show public partners/directors plus active hiring and growth signals", source: "Dry Kirkness people and careers pages", captured: "16/06/2026", confidence: "High", url: "https://www.drykirkness.com.au/about-us/our-people/", type: "pipeline_enrichment" },
        { label: "Independent listings corroborate audit and assurance positioning", source: "Business News and WA Government contractor profile", captured: "16/06/2026", confidence: "Medium", url: "https://www.drykirkness.com.au/", type: "scan" },
      ],
      services: [
        "Tax accounting",
        "Business advisory",
        "Audit and assurance",
        "Bookkeeping",
        "Self-managed superannuation fund accounting",
        "Farm accounting and agribusiness advisory",
        "Not-for-profit accounting and audits",
        "Virtual CFO and outsourced accounting",
        "Cybersecurity and information system audits",
      ],
      operatingAreas: ["West Perth", "Perth", "Western Australia", "WA agribusiness regions", "Australia-facing services for international agribusiness interests"],
      confidenceNotes: [
        "Official website and contact details are strongly verified from company pages and independent Business News listing.",
        "Employee count and ranking are taken from Business News public listing and should be treated as directory data, not audited headcount.",
        "Blog/news activity was not verified beyond navigation/resources presence and older public PDFs/search results.",
        "No private employee data was collected; people signals are limited to public role/team pages and public careers content.",
      ],
      fieldsUpdated: [
        { field: "website", value: "https://www.drykirkness.com.au/", previousValue: "https://www.drykirkness.com.au/", confidence: 0.97, sourceUrl: "https://www.drykirkness.com.au/", reason: "Known website verified as official company site with matching name, services and contact details." },
        { field: "industry", value: "Chartered accounting", previousValue: "Chartered accounting", confidence: 0.94, sourceUrl: "https://www.drykirkness.com.au/about-us/", reason: "Official site and independent Business News listing describe Dry Kirkness as chartered accountants/accounting firm." },
        { field: "location", value: "West Perth, WA, Australia", previousValue: "West Perth WA", confidence: 0.96, sourceUrl: "https://www.drykirkness.com.au/contact-us/", reason: "Official contact page lists Ground Floor, 50 Colin Street, West Perth WA 6005." },
        { field: "summary", value: "Established West Perth chartered accounting firm providing tax, advisory, audit, bookkeeping, SMSF, agribusiness, NFP and virtual CFO services.", previousValue: "", confidence: 0.91, sourceUrl: "https://www.drykirkness.com.au/services/", reason: "Official services and about pages support the service mix and operating profile." },
        { field: "services", value: "Tax accounting; business advisory; audit and assurance; bookkeeping; SMSF; agribusiness; NFP accounting/audits; virtual CFO; cybersecurity/IS audits", previousValue: "", confidence: 0.91, sourceUrl: "https://www.drykirkness.com.au/services/", reason: "Official services navigation and service pages list these practice areas." },
        { field: "contact", value: "+61 8 9481 1118; dk@drykirkness.com.au; https://www.drykirkness.com.au/contact-us/", previousValue: "", confidence: 0.96, sourceUrl: "https://www.drykirkness.com.au/contact-us/", reason: "Official contact page publishes the phone, email and contact form path." },
        { field: "peopleSignals", value: "Public partners/directors page plus careers growth and vacancies", previousValue: "", confidence: 0.88, sourceUrl: "https://www.drykirkness.com.au/about-us/our-people/", reason: "Official people and careers pages provide public team and hiring signals." },
        { field: "fitSignals", value: "Professional-services workflow complexity, sensitive compliance data, growth pressure and multi-service operations", previousValue: "", confidence: 0.86, sourceUrl: "https://www.drykirkness.com.au/careers/", reason: "Fit inference is based on public services, hiring, client segments and compliance-heavy practice areas." },
      ],
      gaps: [
        "No specific recent dated blog/news posts were verified through available crawl results.",
        "No confirmed second office details beyond navigation mention of Subiaco were included because the location page did not return readable content.",
        "No direct evidence of current AI adoption or internal automation tooling was found.",
      ],
      history: ["No outreach drafts recorded yet", "Checked official services, contact, team, careers, Business News, directory, and WA Government contractor sources"],
      computeTrail: ["Created by scan", "Matched by scan", "Ranked by scan", "Enriched through official website, people/team, careers, search, and fit-signal strategies", "Manager approved enrichment coverage"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Created by scan" }, { stage: "Stage 1", cost: "$0", outcome: "Matched by scan" }, { stage: "Stage 2", cost: "$0", outcome: "Company enrichment complete" }, { stage: "Stage 3", cost: "$0", outcome: "Fit and hiring signals recorded" }],
      draft: "",
      hasOutreachDraft: false,
      status: "partial",
    },

  ],
  replies: [],
};

const kindlingModel = buildPrototypeDataModel(kindlingData.prospects);
kindlingData.prospects = projectDeckProspects(kindlingModel);

const $ = (id) => document.getElementById(id);

function buildPrototypeDataModel(prospects) {
  const now = Date.UTC(2026, 5, 9);
  const ownerCompany = {
    id: stableUuid("owner-company:kindling"),
    name: "Kindling",
    website: "https://kindling.example",
    location: "Perth, WA",
    summary: "Kindling surfaces matched prospects from source-backed enrichment and helps salespeople review the next best action.",
    createdAt: now,
    updatedAt: now,
  };
  const offeringNames = [...new Set(prospects.map((prospect) => prospect.offering))];
  const marketProfiles = offeringNames.map((offering, index) => {
    const profileKey = slugify(offering);
    const profileId = stableUuid(`market-profile:${profileKey}`);
    const versionId = stableUuid(`market-profile-version:${profileKey}:1`);
    return {
      id: profileId,
      ownerCompanyId: ownerCompany.id,
      profileKey,
      name: offering,
      targetSegment: inferTargetSegment(offering),
      currentVersionId: versionId,
      createdAt: now + index,
      updatedAt: now + index,
      currentVersion: {
        id: versionId,
        profileId,
        versionNumber: 1,
        summary: `${offering} positioning for the prototype deck.`,
        rationale: "Generated from the UX prototype seed data and shaped to the DataModel.md contract.",
        sourceReferences: [],
        structured: {
          profile: { profileKey, name: offering, targetSegment: inferTargetSegment(offering) },
          positioning: { statement: offering, proofPoints: ["Source-backed trigger", "Reachability check", "Human-reviewed outreach"] },
          services: [{ id: stableUuid(`service:${profileKey}`), key: profileKey, name: offering, description: offering, outcomes: [], deliveryModes: [], typicalBudgetBand: "" }],
          idealCustomerProfile: { industries: [], employeeCountBuckets: [], locations: ["Western Australia"], positiveSignals: [], exclusionRules: [] },
          buyingTriggers: [],
          outreachVoice: { tone: "plain-spoken", directness: "medium", proofThreshold: "source_backed_claims_only" },
          matchingRules: [],
        },
      },
    };
  });
  const profileByOffering = new Map(marketProfiles.map((profile) => [profile.name, profile]));
  const companies = prospects.map((prospect, index) => {
    const profile = profileByOffering.get(prospect.offering);
    const contactPaths = [
      prospect.contact.email ? { type: "email", value: prospect.contact.email, confidence: confidenceToNumber(prospect.contact.confidence) } : null,
      prospect.contact.phone ? { type: "phone", value: prospect.contact.phone, confidence: confidenceToNumber(prospect.contact.confidence) } : null,
    ].filter(Boolean);
    return {
      id: stableUuid(`company:${prospect.id}`),
      name: prospect.company,
      location: parseDescriptor(prospect.descriptor).location,
      industry: parseDescriptor(prospect.descriptor).industry,
      website: prospect.evidence.find((item) => item.type === "website")?.url || "",
      dataRing: prospect.dataRing || (prospect.status === "ready" ? "outreach" : prospect.status === "partial" ? "matched" : "enhanced"),
      duplicateStatus: prospect.duplicateStatus || "unique",
      enrichmentStatus: "complete",
      confidence: prospect.confidence ?? prospect.fitScore / 100,
      profile: {
        summary: prospect.companySummary || "",
        description: prospect.companySummary || "",
        servicesOffered: prospect.services || [],
        operatingAreas: prospect.operatingAreas || [],
        size: { employeeCountBucket: parseDescriptor(prospect.descriptor).employeeCountBucket, locationCount: 1, confidence: 0.7 },
        contactPaths,
        primaryPersonIds: [stableUuid(`person:${prospect.id}:${prospect.contact.name}`)],
        currentCustomerProfileVersionId: stableUuid(`customer-profile-version:${prospect.id}:1`),
        prototypeSlug: prospect.id,
        displayDescriptor: prospect.descriptor,
        mode: prospect.mode,
        whyNow: prospect.whyNow,
        wedge: prospect.angle,
        history: prospect.history,
        stageCosts: prospect.stageCosts,
        confidenceNotes: prospect.confidenceNotes || [],
        fieldsUpdated: prospect.fieldsUpdated || [],
        gaps: prospect.gaps || [],
        researchBrief: prospect.researchBrief || null,
        marketProfileName: prospect.offering,
        hasOutreachDraft: prospect.hasOutreachDraft !== false,
      },
      createdAt: now + index,
      updatedAt: now + index,
      marketProfileId: profile.id,
      marketProfileVersionId: profile.currentVersionId,
    };
  });
  const people = prospects.map((prospect, index) => {
    const company = companies[index];
    return {
      id: company.profile.primaryPersonIds[0],
      companyId: company.id,
      name: prospect.contact.name,
      role: prospect.contact.role,
      relationship: inferRelationship(prospect.contact.role),
      buyerConfidence: confidenceToNumber(prospect.contact.confidence),
      influencerConfidence: confidenceToNumber(prospect.contact.confidence),
      profileUrls: [],
      notes: `${prospect.contact.source}. ${prospect.contact.confidence} confidence.`,
      createdAt: now + index,
      updatedAt: now + index,
    };
  });
  const sources = prospects.flatMap((prospect, prospectIndex) => {
    const company = companies[prospectIndex];
    return prospect.evidence.map((item, sourceIndex) => ({
      id: stableUuid(`source:${prospect.id}:${sourceIndex}:${item.label}`),
      companyId: company.id,
      sourceType: normalizeSourceType(item.type),
      url: item.url,
      title: item.label,
      summary: `${item.source} - ${item.captured}`,
      extractedData: { captured: item.captured, originalType: item.type },
      confidence: confidenceToNumber(item.confidence),
      lastCheckedAt: item.captured === "Today" ? now : null,
      lastCheckedByRunId: item.captured === "Research brief" ? stableUuid(`run:${prospect.id}:research`) : null,
      termsNotes: "",
      createdAt: now + sourceIndex,
    }));
  });
  const matches = prospects.map((prospect, index) => {
    const company = companies[index];
    const profile = profileByOffering.get(prospect.offering);
    return {
      id: stableUuid(`match:${prospect.id}:${profile.profileKey}`),
      companyId: company.id,
      marketProfileId: profile.id,
      marketProfileVersionId: profile.currentVersionId,
      profileKey: profile.profileKey,
      rank: index + 1,
      reason: prospect.gap,
      score: {
        overallScore: prospect.fitScore,
        drivers: {
          serviceFit: Math.min(0.98, prospect.fitScore / 100),
          timing: prospect.whyNow ? 0.78 : 0.32,
          reachability: prospect.contact.email || prospect.contact.phone ? 0.75 : 0.28,
          evidenceQuality: prospect.status === "ready" ? 0.9 : prospect.status === "partial" ? 0.68 : 0.46,
        },
        matchedServices: [{ serviceKey: profile.profileKey, score: prospect.fitScore / 100, reason: prospect.gap }],
        risks: prospect.contact.email || prospect.contact.phone ? [] : ["No direct contact path found yet."],
        nextBestAction: prospect.contact.email ? "Review outreach email." : prospect.contact.phone ? "Call contact." : "Open dossier to find a path.",
      },
      createdAt: now + index,
    };
  });
  const outreachDrafts = prospects.flatMap((prospect, index) => {
    if (prospect.hasOutreachDraft === false) return [];
    const company = companies[index];
    const match = matches[index];
    const email = buildOutreachEmail(prospect);
    return [{
      id: stableUuid(`outreach:${prospect.id}:1`),
      companyId: company.id,
      companyMatchId: match.id,
      marketProfileId: match.marketProfileId,
      marketProfileVersionId: match.marketProfileVersionId,
      pitchText: email.body,
      subject: email.subject,
      sections: email.sections,
      writingRules: outreachWritingRules(),
      status: "draft",
      sourceRunId: stableUuid(`run:${prospect.id}:outreach`),
      createdAt: now + index,
      updatedAt: now + index,
    }];
  });
  const activities = prospects.flatMap((prospect, prospectIndex) => {
    const company = companies[prospectIndex];
    return [
      ...prospect.computeTrail.map((summary, index) => ({
        id: stableUuid(`activity:${prospect.id}:compute:${index}`),
        targetType: "company",
        targetId: company.id,
        actor: "pipeline",
        actionType: index === 3 ? "outreach_drafted" : "company_enhanced",
        summary,
        payload: { companyId: company.id },
        createdAt: now + index,
      })),
      ...prospect.history.map((summary, index) => ({
        id: stableUuid(`activity:${prospect.id}:history:${index}`),
        targetType: "company",
        targetId: company.id,
        actor: "system",
        actionType: "manual_note_added",
        summary,
        payload: { companyId: company.id },
        createdAt: now + 100 + index,
      })),
    ];
  });
  return { ownerCompany, marketProfiles, companies, people, sources, matches, outreachDrafts, activities, outreachFeedback: [] };
}

function projectDeckProspects(model) {
  const peopleByCompany = groupBy(model.people, "companyId");
  const sourcesByCompany = groupBy(model.sources, "companyId");
  const matchesByCompany = groupBy(model.matches, "companyId");
  const draftsByCompany = groupBy(model.outreachDrafts, "companyId");
  const activitiesByCompany = groupBy(model.activities, "targetId");
  const profilesById = new Map(model.marketProfiles.map((profile) => [profile.id, profile]));
  return model.companies
    .map((company) => {
      const person = peopleByCompany.get(company.id)?.[0] || {};
      const match = matchesByCompany.get(company.id)?.[0] || {};
      const draft = draftsByCompany.get(company.id)?.[0] || {};
      const profile = profilesById.get(match.marketProfileId);
      const profileData = company.profile || {};
      const companySources = sourcesByCompany.get(company.id) || [];
      const companyActivities = activitiesByCompany.get(company.id) || [];
      return {
        id: profileData.prototypeSlug || company.id,
        company: company.name,
        descriptor: profileData.displayDescriptor || [company.industry, company.location].filter(Boolean).join(" - "),
        offering: profile?.name || profileData.marketProfileName || match.profileKey || "Unassigned offering",
        warmth: deriveRelationshipTemperature(person, companySources, companyActivities),
        fitScore: match.score?.overallScore || Math.round(company.confidence * 100),
        dataRing: company.dataRing,
        duplicateStatus: company.duplicateStatus,
        confidence: company.confidence,
        mode: profileData.mode || "signal_led",
        whyNow: profileData.whyNow || "",
        gap: match.reason || profileData.summary || "",
        angle: profileData.wedge || match.score?.nextBestAction || "",
        substanceSummary: prospectSubstanceSummary(company, match),
        contact: {
          name: person.name || "Unknown contact",
          role: person.role || "Role unknown",
          email: company.profile?.contactPaths?.find((path) => path.type === "email")?.value || "",
          phone: company.profile?.contactPaths?.find((path) => path.type === "phone")?.value || "",
          source: person.notes || "No source recorded",
          confidence: numberToConfidence(person.buyerConfidence || 0),
        },
        evidence: companySources.map((source) => ({
          label: source.title,
          source: source.summary.split(" - ")[0],
          captured: source.extractedData?.captured || (source.lastCheckedAt ? "Checked" : "Unverified"),
          confidence: numberToConfidence(source.confidence),
          url: source.url || "",
          type: source.sourceType,
        })),
        history: profileData.history || companyActivities.map((activity) => activity.summary),
        computeTrail: companyActivities.filter((activity) => activity.actor === "pipeline").map((activity) => activity.summary),
        stageCosts: profileData.stageCosts || [],
        draft: draft.pitchText || "",
        emailSubject: draft.subject || "",
        emailSections: draft.sections || null,
        writingRules: draft.writingRules || outreachWritingRules(),
        status: company.dataRing === "outreach" ? "ready" : company.dataRing === "matched" ? "partial" : "degraded",
        researchBrief: profileData.researchBrief,
        modelRefs: {
          companyId: company.id,
          personId: person.id,
          matchId: match.id,
          marketProfileId: match.marketProfileId,
          marketProfileVersionId: match.marketProfileVersionId,
          outreachDraftId: draft.id,
        },
      };
    })
    .sort((a, b) => (model.matches.find((match) => match.id === a.modelRefs.matchId)?.rank || 999) - (model.matches.find((match) => match.id === b.modelRefs.matchId)?.rank || 999));
}

function groupBy(items, key) {
  return items.reduce((map, item) => {
    const value = item[key];
    map.set(value, [...(map.get(value) || []), item]);
    return map;
  }, new Map());
}

function stableUuid(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex}${hex.slice(0, 4)}`;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseDescriptor(descriptor) {
  const parts = descriptor.split(" - ");
  const employeeMatch = descriptor.match(/(\d+\+?)\s+(staff|experts)/i);
  const count = employeeMatch ? Number.parseInt(employeeMatch[1], 10) : 0;
  return {
    industry: parts[0] || "",
    location: parts[1] || "",
    employeeCountBucket: employeeCountBucket(count),
  };
}

function employeeCountBucket(count) {
  if (!count) return "";
  if (count < 5) return "<5";
  if (count <= 20) return "5-20";
  if (count <= 50) return "20-50";
  if (count <= 100) return "50-100";
  if (count <= 500) return "100-500";
  return "500+";
}

function inferTargetSegment(offering) {
  if (offering.includes("Website")) return "Companies with visible website refresh opportunities";
  if (offering.includes("AI")) return "SMEs with manual workflow pressure";
  if (offering.includes("Relationship")) return "Relationship-led SME advisory prospects";
  return "High-fit prospects for the selected offering";
}

function inferRelationship(role = "") {
  const normalized = role.toLowerCase();
  if (normalized.includes("founder") || normalized.includes("director") || normalized.includes("cfo")) return "decision_maker";
  return "operator";
}

function normalizeSourceType(type) {
  const map = {
    website: "company_website",
    scan: "company_website",
    performance: "technology_profile",
    "job board": "job_ad",
    registry: "business_register",
    "first-party": "event",
    company: "company_website",
    proptech: "technology_profile",
    "third-party": "news",
    market: "news",
  };
  return map[type] || "manual_note";
}

function deriveRelationshipTemperature(person = {}, sources = [], activities = []) {
  const sourceHasWarmPath = sources.some((source) => {
    const haystack = `${source.sourceType || ""} ${source.title || ""} ${source.summary || ""}`.toLowerCase();
    return source.sourceType === "event" || /\b(first-party|event|roundtable|newsletter|shared|mutual|attended|prior outreach)\b/.test(haystack);
  });
  const activityHasWarmPath = activities.some((activity) => /\b(first-party|event|roundtable|newsletter|shared|mutual|attended|prior outreach)\b/i.test(activity.summary || ""));
  const relationshipLooksWarm = /\bknown|warm|mutual|referral|prior|event|attendee\b/i.test(`${person.relationship || ""} ${person.notes || ""}`);
  return sourceHasWarmPath || activityHasWarmPath || relationshipLooksWarm ? "warm" : "cold";
}

function confidenceToNumber(confidence) {
  if (typeof confidence === "number") return confidence;
  const map = { High: 0.86, Medium: 0.62, Low: 0.34 };
  return map[confidence] || 0.5;
}

function numberToConfidence(confidence) {
  if (confidence >= 0.75) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

function outreachWritingRules() {
  return [
    "No em dashes.",
    "No contrast framing.",
    "No fake familiarity.",
    "No unsupported claims.",
    "One trigger, one offer, one CTA.",
    "Use an interest CTA, not a calendar CTA.",
    "Keep the first draft under 120 words.",
  ];
}

function buildOutreachEmail(prospect) {
  const firstName = prospect.contact.name.split(" ")[0];
  const subject = cleanOutreachText(emailSubject(prospect));
  const sections = {
    opener: cleanOutreachText(`Hi ${firstName}, ${openerLine(prospect)}`),
    observation: cleanOutreachText(observationLine(prospect)),
    wedge: cleanOutreachText(wedgeLine(prospect)),
    credibility: cleanOutreachText(credibilityLine(prospect)),
    cta: cleanOutreachText(ctaLine(prospect)),
  };
  const body = [sections.opener, [sections.observation, sections.wedge].filter(Boolean).join(" "), sections.credibility, sections.cta]
    .filter(Boolean)
    .join("\n\n");
  return { subject, sections, body };
}

function openerLine(prospect) {
  return prospect.whyNow || prospect.gap || `had a quick thought about ${prospect.company}.`;
}

function observationLine(prospect) {
  return prospect.gap;
}

function wedgeLine(prospect) {
  return prospect.angle;
}

function credibilityLine(prospect) {
  const firstPartySignal = prospect.evidence?.find((item) => item.type === "first-party" || item.source?.includes("First-party"));
  if (firstPartySignal) return `I am basing this on ${firstPartySignal.source.toLowerCase()}, not a generic list scrape.`;
  return "";
}

function ctaLine(prospect) {
  return "Worth a quick look?";
}

function cleanOutreachText(value) {
  return String(value || "")
    .replaceAll("—", ", ")
    .replaceAll("–", "-")
    .replace(/\bnot\s+([^,.!?]+),?\s+but\s+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function api(path, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(state.token ? { authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(async (res) => {
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || res.statusText);
    return payload;
  });
}

function setStatus(text) {
  $("status").textContent = text;
}

function loadProfileCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function loadPipelinesCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PIPELINES_CACHE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadPrototypeList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadSessionList(key) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePipelinesCache() {
  localStorage.setItem(PIPELINES_CACHE_KEY, JSON.stringify(state.pipelines));
}

function saveProfileCache() {
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(state.profiles));
}

function cachedProfile(pubkey) {
  const entry = state.profiles[pubkey];
  if (!entry || Date.now() - Number(entry.cachedAt || 0) > PROFILE_CACHE_TTL_MS) return null;
  return entry;
}

function displayNameForRule(rule, profile) {
  return profile?.displayName || profile?.name || `${rule.npub.slice(0, 12)}...${rule.npub.slice(-6)}`;
}

function profileInitial(rule, profile) {
  return displayNameForRule(rule, profile).slice(0, 1).toUpperCase();
}

function appRoute() {
  if (["/act", "/chat", "/settings"].includes(window.location.pathname)) return window.location.pathname;
  return "/";
}

function navigate(path) {
  if (window.location.pathname !== path) history.pushState({}, "", path);
  state.route = path;
  void renderRoute();
}

function showOnly(id) {
  for (const sectionId of ["login", "home", "actPage", "settingsPage", "shell"]) {
    $(sectionId).classList.toggle("hidden", sectionId !== id);
  }
}

function stopPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = null;
}

async function renderRoute() {
  state.route = appRoute();
  if (!state.token || !state.me) {
    stopPolling();
    showOnly("login");
    return;
  }

  if (state.route === "/" || state.route === "/act") {
    stopPolling();
    showOnly("actPage");
    renderActPrototype();
    return;
  }

  if (state.route === "/chat") {
    showOnly("shell");
    await loadChatScreen();
    startPolling();
    return;
  }

  stopPolling();
  if (state.route === "/settings") {
    showOnly("settingsPage");
    await loadSettings();
    return;
  }

  showOnly("home");
}

async function login() {
  $("loginError").textContent = "";
  if (!window.nostr) {
    $("loginError").textContent = "No Nostr browser extension was found.";
    return;
  }
  try {
    const pubkey = await window.nostr.getPublicKey();
    const challenge = await api("/api/auth/challenge", {
      method: "POST",
      body: JSON.stringify({ pubkey }),
    });
    const event = await window.nostr.signEvent({
      kind: 22242,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["challenge", challenge.nonce], ["client", "chat-wapp"]],
      content: challenge.content,
    });
    const result = await api("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ event }),
    });
    state.token = result.token;
    state.me = result;
    localStorage.setItem("chat_wapp_token", result.token);
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    await bootApp();
  } catch (error) {
    $("loginError").textContent = error.message;
  }
}

async function bootApp() {
  try {
    state.me = await api("/api/me");
    $("npub").textContent = state.me.npub;
    await renderRoute();
    void resolveCurrentUserProfile().then(() => {
      if (state.route === "/" || state.route === "/act") renderActPrototype();
    });
  } catch {
    logout();
  }
}

function logout() {
  state.token = "";
  state.me = null;
  state.activeChatId = "";
  localStorage.removeItem("chat_wapp_token");
  localStorage.removeItem("chat_wapp_chat");
  stopPolling();
  showOnly("login");
}

async function loadChatScreen() {
  await loadChats();
  if (!state.activeChatId || !state.chats.find((chat) => chat.id === state.activeChatId)) {
    if (state.chats[0]) state.activeChatId = state.chats[0].id;
    else await newChat();
  }
  await loadActiveChat();
}

async function loadChats() {
  const payload = await api("/api/chats");
  state.chats = payload.chats || [];
  renderChats();
}

async function loadSettings() {
  const payload = await api("/api/settings");
  state.settings = payload.settings;
  state.accessRules = payload.accessRules || [];
  renderSettings();
  renderPipelineOptions();
  renderAccessRules();
}

function renderSettings() {
  $("autopilotUrlInput").value = state.settings?.autopilotUrl || "";
  $("pipelineInput").value = state.settings?.defaultPipeline || "";
  const canEdit = Boolean(state.me?.access?.edit);
  for (const id of ["autopilotUrlInput", "pipelineInput", "pipelineSelect", "saveSettingsButton", "accessNpubInput", "accessRoleSelect", "addAccessButton"]) {
    $(id).disabled = !canEdit;
  }
}

function renderPipelineOptions() {
  const select = $("pipelineSelect");
  select.innerHTML = "";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = state.pipelines.length ? "Select a pipeline" : "No pipelines loaded";
  select.appendChild(empty);
  for (const pipeline of state.pipelines) {
    const option = document.createElement("option");
    option.value = pipeline.name || pipeline.slug || pipeline.id;
    option.textContent = `${pipeline.name || pipeline.slug || pipeline.id}${pipeline.version ? ` v${pipeline.version}` : ""}`;
    select.appendChild(option);
  }
}

function renderAccessRules() {
  const list = $("accessList");
  list.innerHTML = "";
  const canEdit = Boolean(state.me?.access?.edit);
  for (const rule of state.accessRules) {
    const item = document.createElement("div");
    item.className = "accessItem";
    item.dataset.pubkey = rule.pubkey;
    const profile = cachedProfile(rule.pubkey);
    const identity = document.createElement("div");
    identity.className = "accessIdentity";
    const avatar = document.createElement("div");
    avatar.className = "accessAvatar";
    if (profile?.picture) {
      const img = document.createElement("img");
      img.src = profile.picture;
      img.alt = "";
      avatar.appendChild(img);
    } else {
      avatar.textContent = profileInitial(rule, profile);
    }
    const label = document.createElement("div");
    label.className = "accessLabel";
    const name = document.createElement("strong");
    name.textContent = displayNameForRule(rule, profile);
    const meta = document.createElement("span");
    meta.textContent = `${rule.role === "edit" ? "Edit" : "Read"} - ${rule.npub}`;
    label.append(name, meta);
    identity.append(avatar, label);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Remove";
    button.disabled = !canEdit;
    button.addEventListener("click", () => removeAccessRule(rule));
    item.append(identity, button);
    list.appendChild(item);
    if (!profile) {
      void resolveProfile(rule).then(() => updateAccessRuleProfile(rule));
    }
  }
}

function updateAccessRuleProfile(rule) {
  const item = $(`accessList`).querySelector(`[data-pubkey="${CSS.escape(rule.pubkey)}"]`);
  const profile = cachedProfile(rule.pubkey);
  if (!item || !profile) return;
  const avatar = item.querySelector(".accessAvatar");
  const name = item.querySelector(".accessLabel strong");
  if (avatar) {
    avatar.innerHTML = "";
    if (profile.picture) {
      const img = document.createElement("img");
      img.src = profile.picture;
      img.alt = "";
      avatar.appendChild(img);
    } else {
      avatar.textContent = profileInitial(rule, profile);
    }
  }
  if (name) name.textContent = displayNameForRule(rule, profile);
}

async function resolveProfile(rule) {
  const existing = cachedProfile(rule.pubkey);
  if (existing) return existing;
  const profile = await fetchNostrProfile(rule.pubkey).catch(() => null);
  const normalized = {
    pubkey: rule.pubkey,
    name: typeof profile?.name === "string" ? profile.name : "",
    displayName: typeof profile?.display_name === "string" ? profile.display_name : typeof profile?.displayName === "string" ? profile.displayName : "",
    picture: typeof profile?.picture === "string" ? profile.picture : "",
    cachedAt: Date.now(),
  };
  state.profiles[rule.pubkey] = normalized;
  saveProfileCache();
  return normalized;
}

function currentUserPubkey() {
  return state.me?.pubkey || state.me?.publicKey || state.me?.pub_key || "";
}

function currentUserProfile() {
  const pubkey = currentUserPubkey();
  return pubkey ? cachedProfile(pubkey) : null;
}

async function resolveCurrentUserProfile() {
  if (!state.me) return null;
  let pubkey = currentUserPubkey();
  if (!pubkey && window.nostr?.getPublicKey) {
    pubkey = await window.nostr.getPublicKey().catch(() => "");
    if (pubkey) state.me.pubkey = pubkey;
  }
  if (!pubkey) return null;
  return resolveProfile({ pubkey, npub: state.me.npub || pubkey });
}

async function fetchNostrProfile(pubkey) {
  const attempts = PROFILE_RELAYS.map((relay) => fetchProfileFromRelay(relay, pubkey));
  const result = await Promise.any(attempts);
  return result;
}

function fetchProfileFromRelay(relayUrl, pubkey) {
  return new Promise((resolve, reject) => {
    const subId = `profile-${pubkey.slice(0, 8)}-${Math.random().toString(16).slice(2)}`;
    let bestEvent = null;
    let settled = false;
    const socket = new WebSocket(relayUrl);
    const timer = setTimeout(() => {
      finish(bestEvent ? parseProfileEvent(bestEvent) : null);
    }, 2500);

    function finish(value, error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        socket.send(JSON.stringify(["CLOSE", subId]));
      } catch {}
      try {
        socket.close();
      } catch {}
      if (error || !value) reject(error || new Error("profile not found"));
      else resolve(value);
    }

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify(["REQ", subId, { kinds: [0], authors: [pubkey], limit: 1 }]));
    });
    socket.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!Array.isArray(message)) return;
      if (message[0] === "EVENT" && message[1] === subId && message[2]?.kind === 0) {
        if (!bestEvent || Number(message[2].created_at || 0) > Number(bestEvent.created_at || 0)) bestEvent = message[2];
      }
      if (message[0] === "EOSE" && message[1] === subId) finish(bestEvent ? parseProfileEvent(bestEvent) : null);
    });
    socket.addEventListener("error", () => finish(null, new Error(`relay failed: ${relayUrl}`)));
  });
}

function parseProfileEvent(event) {
  const profile = JSON.parse(event.content || "{}");
  return profile && typeof profile === "object" && !Array.isArray(profile) ? profile : null;
}

async function saveSettings() {
  try {
    const payload = await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        autopilotUrl: $("autopilotUrlInput").value.trim(),
        defaultPipeline: $("pipelineInput").value.trim(),
      }),
    });
    state.settings = payload.settings;
    renderSettings();
    setStatus("Settings saved");
  } catch (error) {
    setStatus(error.message);
  }
}

async function loadPipelines() {
  try {
    setStatus("Authorizing pipeline list");
    const prepared = await api("/api/autopilot/pipelines", { method: "POST", body: "{}" });
    let payload = prepared;
    if (prepared.requiresAutopilotAuth && prepared.triggerRequest) {
      const autopilotAuthorization = await signNip98Request(prepared.triggerRequest);
      payload = await api("/api/autopilot/pipelines", {
        method: "POST",
        body: JSON.stringify({ autopilotAuthorization }),
      });
    }
    state.pipelines = payload.pipelines || [];
    savePipelinesCache();
    renderPipelineOptions();
    setStatus(`Loaded ${state.pipelines.length} pipelines`);
  } catch (error) {
    setStatus(error.message);
  }
}

async function addAccess() {
  try {
    const payload = await api("/api/access-rules", {
      method: "POST",
      body: JSON.stringify({
        npub: $("accessNpubInput").value.trim(),
        role: $("accessRoleSelect").value,
      }),
    });
    state.accessRules = payload.accessRules || [];
    $("accessNpubInput").value = "";
    renderAccessRules();
    setStatus("Access updated");
  } catch (error) {
    setStatus(error.message);
  }
}

async function removeAccessRule(rule) {
  try {
    const payload = await api(`/api/access-rules/${encodeURIComponent(rule.role)}/${encodeURIComponent(rule.npub)}`, {
      method: "DELETE",
    });
    state.accessRules = payload.accessRules || [];
    renderAccessRules();
    setStatus("Access updated");
  } catch (error) {
    setStatus(error.message);
  }
}

function renderChats() {
  const list = $("chatList");
  list.innerHTML = "";
  for (const chat of state.chats) {
    const button = document.createElement("button");
    button.className = `chatItem${chat.id === state.activeChatId ? " active" : ""}`;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong").textContent = chat.title;
    button.querySelector("span").textContent = chat.preview || "No messages yet";
    button.addEventListener("click", async () => {
      state.activeChatId = chat.id;
      localStorage.setItem("chat_wapp_chat", chat.id);
      renderChats();
      await loadActiveChat();
    });
    list.appendChild(button);
  }
}

async function newChat() {
  const payload = await api("/api/chats", { method: "POST", body: "{}" });
  state.activeChatId = payload.chat.id;
  localStorage.setItem("chat_wapp_chat", state.activeChatId);
  await loadChats();
  await loadActiveChat();
}

async function loadActiveChat() {
  if (!state.activeChatId) return;
  const payload = await api(`/api/chats/${encodeURIComponent(state.activeChatId)}/messages`);
  $("chatTitle").textContent = payload.chat.title;
  renderMessages(payload.messages || []);
  renderChats();
}

function renderMessages(messages) {
  const box = $("messages");
  box.innerHTML = "";
  for (const message of messages) {
    const node = document.createElement("div");
    node.className = `message ${message.role} ${message.status}`;
    node.textContent = message.status === "pending" ? "Thinking..." : message.content;
    box.appendChild(node);
  }
  box.scrollTop = box.scrollHeight;
  const pending = messages.some((message) => message.status === "pending");
  setStatus(pending ? "Pipeline running" : "Ready");
}

async function sendMessage(event) {
  event.preventDefault();
  const input = $("messageInput");
  const content = input.value.trim();
  if (!content || !state.activeChatId) return;
  input.value = "";
  $("sendButton").disabled = true;
  try {
    const payload = await api(`/api/chats/${encodeURIComponent(state.activeChatId)}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    renderMessages(payload.messages || []);
    if (payload.requiresAutopilotAuth && payload.triggerRequest) {
      setStatus("Authorizing pipeline");
      const autopilotAuthorization = await signNip98Request(payload.triggerRequest);
      const started = await api(`/api/pipeline-runs/${encodeURIComponent(payload.runId)}/start`, {
        method: "POST",
        body: JSON.stringify({ autopilotAuthorization }),
      });
      renderMessages(started.messages || []);
    }
    await loadChats();
  } catch (error) {
    setStatus(error.message);
  } finally {
    $("sendButton").disabled = false;
    input.focus();
  }
}

async function signNip98Request(triggerRequest) {
  if (!window.nostr) throw new Error("No Nostr browser extension was found.");
  const tags = [
    ["u", triggerRequest.url],
    ["method", triggerRequest.method || "POST"],
  ];
  if (triggerRequest.body !== undefined) {
    const bodyJson = JSON.stringify(triggerRequest.body);
    tags.push(["payload", await sha256Hex(bodyJson)]);
  }
  const event = await window.nostr.signEvent({
    kind: 27235,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: "",
  });
  return `Nostr ${base64Utf8(JSON.stringify(event))}`;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function base64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function startPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    if (state.route === "/chat" && state.activeChatId && state.token) {
      await loadActiveChat().catch(() => undefined);
      await loadChats().catch(() => undefined);
    }
  }, 1500);
}

function savePrototypeState() {
  localStorage.setItem("kindling_view", state.prototypeView);
  localStorage.setItem("kindling_active_prospect", state.activeProspectId);
  localStorage.setItem("kindling_dismissed", JSON.stringify(state.dismissedProspects));
  localStorage.setItem("kindling_snoozed", JSON.stringify(state.snoozedProspects));
  localStorage.setItem("kindling_acted", JSON.stringify(state.actedProspects));
  localStorage.setItem("kindling_activity", JSON.stringify(state.prototypeActivity.slice(0, 12)));
  sessionStorage.setItem("kindling_deck_view_mode", state.deckViewMode);
  sessionStorage.setItem("kindling_deck_order", JSON.stringify(normalizedDeckOrder()));
}

function normalizedDeckOrder() {
  const ids = kindlingData.prospects.map((prospect) => prospect.id);
  return [...state.deckOrder.filter((id) => ids.includes(id)), ...ids.filter((id) => !state.deckOrder.includes(id))];
}

function orderedProspects() {
  const byId = new Map(kindlingData.prospects.map((prospect) => [prospect.id, prospect]));
  return normalizedDeckOrder().map((id) => byId.get(id)).filter(Boolean);
}

function availableProspects() {
  return orderedProspects().filter((prospect) => {
    return !state.dismissedProspects.includes(prospect.id) && !state.snoozedProspects.includes(prospect.id) && !state.actedProspects.includes(prospect.id);
  });
}

function deckProgress() {
  const total = kindlingData.prospects.length;
  const remaining = availableProspects().length;
  const completed = total - remaining;
  return { total, remaining, completed, current: remaining ? completed + 1 : total };
}

function resetPrototypeDeckState() {
  state.dismissedProspects = [];
  state.snoozedProspects = [];
  state.actedProspects = [];
  state.prototypeActivity = [];
  state.deckOrder = [];
  state.deckViewMode = "focused";
  state.prototypeModal = null;
  state.activeProspectId = kindlingData.prospects[0]?.id || "";
  savePrototypeState();
}

function applyOneTimeDeckReset() {
  if (localStorage.getItem(KINDLING_DECK_RESET_KEY) === "1") return;
  resetPrototypeDeckState();
  localStorage.setItem(KINDLING_DECK_RESET_KEY, "1");
}

function greetingState() {
  const progress = deckProgress();
  const openRepliesCount = kindlingData.replies.length;
  const quietThreads = kindlingData.replies
    .filter((thread) => thread.state === "gone quiet")
    .map((thread) => ({ ...thread, quietDays: Number.parseInt(thread.age, 10) || 0 }))
    .sort((a, b) => b.quietDays - a.quietDays);
  const coldest = quietThreads[0];
  return {
    firstName: "Adam",
    deckTotal: progress.total,
    deckRemaining: progress.remaining,
    deckStarted: progress.completed > 0,
    lightDeckThreshold: 3,
    openRepliesCount,
    coldestQuietDays: coldest?.quietDays || 0,
    coldestQuietContactFirstName: coldest?.contact?.split(" ")[0] || "",
    quietThresholdDays: 3,
  };
}

function timeSalutation(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function greetingCopy() {
  const details = greetingState();
  const topProspect = activeProspect();
  const hasQuietThread = details.coldestQuietDays >= details.quietThresholdDays;
  let status;

  if (details.deckTotal === 0) status = "Nothing queued. Tune an offering.";
  else if (details.deckRemaining === 0 && hasQuietThread) status = `${details.coldestQuietContactFirstName} needs a nudge.`;
  else if (details.deckRemaining === 0 && details.openRepliesCount > 0) status = `${details.openRepliesCount} replies to move.`;
  else if (details.deckRemaining === 0) status = "All clear. Nice work.";
  else if (hasQuietThread) status = `${details.deckRemaining} left. Nudge ${details.coldestQuietContactFirstName}.`;
  else if (details.deckStarted) status = `${details.deckRemaining} left. Keep the run going.`;
  else if (details.deckTotal <= details.lightDeckThreshold) status = `Light deck. ${details.deckTotal} sharp looks.`;
  else if (topProspect?.warmth === "warm") status = `${details.deckTotal} fresh. Start warm.`;
  else status = `${details.deckTotal} fresh. Best card first.`;

  return {
    salutation: `${timeSalutation()}, ${details.firstName}`,
    status,
  };
}

function renderGreeting() {
  const copy = greetingCopy();
  return `
    <section class="homeGreeting">
      <h1>${copy.salutation}</h1>
      <p>${copy.status}</p>
    </section>
  `;
}

function commandEntities() {
  const companies = kindlingData.prospects.map((prospect) => ({ type: "company", label: prospect.company, id: prospect.id }));
  const contacts = kindlingData.prospects.map((prospect) => ({ type: "contact", label: prospect.contact.name, id: prospect.id }));
  const offerings = [...new Set(kindlingData.prospects.map((prospect) => prospect.offering))].map((label) => ({ type: "offering", label, id: label }));
  return [...companies, ...contacts, ...offerings];
}

function activeProspect() {
  const available = availableProspects();
  return available.find((prospect) => prospect.id === state.activeProspectId) || available[0] || kindlingData.prospects[0];
}

function setPrototypeView(view, prospectId = state.activeProspectId) {
  state.prototypeView = view;
  state.activeProspectId = prospectId;
  savePrototypeState();
  renderActPrototype();
}

function recordPrototypeActivity(type, prospect, detail) {
  state.prototypeActivity = [
    {
      id: `${Date.now()}-${prospect.id}`,
      type,
      company: prospect.company,
      detail,
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    ...state.prototypeActivity,
  ].slice(0, 12);
}

function renderActPrototype() {
  const page = $("actPage");
  const view = state.prototypeView || "deck";
  const commandScope = view === "deck" && state.deckViewMode !== "overview" ? "card" : "global";
  page.innerHTML = `
    <div class="kindlingShell ${state.sidebarCollapsed ? "sidebarClosed" : ""} ${state.commandOpen && state.commandDocked ? "commandDrawerOpen" : ""} ${state.commandOpen && !state.commandDocked ? "commandFloatingOpen" : ""}">
      <aside class="kindlingNav" aria-label="Kindling navigation">
        <div class="brandLockup">
          <div class="brandMark">
            <img src="/kindling-logo.png" alt="" />
            <strong>Kindling</strong>
          </div>
          <button class="sidebarToggle" type="button" data-action="toggle-sidebar" aria-label="${state.sidebarCollapsed ? "Open sidebar" : "Close sidebar"}">${iconSvg(state.sidebarCollapsed ? "panelRightOpen" : "panelLeftClose")}</button>
        </div>
        <button class="sidebarSearch" type="button" data-action="open-search" title="Search">
          ${iconSvg("search")}
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
        ${renderPrototypeNav(view)}
        ${renderSidebarUserPanel()}
      </aside>
      <section class="kindlingMain">
        ${renderPrototypeView(view)}
      </section>
      ${renderCommandDrawer()}
      <button class="agentBottomTrigger" type="button" data-action="open-command" data-command-scope="${commandScope}" aria-label="Ask Athena"><img src="/athena-avatar.png" alt="" /><span>Ask Athena</span></button>
    </div>
    ${state.searchOpen ? renderSearchPalette() : ""}
    ${state.prototypeModal ? renderPrototypeModal() : ""}
  `;
  bindPrototypeEvents();
  window.requestAnimationFrame(() => {
    const thread = $("commandThread");
    if (thread) thread.scrollTop = thread.scrollHeight;
  });
}

function renderPrototypeNav(active) {
  const progress = deckProgress();
  const items = [
    { id: "deck", label: "Deck", icon: "layers", count: progress.remaining, countType: "work" },
    { id: "replies", label: "Replies", icon: "inbox", count: kindlingData.replies.length, countType: "work" },
    { id: "offerings", label: "Offerings", icon: "sliders", count: 3, countType: "inventory" },
    { id: "pipeline", label: "Pipeline", icon: "workflow", count: "", countType: "none" },
  ];
  return `<nav class="prototypeNav">${items.map((item) => `
    <button class="${active === item.id ? "active" : ""}" type="button" data-view="${item.id}" title="${item.label}">
      ${iconSvg(item.icon)}
      <span>${item.label}</span>${item.count !== "" ? `<em class="${item.countType}">${item.count}</em>` : ""}
    </button>
  `).join("")}
  </nav>`;
}

function renderSidebarUserPanel() {
  const label = currentUserLabel();
  const detail = currentUserDetail();
  const picture = currentUserPicture();
  return `
    <section class="sidebarUserPanel" aria-label="Logged in user">
      <div class="sidebarUserAvatar" aria-hidden="true">${picture ? `<img src="${escapeHtml(picture)}" alt="" />` : userInitial(label)}</div>
      <div class="sidebarUserText">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(detail)}</span>
      </div>
      <button class="btn btn-ghost iconButton sidebarLogout" type="button" data-action="logout" aria-label="Log out" title="Log out">${iconSvg("logOut")}</button>
    </section>
  `;
}

function currentUserLabel() {
  const profile = currentUserProfile();
  const fullName = [state.me?.firstName || state.me?.first_name, state.me?.lastName || state.me?.last_name].filter(Boolean).join(" ");
  const profileFullName = [state.me?.profile?.firstName || state.me?.profile?.first_name, state.me?.profile?.lastName || state.me?.profile?.last_name].filter(Boolean).join(" ");
  return fullName || profileFullName || profile?.displayName || profile?.name || state.me?.profile?.displayName || state.me?.profile?.display_name || state.me?.profile?.name || state.me?.name || "Nostr user";
}

function currentUserDetail() {
  return shortenNpub(state.me?.npub || state.me?.pubkey || "Signed in");
}

function currentUserPicture() {
  const profile = currentUserProfile();
  return profile?.picture || state.me?.profile?.picture || state.me?.profile?.image || state.me?.profile?.avatar || state.me?.picture || state.me?.image || state.me?.avatar || "";
}

function shortenNpub(value) {
  const text = String(value || "");
  if (text.length <= 18) return text;
  return `${text.slice(0, 10)}...${text.slice(-6)}`;
}

function userInitial(label) {
  return String(label || "K").trim().slice(0, 1).toUpperCase() || "K";
}

function iconSvg(name) {
  const icons = {
    layers: `<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>`,
    inbox: `<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z"/>`,
    sliders: `<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>`,
    workflow: `<rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="13" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/>`,
    search: `<path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="7"/>`,
    maximize2: `<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="M9 21H3v-6"/><path d="m3 21 7-7"/>`,
    minimize2: `<path d="M4 14h6v6"/><path d="m10 14-7 7"/><path d="M20 10h-6V4"/><path d="m14 10 7-7"/>`,
    x: `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
    logOut: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>`,
    fileText: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>`,
    panelLeftClose: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>`,
    panelRightOpen: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/>`,
  };
  return `<svg class="appIcon navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.layers}</svg>`;
}

function renderPrototypeView(view) {
  if (view === "replies") return renderRepliesView();
  if (view === "dossier") return renderDossierView(activeProspect());
  if (view === "offerings") return renderOfferingsView();
  if (view === "pipeline") return renderPipelineView();
  return renderDeckView();
}

function renderDeckView() {
  const prospects = availableProspects();
  const prospect = activeProspect();
  const progress = deckProgress();
  const mode = state.deckViewMode === "overview" ? "overview" : "focused";
  if (!prospects.length) {
    return `
      <div class="deckViewport">
        <header class="homeTopbar">
          <div></div>
          <div class="deckHeaderActions">
            <button type="button" data-view="replies">Replies ${kindlingData.replies.length}</button>
          </div>
        </header>
        ${renderGreeting()}
        <header class="deckHeader">
          <div>
            <span>Today's deck - ${progress.total} of ${progress.total}</span>
          </div>
        </header>
        <section class="emptyDeck">
          <h1>You've cleared today's deck.</h1>
          <p>You're done with today's dealt stack. Replies are the only thing that can pull you back into active selling.</p>
          <div class="emptyStats" aria-label="Today's deck results">
            <span><strong>${state.actedProspects.length}</strong> acted</span>
            <span><strong>${state.snoozedProspects.length}</strong> snoozed</span>
            <span><strong>${state.dismissedProspects.length}</strong> dismissed</span>
          </div>
          <div class="emptyActions">
            <button class="btn btn-primary primaryAction" type="button" data-action="explore-next-tier">Explore next tier</button>
            <button type="button" data-action="replay-deck">Replay today's deck</button>
          </div>
        </section>
      </div>
    `;
  }
  if (mode === "overview") return renderDeckOverview(prospects, progress);
  return `
    <div class="deckViewport">
      <header class="homeTopbar">
        <div></div>
        <div class="deckHeaderActions">
          ${renderDeckModeToggle("focused")}
          <button type="button" data-view="replies">Replies ${kindlingData.replies.length}</button>
        </div>
      </header>
      ${renderGreeting()}
      <header class="deckHeader">
        <div>
          <span>Today's deck - ${progress.current} of ${progress.total}</span>
        </div>
      </header>
      <div class="deckStack" aria-live="polite">
        <div class="stackGhost ghostTwo"></div>
        <div class="stackGhost ghostOne"></div>
        ${renderProspectCard(prospect)}
      </div>
    </div>
  `;
}

function renderDeckModeToggle(mode) {
  return `
    <div class="viewToggle" role="group" aria-label="Deck view">
      <button class="btn btn-ghost ${mode === "focused" ? "active" : ""}" type="button" data-deck-mode="focused">Focused</button>
      <button class="btn btn-ghost ${mode === "overview" ? "active" : ""}" type="button" data-deck-mode="overview">Overview</button>
    </div>
  `;
}

function renderDeckOverview(prospects, progress) {
  return `
    <div class="deckViewport">
      <header class="homeTopbar">
        <div></div>
        <div class="deckHeaderActions">
          ${renderDeckModeToggle("overview")}
          <button type="button" data-view="replies">Replies ${kindlingData.replies.length}</button>
        </div>
      </header>
      ${renderGreeting()}
      <header class="deckHeader">
        <div>
          <span>Today's deck - overview</span>
          <small>${progress.remaining} remaining from ${progress.total}</small>
        </div>
      </header>
      <div class="overviewStage">
        <section class="overviewList" aria-label="Today's deck overview">
          ${prospects.map((item, index) => {
            const summary = cardSubstanceSummary(item);
            return `
              <article class="card overviewCard ${item.id === state.activeProspectId ? "selected" : ""}">
                <button class="btn btn-ghost overviewMain" type="button" data-focus-prospect="${item.id}">
                  <header>
                    <div class="overviewConfidenceRow">
                      <span class="badge badge-neutral confidenceCue" title="${confidenceTooltip(item)}">${formatConfidence(item.confidence)}</span>
                    </div>
                    <strong>${item.company}</strong>
                    <span>${prospectMetadata(item)}</span>
                  </header>
                  ${summary ? `
                    <section class="overviewSnapshot">
                      <em class="section-header">Snapshot</em>
                      <p>${summary}</p>
                    </section>
                  ` : ""}
                </button>
                <button class="btn overviewPull" type="button" ${index === 0 ? "disabled" : ""} data-pull-top="${item.id}">Pull to top</button>
              </article>
            `;
          }).join("")}
        </section>
      </div>
    </div>
  `;
}

function currentMentionQuery() {
  const match = state.commandValue.match(/@([a-z0-9 .-]*)$/i);
  return match ? match[1].toLowerCase() : null;
}

function commandSuggestions() {
  const query = currentMentionQuery();
  if (query === null) return [];
  const scoped = commandScopedProspect();
  if (scoped && query.trim() === scoped.company.toLowerCase()) return [];
  return commandEntities().filter((entity) => entity.label.toLowerCase().includes(query)).slice(0, 6);
}

function searchResults() {
  const query = state.searchQuery.trim().toLowerCase();
  const items = commandEntities();
  const filtered = query ? items.filter((item) => item.label.toLowerCase().includes(query) || item.type.includes(query)) : items;
  return filtered.slice(0, 8);
}

function openSearchPalette() {
  state.searchOpen = true;
  state.searchQuery = "";
  state.searchIndex = 0;
  renderActPrototype();
  window.requestAnimationFrame(() => $("searchInput")?.focus());
}

function closeSearchPalette() {
  state.searchOpen = false;
  state.searchQuery = "";
  state.searchIndex = 0;
  renderActPrototype();
}

function jumpToSearchResult(item) {
  if (!item) return;
  state.searchOpen = false;
  state.searchQuery = "";
  state.searchIndex = 0;
  if (item.type === "offering") {
    state.prototypeView = "offerings";
  } else {
    state.activeProspectId = item.id;
    state.prototypeView = "deck";
    state.deckViewMode = "focused";
  }
  savePrototypeState();
  renderActPrototype();
}

function renderSearchPalette() {
  const results = searchResults();
  const selectedIndex = Math.min(state.searchIndex, Math.max(results.length - 1, 0));
  return `
    <div class="searchScrim" role="presentation" data-action="close-search">
      <section class="searchPalette" role="dialog" aria-modal="true" aria-label="Search">
        <header>
          <span class="section-header">Search</span>
          <kbd>⌘K</kbd>
        </header>
        <input id="searchInput" type="text" value="${escapeHtml(state.searchQuery)}" placeholder="Search companies, contacts, or offerings" autocomplete="off" />
        <div class="searchResults" role="listbox">
          ${results.length ? results.map((item, index) => `
            <button class="searchResult ${index === selectedIndex ? "active" : ""}" type="button" data-search-index="${index}" role="option" aria-selected="${index === selectedIndex}">
              <span>${escapeHtml(item.label)}</span>
              <small>${escapeHtml(item.type)}</small>
            </button>
          `).join("") : `<p>No matches</p>`}
        </div>
      </section>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCommandDrawer() {
  const suggestions = commandSuggestions();
  const context = currentUiContext();
  const hasMessages = state.commandMessages.length || state.commandResult || state.commandConfirm || state.commandStatus;
  const hasPendingMessage = state.commandMessages.some((message) => message.status === "pending");
  return `
    <aside class="agentChatLayer ${state.commandOpen ? "open" : ""} ${state.commandDocked ? "docked" : "floating"}" aria-label="Agent chat">
      ${state.commandOpen ? `
        <div class="agentLightScrim" data-action="close-command" aria-hidden="true"></div>
        <div class="commandPanel" role="dialog" aria-label="Agent chat" aria-modal="false">
          <header>
            <div class="agentTitle">
              <img src="/athena-avatar.png" alt="" />
              <span class="section-header">Athena</span>
              <span class="commandScope badge badge-neutral">Scope: <strong>${escapeHtml(context.companyId ? context.companyName : "Workspace")}</strong></span>
            </div>
            <div class="agentPanelActions">
              <button class="btn btn-ghost iconButton" type="button" data-action="${state.commandDocked ? "collapse-command" : "dock-command"}" aria-label="${state.commandDocked ? "Collapse chat" : "Expand chat"}" title="${state.commandDocked ? "Collapse chat" : "Expand chat"}">${iconSvg(state.commandDocked ? "minimize2" : "maximize2")}</button>
              <button class="btn btn-ghost iconButton" type="button" data-action="close-command" aria-label="Close chat" title="Close chat">${iconSvg("x")}</button>
            </div>
          </header>
          <div class="embeddedCommandMessages" id="commandThread" aria-label="Agent chat messages">
            ${hasMessages ? `
              ${state.commandMessages.map(renderCommandTurn).join("")}
              ${state.commandStatus && !hasPendingMessage ? renderCommandTurn({ role: "assistant", status: "pending", content: state.commandStatus }) : ""}
              ${state.commandResult ? renderCommandTurn({ role: "assistant", status: "complete", content: state.commandResult }) : ""}
              ${state.commandConfirm ? `
                <div class="commandTurn agent">
                  <div class="agentTurnMeta"><img src="/athena-avatar.png" alt="" /><span class="section-header">Athena</span></div>
                  <div class="agentTurnBody">${escapeHtml(state.commandConfirm)}</div>
                  <div class="commandConfirm">
                    <button class="btn btn-primary" type="button" data-action="confirm-command">Confirm</button>
                    <button class="btn" type="button" data-action="cancel-command">Cancel</button>
                  </div>
                </div>
              ` : ""}
            ` : renderCommandTurn({ role: "assistant", status: "complete", content: commandOpeningMessage(context) })}
          </div>
          ${suggestions.length ? `
            <div class="mentionMenu">
              ${suggestions.map((entity) => `<button class="btn btn-ghost" type="button" data-mention="${escapeHtml(entity.label)}"><strong>${escapeHtml(entity.label)}</strong><span>${entity.type}</span></button>`).join("")}
            </div>
          ` : ""}
          <form class="commandBar" id="commandBar">
            <textarea id="commandInput" rows="2" placeholder="Ask Athena. @ to scope" autocomplete="off">${escapeHtml(state.commandValue)}</textarea>
            <div class="commandTools">
              <button class="btn btn-primary" type="submit">Send</button>
            </div>
          </form>
        </div>
      ` : ""}
    </aside>
  `;
}

function commandOpeningMessage(context) {
  if (context.companyId) {
    return "What would you like to work through?";
  }
  return "What would you like to look into?";
}

function renderCommandTurn(message) {
  const role = message.role === "user" ? "user" : "agent";
  const body = message.status === "pending"
    ? `<span class="thinkingDots" aria-label="${escapeHtml(displayCommandMessage(message))}"><i></i><i></i><i></i></span>`
    : escapeHtml(displayCommandMessage(message));
  if (role === "user") {
    return `
      <div class="commandTurn user">
        <div class="userTurnBubble">${body}</div>
      </div>
    `;
  }
  return `
    <div class="commandTurn agent ${message.status === "pending" ? "pending" : ""}">
      <div class="agentTurnMeta"><img src="/athena-avatar.png" alt="" /><span class="section-header">Athena</span></div>
      <div class="agentTurnBody">${body}</div>
    </div>
  `;
}

function renderActivitySummary() {
  if (!state.prototypeActivity.length) return "";
  const counts = {
    Acted: state.actedProspects.length,
    Dismissed: state.dismissedProspects.length,
    Snoozed: state.snoozedProspects.length,
  };
  return `
    <div class="activitySummary">
      <h2>Captured today</h2>
      <div class="summaryCounts">
        ${Object.entries(counts).map(([label, count]) => `<span><strong>${count}</strong>${label}</span>`).join("")}
      </div>
      ${state.prototypeActivity.slice(0, 5).map((item) => `
        <p><strong>${item.type}</strong><em>${item.company}</em><span>${item.detail}</span></p>
      `).join("")}
    </div>
  `;
}

function renderProspectCard(prospect) {
  const contact = prospect.contact;
  const primaryAction = renderCardPrimaryAction(prospect);
  const lead = prospectLeadType(prospect);
  const summary = cardSubstanceSummary(prospect);
  return `
    <article class="card prospectCard ${prospect.status} ${lead.type}">
      <header class="prospectHeader">
        <div class="prospectTitle">
          <h1>${prospect.company}</h1>
        </div>
        <div class="cueCluster" aria-label="Prospect cues">
          <span class="badge badge-neutral confidenceCue" title="${confidenceTooltip(prospect)}">${formatConfidence(prospect.confidence)}</span>
        </div>
        <span class="prospectMeta">${prospectMetadata(prospect)}</span>
      </header>
      ${summary ? `
        <section class="substanceBlock">
          <span class="section-header">Snapshot</span>
          <p>${summary}</p>
        </section>
      ` : ""}
      ${renderProspectLead(prospect, lead)}
      <section class="angleBlock">
        <span class="section-header">Wedge</span>
        <p>${prospect.angle}</p>
      </section>
      <section class="actZone">
        ${renderProspectContact(prospect)}
        <footer class="cardActions">
          <button class="btn btn-ghost" type="button" data-action="dismiss"><span>Dismiss</span><kbd>←</kbd></button>
          <button class="btn btn-ghost" type="button" data-action="snooze"><span>Snooze</span><kbd>↑</kbd></button>
          <button class="btn dossierAction" type="button" data-view="dossier" data-prospect="${prospect.id}"><span>View Dossier</span><kbd>→</kbd></button>
          ${primaryAction}
        </footer>
      </section>
    </article>
  `;
}

function prospectMetadata(prospect) {
  return String(prospect.descriptor || "")
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

function formatConfidence(confidence) {
  const value = Number(confidence);
  if (!Number.isFinite(value)) return "Confidence unknown";
  return `${Math.round(value * 100)}% confidence`;
}

function confidenceTooltip(prospect) {
  return `Company enrichment confidence from DataModel companies.confidence: ${formatConfidence(prospect.confidence)}.`;
}

function prospectSubstanceSummary(company, match) {
  const profile = company.profile || {};
  const candidates = [profile.description, profile.summary, match.reason].filter(Boolean);
  return candidates.find((value) => value !== match.reason && isSubstantiveSummary(value, company)) || "";
}

function cardSubstanceSummary(prospect) {
  return isSubstantiveSummary(prospect.substanceSummary, prospect) ? prospect.substanceSummary : "";
}

function isSubstantiveSummary(value, record = {}) {
  const text = String(value || "").trim();
  if (text.length < 48) return false;
  const descriptor = String(record.descriptor || record.profile?.displayDescriptor || "").toLowerCase();
  const normalized = text.toLowerCase();
  if (descriptor && (normalized === descriptor || descriptor.includes(normalized) || normalized.includes(descriptor))) return false;
  if (record.gap && normalized === String(record.gap).toLowerCase()) return false;
  return true;
}

function renderProspectContact(prospect) {
  const contact = prospect.contact;
  return `
      <section class="contact-row contactRow">
        <div class="avatar contactPhoto" aria-hidden="true">${contactInitials(contact.name)}</div>
        <div class="contactIdentity">
          <strong>${contact.name}</strong>
          <span>${contact.role}</span>
        </div>
        <div class="channelGates" aria-label="Available outreach channels">
          <button class="btn btn-ghost channelAction ${contact.phone ? "available" : "unavailable"}" type="button" ${contact.phone ? "" : "disabled"}>Call</button>
          <button class="btn btn-ghost channelAction ${contact.email ? "available" : "unavailable"}" type="button" ${contact.email ? "" : "disabled"}>Email</button>
        </div>
      </section>
  `;
}

function contactInitials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderProspectLead(prospect, lead) {
  if (lead.type === "realTrigger") {
    return `
        <section class="callout callout-whynow whyNow">
          <span class="section-header">Why now</span>
          <p>${lead.text}</p>
          <button class="btn btn-ghost sourceLink" type="button" data-action="sources">${prospect.evidence.length} sources</button>
        </section>
    `;
  }
  const label = lead.type === "relationshipLed" ? "Gap" : "Fit lead";
  return `
        <section class="leadBlock ${lead.type}">
          <span class="section-header">${label}</span>
          <p>${lead.text}</p>
        </section>
  `;
}

function prospectLeadType(prospect) {
  if (prospect.mode === "relationship_led") {
    return { type: "relationshipLed", text: prospect.gap || "No timing trigger found. Lead through the warm path." };
  }
  const whyNow = (prospect.whyNow || "").trim();
  const isFitLed = !whyNow || /\b(no sharp trigger|fit-led|no timing trigger)\b/i.test(whyNow);
  if (isFitLed) {
    return {
      type: "fitLed",
      text: whyNow || prospect.gap || "Strong match, but no sharp timing trigger yet.",
    };
  }
  return { type: "realTrigger", text: whyNow };
}

function renderCardPrimaryAction(prospect) {
  const contact = prospect.contact;
  if (contact.email && prospect.draft) return `<button class="btn btn-primary primaryAction" type="button" data-action="email"><span>Review Email</span><kbd>↵</kbd></button>`;
  if (contact.phone) return `<button class="btn btn-primary primaryAction" type="button" data-action="call"><span>Call ${contact.name.split(" ")[0]}</span><kbd>↵</kbd></button>`;
  return `<button class="btn primaryAction unavailablePrimary" type="button" disabled>No channel</button>`;
}

function renderDossierView(prospect) {
  const primaryAction = prospect.contact.email
    ? `<button class="btn btn-primary primaryAction" type="button" data-action="email">Review Email</button>`
    : `<button class="btn btn-primary primaryAction" type="button" ${prospect.contact.phone ? "" : "disabled"} data-action="call">Call ${prospect.contact.name.split(" ")[0]}</button>`;
  const evidenceReady = prospect.evidence.filter((item) => item.confidence === "High").length;
  const totalCost = prospect.stageCosts?.reduce((sum, item) => sum + Number(item.cost.replace("$", "")), 0) || 0;
  return `
    <article class="dossierView">
      <header class="surfaceHeader">
        <div>
          <p>Dossier</p>
          <h1>${prospect.company}</h1>
          <span>${prospect.descriptor}</span>
        </div>
        <div class="dossierHeaderActions">
          <button type="button" data-view="deck">Back to deck</button>
          ${primaryAction}
        </div>
      </header>
      <section class="hypothesisPanel">
        <div class="hypothesisMain">
          <span>Hypothesis</span>
          <h2>${prospect.gap}</h2>
          <p>${prospect.angle}</p>
          ${prospect.whyNow ? `<p class="whyNowInline"><strong>Why now:</strong> ${prospect.whyNow}</p>` : `<p class="whyNowInline relationship"><strong>Relationship-led:</strong> No honest timing trigger found. Verify reachability before acting.</p>`}
        </div>
        <div class="verificationRail">
          <span class="statePill">${prospect.status === "ready" ? "Verified" : prospect.status === "partial" ? "Partial" : "Thin signal"}</span>
          <p><strong>${evidenceReady}/${prospect.evidence.length}</strong> high-confidence sources</p>
          <p><strong>${prospect.contact.email || prospect.contact.phone ? "Reachable" : "Blocked"}</strong> contact path</p>
          <p><strong>${totalCost.toLocaleString("en-US", { style: "currency", currency: "USD" })}</strong> prototype compute spend</p>
        </div>
      </section>
      <section class="dossierGrid">
        <div class="detailPanel evidencePanel">
          <div class="panelTitle">
            <h2>Evidence and sources</h2>
            <span>Openable in production</span>
          </div>
          ${prospect.evidence.map((item) => `
            <button class="btn evidence-row evidenceRow" type="button" aria-label="Source: ${item.label}">
              <span class="sourceType">${item.type}</span>
              <strong>${item.label}</strong>
              <span>${item.source} - ${item.captured} - ${item.confidence} confidence</span>
              <em>${item.url}</em>
            </button>
          `).join("")}
        </div>
        <div class="detailPanel contactPanel">
          <div class="panelTitle">
            <h2>Path</h2>
            <span>${prospect.contact.confidence} confidence</span>
          </div>
          <div class="contactIdentity">
            <div class="avatar" aria-hidden="true">${prospect.contact.name.slice(0, 1)}</div>
            <div>
              <strong>${prospect.contact.name}</strong>
              <span>${prospect.contact.role}</span>
            </div>
          </div>
          <p class="quietLine">${prospect.contact.source}</p>
          <div class="channelGates dossierChannels">
            <span class="${prospect.contact.phone ? "available" : "unavailable"}">Call ${prospect.contact.phone || "missing"}</span>
            <span class="${prospect.contact.email ? "available" : "unavailable"}">Email ${prospect.contact.email || "missing"}</span>
          </div>
        </div>
        <div class="detailPanel">
          <div class="panelTitle">
            <h2>History</h2>
            <span>Airspace memory</span>
          </div>
          ${prospect.history.map((item) => `<p class="quietLine">${item}</p>`).join("")}
        </div>
        <div class="detailPanel computePanel">
          <div class="panelTitle">
            <h2>Compute trail</h2>
            <span>Why it reached the deck</span>
          </div>
          ${prospect.stageCosts.map((item, index) => `
            <div class="computeStep">
              <span>${index}</span>
              <div>
                <strong>${item.stage}</strong>
                <p>${item.outcome}</p>
              </div>
              <em>${item.cost}</em>
            </div>
          `).join("")}
        </div>
        <div class="detailPanel draftPanel">
          <div class="panelTitle">
            <h2>Draft opener</h2>
            <span>Human review required</span>
          </div>
          <p>${prospect.draft}</p>
          ${primaryAction}
        </div>
        <div class="detailPanel profilePanel">
          <div class="panelTitle">
            <h2>Profile fields</h2>
            <span>Demoted editing surface</span>
          </div>
          <dl>
            <div><dt>Offering</dt><dd>${prospect.offering}</dd></div>
            <div><dt>Mode</dt><dd>${prospect.mode.replace("_", "-")}</dd></div>
            <div><dt>Warmth</dt><dd>${prospect.warmth}</dd></div>
            <div><dt>Fit score</dt><dd>${prospect.fitScore}</dd></div>
          </dl>
        </div>
      </section>
      ${prospect.researchBrief ? renderResearchBrief(prospect.researchBrief) : ""}
    </article>
  `;
}

function renderResearchBrief(brief) {
  return `
    <section class="researchBrief">
      <header class="panelTitle">
        <div>
          <h2>${brief.title}</h2>
          <span>Backend-style research output</span>
        </div>
      </header>
      <section class="briefSummary">
        <h3>Executive summary</h3>
        ${brief.executiveSummary.map((item) => `<p>${item}</p>`).join("")}
      </section>
      <section class="briefBands">
        <div>
          <h3>Service lines</h3>
          <div class="briefPills">${brief.serviceLines.map((item) => `<span>${item}</span>`).join("")}</div>
        </div>
        <div>
          <h3>Strategic signals</h3>
          ${renderBriefList(brief.strategicSignals)}
        </div>
      </section>
      <section class="opportunityList">
        <h3>High-value opportunity areas</h3>
        ${brief.opportunityAreas.map((area, index) => `
          <article class="opportunityItem">
            <span>${index + 1}</span>
            <div>
              <h4>${area.title}</h4>
              <p><strong>Evidence:</strong> ${area.evidence}</p>
              <p><strong>Hypothesis:</strong> ${area.hypothesis}</p>
              <div class="briefColumns">
                <div>
                  <h5>Likely value</h5>
                  ${renderBriefList(area.value)}
                </div>
                <div>
                  <h5>Target departments</h5>
                  ${renderBriefList(area.targets)}
                </div>
              </div>
            </div>
          </article>
        `).join("")}
      </section>
      <section class="briefBands">
        <div>
          <h3>Recommended outreach strategy</h3>
          <p>${brief.outreachStrategy.positioning}</p>
          <h4>Best entry points</h4>
          ${renderBriefList(brief.outreachStrategy.entryPoints)}
          <h4>Suggested pilots</h4>
          ${renderBriefList(brief.outreachStrategy.pilots)}
        </div>
        <div>
          <h3>Discovery questions</h3>
          ${renderBriefList(brief.discoveryQuestions)}
        </div>
      </section>
      <section class="briefBands">
        <div>
          <h3>Limitations and uncertainty</h3>
          ${renderBriefList(brief.limitations)}
        </div>
        <div>
          <h3>Sources</h3>
          <div class="sourceList">
            ${brief.sources.map((source) => `<button type="button">${source}</button>`).join("")}
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderBriefList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderRepliesView() {
  return `
    <section class="listSurface">
      <header class="surfaceHeader">
        <div>
          <p>Replies</p>
          <h1>Live threads</h1>
          <span>Sorted by urgency, coldest first.</span>
        </div>
        <button type="button" data-view="deck">Back to deck</button>
      </header>
      <div class="replyList">
        ${kindlingData.replies.map((thread) => `
          <article class="replyCard">
            <div class="replyTime ${thread.urgency}">${thread.age}</div>
            <div>
              <span class="statePill">${thread.state}</span>
              <h2>${thread.contact} - ${thread.company}</h2>
              <p>${thread.gist}</p>
            </div>
            <button class="btn btn-primary primaryAction" type="button" data-action="advance-thread">${thread.nextMove}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderOfferingsView() {
  return `
    <section class="listSurface">
      <header class="surfaceHeader">
        <div>
          <p>Offerings</p>
          <h1>Configurable ICPs</h1>
          <span>Market profiles from the DataModel.md contract.</span>
        </div>
      </header>
      <div class="offeringGrid">
        ${kindlingModel.marketProfiles.map((profile) => {
          const matchedCount = kindlingModel.matches.filter((match) => match.marketProfileId === profile.id).length;
          const version = profile.currentVersion;
          return `
          <article class="detailPanel">
            <span class="statePill">v${version.versionNumber}</span>
            <h2>${profile.name}</h2>
            <p><strong>Target:</strong> ${profile.targetSegment}</p>
            <p><strong>Matched:</strong> ${matchedCount} companies in today's prototype deck.</p>
            <button type="button">Clone version</button>
          </article>
        `; }).join("")}
      </div>
    </section>
  `;
}

function renderPipelineView() {
  const stages = [
    ["Stage 0", "Rules only", "412 killed", "$0"],
    ["Stage 1", "Cheap signal pass", "89 survivors", "$38"],
    ["Stage 2", "Deep research", "31 researched", "$214"],
    ["Stage 3", "Synthesis", "18 deck-ready", "$72"],
  ];
  return `
    <section class="listSurface">
      <header class="surfaceHeader">
        <div>
          <p>Pipeline</p>
          <h1>Funnel visibility</h1>
          <span>Operator view, kept out of the daily sales path.</span>
        </div>
      </header>
      <div class="funnelGrid">
        ${stages.map(([stage, label, count, cost]) => `
          <article class="funnelStage">
            <span>${stage}</span>
            <h2>${label}</h2>
            <strong>${count}</strong>
            <p>${cost} estimated spend</p>
          </article>
        `).join("")}
      </div>
      <div class="detailPanel">
        <h2>Sample compute trail</h2>
        ${activeProspect().computeTrail.map((item) => `<p class="trailLine">${item}</p>`).join("")}
      </div>
      <div class="detailPanel">
        <h2>Feedback loop</h2>
        ${renderActivitySummary() || `<p class="quietLine">No deck feedback captured yet.</p>`}
      </div>
      <div class="detailPanel">
        <h2>Data model</h2>
        <p class="quietLine">${kindlingModel.ownerCompany.name} - ${kindlingModel.marketProfiles.length} market profiles - ${kindlingModel.companies.length} companies - ${kindlingModel.people.length} people</p>
        <p class="quietLine">${kindlingModel.sources.length} sources - ${kindlingModel.matches.length} matches - ${kindlingModel.outreachDrafts.length} outreach drafts - ${kindlingModel.activities.length} activities</p>
      </div>
    </section>
  `;
}

function renderPrototypeModal() {
  const prospect = activeProspect();
  if (state.prototypeModal === "dismiss") {
    const reasons = ["Already a client", "Too big", "Bad timing", "Wrong fit"];
    return `
      <div class="scrim modalScrim">
        <section class="modal prototypeModal">
          <h2>Why dismiss ${prospect.company}?</h2>
          <p>One tap records a disqualified outcome for the prototype deck.</p>
          <div class="reasonGrid">
            ${reasons.map((reason, index) => `<button class="btn" type="button" data-dismiss-reason="${reason}"><kbd>${index + 1}</kbd>${reason}</button>`).join("")}
          </div>
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </section>
      </div>
    `;
  }
  if (state.prototypeModal === "snooze") {
    return `
      <div class="scrim modalScrim">
        <section class="modal prototypeModal">
          <h2>Snooze ${prospect.company}</h2>
          <p>Choose the wake condition that should bring this prospect back.</p>
          <div class="reasonGrid">
            ${["30 days", "When signal refreshes", "After next job ad"].map((reason) => `<button class="btn" type="button" data-snooze-reason="${reason}">${reason}</button>`).join("")}
          </div>
          <button class="btn" type="button" data-action="close-modal">Cancel</button>
        </section>
      </div>
    `;
  }
  if (state.prototypeModal === "sources") {
    return `
      <div class="scrim modalScrim">
        <section class="modal prototypeModal sourceReview">
          <h2>Sources for ${prospect.company}</h2>
          <p>Each claim on the card needs a resolvable source before it should feel outreach ready.</p>
          ${prospect.evidence.map((item) => `
            <button class="btn evidence-row evidenceRow" type="button">
              <strong>${item.label}</strong>
              <span>${item.source} - ${item.captured} - ${item.confidence}</span>
            </button>
          `).join("")}
          <div class="modalActions">
            <button class="btn" type="button" data-action="close-modal">Close</button>
            <button class="btn btn-primary primaryAction" type="button" data-view="dossier" data-prospect="${prospect.id}">Open dossier</button>
          </div>
        </section>
      </div>
    `;
  }
  const subject = emailSubject(prospect);
  return `
    <div class="scrim modalScrim">
      <section class="modal prototypeModal emailReview">
        <header class="emailReviewHeader">
          <div>
            <span>Email preview</span>
            <h2>${prospect.contact.name}</h2>
          </div>
          <button class="btn btn-ghost" type="button" data-action="close-modal" aria-label="Close email preview">Close</button>
        </header>
        <div class="emailMeta">
          <span>To</span>
          <strong>${prospect.contact.email || "No email available"}</strong>
          <span>Subject</span>
          <input id="emailSubjectInput" type="text" value="${escapeHtml(subject)}" aria-label="Email subject" />
        </div>
        <article class="emailPaper">
          <textarea id="emailBodyInput" rows="8" aria-label="Email body">${escapeHtml(prospect.draft)}</textarea>
        </article>
        <div class="modalActions">
          <button class="btn" type="button" data-action="copy-email">Copy</button>
          <button class="btn btn-primary primaryAction" type="button" ${prospect.contact.email ? "" : "disabled"} data-action="open-mail">Open in Mail</button>
        </div>
      </section>
    </div>
  `;
}

function emailSubject(prospect) {
  if (prospect.emailSubject) return prospect.emailSubject;
  if (prospect.offering.includes("Website")) return `Quick mobile audit for ${prospect.company}`;
  if (prospect.offering.includes("AI")) return `Workflow audit for ${prospect.company}`;
  if (prospect.mode === "relationship_led") return `Possible fit for ${prospect.company}`;
  return `Idea for ${prospect.company}`;
}

function emailBody(prospect, subject = emailSubject(prospect), body = prospect.draft) {
  return `Subject: ${subject}\n\n${body}`;
}

function currentEmailDraft(prospect) {
  return {
    subject: $("emailSubjectInput")?.value || emailSubject(prospect),
    body: $("emailBodyInput")?.value || prospect.draft,
  };
}

function mailtoUrl(prospect, subject = emailSubject(prospect), body = prospect.draft) {
  return `mailto:${encodeURIComponent(prospect.contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function moveToNextProspect() {
  const next = availableProspects()[0];
  if (next) state.activeProspectId = next.id;
  savePrototypeState();
  renderActPrototype();
}

function markActed(prospect) {
  state.actedProspects = [...new Set([...state.actedProspects, prospect.id])];
}

function pullProspectToTop(prospectId) {
  const current = normalizedDeckOrder();
  state.deckOrder = [prospectId, ...current.filter((id) => id !== prospectId)];
  state.activeProspectId = prospectId;
  savePrototypeState();
}

function insertMention(label) {
  state.commandValue = state.commandValue.replace(/@([a-z0-9 .-]*)$/i, `@${label} `);
  const prospect = kindlingAgentTools.findProspectByText(`@${label}`);
  if (prospect) state.commandScopedProspectId = prospect.id;
  renderActPrototype();
  focusCommandEnd();
}

function openCommandDrawer(scope = "card") {
  const prospect = scope === "card" && state.prototypeView === "deck" ? activeProspect() : null;
  state.commandOpen = true;
  state.commandScopedProspectId = prospect?.id || null;
  state.commandResult = "";
  state.commandConfirm = null;
  state.commandStatus = "";
  if (prospect && !state.commandValue.trim()) state.commandValue = `@${prospect.company} `;
  if (!prospect) state.commandValue = "";
  renderActPrototype();
  focusCommandEnd();
  if (state.token && state.commandChatId) void loadCommandChatMessages();
}

function focusCommandEnd() {
  const input = $("commandInput");
  if (!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function commandScopedProspect() {
  if (!state.commandScopedProspectId) return null;
  return kindlingData.prospects.find((prospect) => prospect.id === state.commandScopedProspectId) || null;
}

function currentUiContext() {
  const prospect = commandScopedProspect() || (!state.commandOpen ? activeProspect() : null);
  if (!prospect) {
    return {
      surface: state.prototypeView,
      deckViewMode: state.deckViewMode,
      companyId: "",
      personId: "",
      matchId: "",
      outreachDraftId: "",
      companyName: "Kindling workspace",
      personName: "",
      mode: "search across companies, contacts, offerings, sources, matches, and drafts",
    };
  }
  return {
    surface: state.prototypeView,
    deckViewMode: state.deckViewMode,
    companyId: prospect.modelRefs?.companyId || prospect.id,
    personId: prospect.modelRefs?.personId || "",
    matchId: prospect.modelRefs?.matchId || "",
    outreachDraftId: prospect.modelRefs?.outreachDraftId || "",
    companyName: prospect.company,
    personName: prospect.contact.name,
    mode: prospect.contact.email ? "outreach draft" : prospect.contact.phone ? "call path" : "dossier path",
  };
}

function commandContextMessage(message) {
  const context = currentUiContext();
  const prospect = commandScopedProspect();
  const active = kindlingAgentTools.activeObjects();
  const lines = [
    "Kindling active context:",
    `- Surface: ${context.surface}`,
    `- Active company: ${context.companyName} (${context.companyId})`,
    `- Active person: ${context.personName} (${context.personId})`,
    `- Active match: ${context.matchId}`,
    `- Active outreach draft: ${context.outreachDraftId}`,
  ];
  if (prospect) {
    lines.push(
      `- Fit score: ${prospect.fitScore}`,
      `- Warmth: ${prospect.warmth}`,
      `- Why now: ${prospect.whyNow || "No timing trigger"}`,
      `- Wedge: ${prospect.angle}`,
      `- Sources: ${active.sources.map((source) => source.title).join("; ") || "none"}`,
    );
  } else {
    lines.push("- No prospect scoped by default. Search/query broadly unless the user mentions an entity.");
  }
  lines.push("", `User message: ${message}`);
  return lines.join("\n");
}

function displayCommandMessage(message) {
  if (message.status === "pending") return "Thinking...";
  if (message.role === "user") {
    const match = String(message.content || "").match(/User message:\s*([\s\S]*)$/);
    return match ? match[1].trim() : message.content;
  }
  return message.content;
}

function appendLocalCommandTurn(role, content, status = "complete") {
  state.commandMessages = [
    ...state.commandMessages,
    {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      content,
      status,
    },
  ];
}

async function ensureCommandChat() {
  if (state.commandChatId) return state.commandChatId;
  const payload = await api("/api/chats", { method: "POST", body: "{}" });
  state.commandChatId = payload.chat.id;
  localStorage.setItem("kindling_command_chat", state.commandChatId);
  return state.commandChatId;
}

async function loadCommandChatMessages() {
  if (!state.commandChatId || !state.token) return;
  const payload = await api(`/api/chats/${encodeURIComponent(state.commandChatId)}/messages`);
  state.commandMessages = payload.messages || [];
  state.commandOpen = true;
}

async function sendCommandChatMessage(value) {
  const chatId = await ensureCommandChat();
  appendLocalCommandTurn("user", value, "sending");
  state.commandStatus = "Thinking";
  state.commandOpen = true;
  renderActPrototype();
  const payload = await api(`/api/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: commandContextMessage(value) }),
  });
  state.commandMessages = payload.messages || [];
  if (payload.requiresAutopilotAuth && payload.triggerRequest) {
    state.commandStatus = "Authorizing";
    renderActPrototype();
    const autopilotAuthorization = await signNip98Request(payload.triggerRequest);
    const started = await api(`/api/pipeline-runs/${encodeURIComponent(payload.runId)}/start`, {
      method: "POST",
      body: JSON.stringify({ autopilotAuthorization }),
    });
    state.commandMessages = started.messages || [];
  }
  state.commandStatus = state.commandMessages.some((message) => message.status === "pending") ? "Agent running" : "";
  renderActPrototype();
  refreshCommandChatUntilComplete(0);
}

function refreshCommandChatUntilComplete(attempt) {
  if (!state.commandChatId || attempt > 8) return;
  window.setTimeout(async () => {
    try {
      await loadCommandChatMessages();
      const pending = state.commandMessages.some((message) => message.status === "pending");
      state.commandStatus = pending ? "Agent running" : "";
      state.commandOpen = true;
      renderActPrototype();
      if (pending) refreshCommandChatUntilComplete(attempt + 1);
    } catch {
      state.commandStatus = "";
      renderActPrototype();
    }
  }, 1800);
}

const kindlingAgentTools = {
  findProspectByText(value) {
    const lower = value.toLowerCase();
    const entity = commandEntities().find((item) => lower.includes(`@${item.label.toLowerCase()}`) || lower.includes(item.label.toLowerCase()));
    if (!entity) return null;
    return kindlingData.prospects.find((item) => item.id === entity.id) || null;
  },
  activeObjects() {
    const prospect = commandScopedProspect() || activeProspect();
    const refs = prospect.modelRefs || {};
    return {
      prospect,
      company: kindlingModel.companies.find((item) => item.id === refs.companyId),
      person: kindlingModel.people.find((item) => item.id === refs.personId),
      match: kindlingModel.matches.find((item) => item.id === refs.matchId),
      outreachDraft: kindlingModel.outreachDrafts.find((item) => item.id === refs.outreachDraftId),
      sources: kindlingModel.sources.filter((item) => item.companyId === refs.companyId),
    };
  },
  searchWeakEvidence() {
    return kindlingData.prospects.filter((prospect) => prospect.status !== "ready" || prospect.evidence.filter((item) => item.confidence === "High").length < 2);
  },
  searchWarmProspects() {
    return kindlingData.prospects.filter((prospect) => prospect.warmth === "warm");
  },
};

function handleLocalCommand(value) {
  if (!value) {
    state.commandResult = "";
    state.commandConfirm = null;
    renderActPrototype();
    return;
  }
  appendLocalCommandTurn("user", value);
  const lower = value.toLowerCase();
  const mentionedProspect = kindlingAgentTools.findProspectByText(value);
  const sideEffect = /\b(send|snooze|dismiss|bulk|mark|change|move|delete)\b/i.test(value);
  if (sideEffect) {
    state.commandConfirm = `Confirm before running: ${value}`;
    state.commandResult = "";
  } else if (mentionedProspect) {
    state.commandScopedProspectId = mentionedProspect.id;
    state.commandResult = `Context set to ${mentionedProspect.company}. I can use its company, person, match, sources, and outreach draft.`;
    state.commandConfirm = null;
  } else if (lower.includes("stress test") && lower.includes("email")) {
    const { prospect, outreachDraft, sources } = kindlingAgentTools.activeObjects();
    const issues = [
      sources.length ? "" : "No sources are attached to this draft.",
      outreachDraft?.pitchText?.length > 700 ? "The email is probably too long for first-touch outreach." : "",
      /—|–/.test(outreachDraft?.pitchText || "") ? "The draft contains dash punctuation that violates the current writing rules." : "",
      prospect.whyNow ? "" : "This is fit-led, so the email should not pretend there is a timing trigger.",
    ].filter(Boolean);
    state.commandResult = issues.length
      ? `${prospect.company} draft stress test: ${issues.join(" ")}`
      : `${prospect.company} draft stress test: trigger is specific, CTA is light, and the claims stay close to the available sources.`;
    state.commandConfirm = null;
  } else if (lower.includes("why") && lower.includes("score")) {
    state.commandResult = `${activeProspect().company} scores ${activeProspect().fitScore} because the current hypothesis has corroborated fit, reachability, and timing evidence.`;
    state.commandConfirm = null;
  } else if (lower.includes("weak evidence")) {
    const matches = kindlingAgentTools.searchWeakEvidence();
    state.commandResult = `Weak evidence: ${matches.map((prospect) => prospect.company).join(", ") || "none in the current deck"}.`;
    state.commandConfirm = null;
  } else if (lower.includes("warm prospect") || lower.includes("warm prospects")) {
    const matches = kindlingAgentTools.searchWarmProspects();
    state.commandResult = `Warm prospects: ${matches.map((prospect) => prospect.company).join(", ") || "none in the current deck"}.`;
    state.commandConfirm = null;
  } else {
    const context = currentUiContext();
    state.commandResult = `Using ${context.companyName} as the default context. Broader queries can search companies, people, sources, matches, and drafts.`;
    state.commandConfirm = null;
  }
  if (state.commandResult) {
    appendLocalCommandTurn("assistant", state.commandResult);
    state.commandResult = "";
  }
  state.commandValue = "";
  savePrototypeState();
  renderActPrototype();
}

async function handleCommandSubmit(event) {
  event.preventDefault();
  const input = $("commandInput");
  const value = input?.value.trim() || "";
  state.commandValue = value;
  state.commandOpen = true;
  if (!value) {
    state.commandResult = "";
    state.commandConfirm = null;
    state.commandStatus = "";
    renderActPrototype();
    return;
  }
  if (!state.token || !state.me) {
    handleLocalCommand(value);
    return;
  }
  state.commandResult = "";
  state.commandConfirm = null;
  try {
    await sendCommandChatMessage(value);
    state.commandValue = "";
  } catch (error) {
    state.commandMessages = state.commandMessages.filter((message) => message.status !== "sending");
    state.commandStatus = "";
    state.commandResult = `Agent chat unavailable: ${error.message}. Preview fallback can still answer basic deck questions.`;
    handleLocalCommand(value);
  }
}

function bindPrototypeEvents() {
  const page = $("actPage");
  const searchInput = $("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.searchQuery = searchInput.value;
      state.searchIndex = 0;
      renderActPrototype();
      window.requestAnimationFrame(() => $("searchInput")?.focus());
    });
  }
  for (const button of document.querySelectorAll("[data-search-index]")) {
    button.addEventListener("click", () => jumpToSearchResult(searchResults()[Number(button.dataset.searchIndex)]));
  }
  for (const scrim of document.querySelectorAll(".searchScrim")) {
    scrim.addEventListener("click", (event) => {
      if (event.target === scrim) closeSearchPalette();
    });
  }
  for (const button of page.querySelectorAll("[data-view]")) {
    button.addEventListener("click", () => {
      state.prototypeModal = null;
      setPrototypeView(button.dataset.view, button.dataset.prospect || state.activeProspectId);
    });
  }
  const chatButton = page.querySelector("[data-action='chat']");
  if (chatButton) chatButton.addEventListener("click", () => navigate("/chat"));
  const sidebarButton = page.querySelector("[data-action='toggle-sidebar']");
  if (sidebarButton) {
    sidebarButton.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      sessionStorage.setItem("kindling_sidebar_collapsed", state.sidebarCollapsed ? "1" : "0");
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-deck-mode]")) {
    button.addEventListener("click", () => {
      state.deckViewMode = button.dataset.deckMode;
      savePrototypeState();
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-focus-prospect]")) {
    button.addEventListener("click", () => {
      state.activeProspectId = button.dataset.focusProspect;
      state.deckViewMode = "focused";
      savePrototypeState();
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-pull-top]")) {
    button.addEventListener("click", () => {
      pullProspectToTop(button.dataset.pullTop);
      state.deckViewMode = "focused";
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-mention]")) {
    button.addEventListener("click", () => insertMention(button.dataset.mention));
  }
  for (const button of page.querySelectorAll("[data-action='open-search']")) {
    button.addEventListener("click", openSearchPalette);
  }
  for (const button of page.querySelectorAll("[data-action='logout']")) {
    button.addEventListener("click", logout);
  }
  for (const button of page.querySelectorAll("[data-action='open-command']")) {
    button.addEventListener("click", () => openCommandDrawer(button.dataset.commandScope || "global"));
  }
  for (const button of page.querySelectorAll("[data-action='dock-command']")) {
    button.addEventListener("click", () => {
      state.commandDocked = true;
      renderActPrototype();
      focusCommandEnd();
    });
  }
  for (const button of page.querySelectorAll("[data-action='collapse-command']")) {
    button.addEventListener("click", () => {
      state.commandDocked = false;
      renderActPrototype();
      focusCommandEnd();
    });
  }
  const commandInput = $("commandInput");
  if (commandInput) {
    commandInput.addEventListener("input", () => {
      state.commandValue = commandInput.value;
      state.commandResult = "";
      state.commandConfirm = null;
      renderActPrototype();
      focusCommandEnd();
    });
  }
  const commandBar = $("commandBar");
  if (commandBar) commandBar.addEventListener("submit", handleCommandSubmit);
  const confirmButton = page.querySelector("[data-action='confirm-command']");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      state.commandResult = "Confirmed in prototype. Production would execute the side effect through a permissioned action.";
      state.commandConfirm = null;
      renderActPrototype();
    });
  }
  const cancelButton = page.querySelector("[data-action='cancel-command']");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      state.commandConfirm = null;
      state.commandResult = "Command cancelled.";
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='close-command']")) {
    button.addEventListener("click", () => {
      state.commandResult = "";
      state.commandConfirm = null;
      state.commandStatus = "";
      state.commandOpen = false;
      state.commandDocked = false;
      state.commandValue = "";
      state.commandScopedProspectId = null;
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='dismiss']")) {
    button.addEventListener("click", () => {
      state.prototypeModal = "dismiss";
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='snooze']")) {
    button.addEventListener("click", () => {
      state.prototypeModal = "snooze";
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='call']")) {
    button.addEventListener("click", () => {
      const prospect = activeProspect();
      recordPrototypeActivity("Call queued", prospect, prospect.contact.phone || "No phone available");
      markActed(prospect);
      moveToNextProspect();
    });
  }
  for (const button of page.querySelectorAll("[data-action='email']")) {
    button.addEventListener("click", () => {
      state.prototypeModal = "email";
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='sources']")) {
    button.addEventListener("click", () => {
      state.prototypeModal = "sources";
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='close-modal']")) {
    button.addEventListener("click", () => {
      state.prototypeModal = null;
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-dismiss-reason]")) {
    button.addEventListener("click", () => {
      const prospect = activeProspect();
      recordPrototypeActivity("Dismissed", prospect, button.dataset.dismissReason);
      state.dismissedProspects = [...new Set([...state.dismissedProspects, prospect.id])];
      state.prototypeModal = null;
      moveToNextProspect();
    });
  }
  for (const button of page.querySelectorAll("[data-snooze-reason]")) {
    button.addEventListener("click", () => {
      const prospect = activeProspect();
      recordPrototypeActivity("Snoozed", prospect, button.dataset.snoozeReason);
      state.snoozedProspects = [...new Set([...state.snoozedProspects, prospect.id])];
      state.prototypeModal = null;
      moveToNextProspect();
    });
  }
  for (const button of page.querySelectorAll("[data-action='send-email']")) {
    button.addEventListener("click", () => {
      const prospect = activeProspect();
      recordPrototypeActivity("Draft reviewed", prospect, `Email path to ${prospect.contact.name}`);
      markActed(prospect);
      state.prototypeModal = null;
      moveToNextProspect();
    });
  }
  for (const button of page.querySelectorAll("[data-action='copy-email']")) {
    button.addEventListener("click", async () => {
      const prospect = activeProspect();
      const draft = currentEmailDraft(prospect);
      if (navigator.clipboard) await navigator.clipboard.writeText(emailBody(prospect, draft.subject, draft.body)).catch(() => undefined);
      recordPrototypeActivity("Email copied", prospect, `Draft copied for ${prospect.contact.name}`);
      state.commandResult = "Email copied to clipboard.";
      state.prototypeModal = null;
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='open-mail']")) {
    button.addEventListener("click", () => {
      const prospect = activeProspect();
      const draft = currentEmailDraft(prospect);
      recordPrototypeActivity("Mail opened", prospect, `Draft opened for ${prospect.contact.name}`);
      window.location.href = mailtoUrl(prospect, draft.subject, draft.body);
      state.prototypeModal = null;
      renderActPrototype();
    });
  }
  const exploreButton = page.querySelector("[data-action='explore-next-tier']");
  if (exploreButton) {
    exploreButton.addEventListener("click", () => {
      resetPrototypeDeckState();
      recordPrototypeActivity("Next tier opened", kindlingData.prospects[0], "Prototype reloaded the deck as weaker-tier supply");
      savePrototypeState();
      renderActPrototype();
    });
  }
  const replayButton = page.querySelector("[data-action='replay-deck']");
  if (replayButton) {
    replayButton.addEventListener("click", () => {
      resetPrototypeDeckState();
      recordPrototypeActivity("Deck replayed", kindlingData.prospects[0], "Today reset for review");
      savePrototypeState();
      renderActPrototype();
    });
  }
  for (const button of page.querySelectorAll("[data-action='advance-thread']")) {
    button.addEventListener("click", () => {
      state.prototypeModal = "email";
      state.activeProspectId = kindlingData.prospects[0]?.id || "";
      renderActPrototype();
    });
  }
}

window.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement?.tagName?.toLowerCase();
  const typing = activeTag === "input" || activeTag === "textarea" || activeTag === "select";
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearchPalette();
    return;
  }
  if (state.searchOpen) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearchPalette();
      return;
    }
    const results = searchResults();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      state.searchIndex = Math.min(state.searchIndex + 1, Math.max(results.length - 1, 0));
      renderActPrototype();
      window.requestAnimationFrame(() => $("searchInput")?.focus());
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      state.searchIndex = Math.max(state.searchIndex - 1, 0);
      renderActPrototype();
      window.requestAnimationFrame(() => $("searchInput")?.focus());
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      jumpToSearchResult(results[state.searchIndex]);
      return;
    }
    return;
  }
  if (state.route !== "/" && state.route !== "/act") return;
  if (!state.prototypeModal && state.prototypeView === "deck" && event.key === "/" && !typing) {
    event.preventDefault();
    openCommandDrawer("card");
    return;
  }
  if (typing) return;
  if (state.prototypeModal) {
    if (event.key === "Escape") {
      event.preventDefault();
      state.prototypeModal = null;
      renderActPrototype();
    }
    if (state.prototypeModal === "dismiss" && ["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      const reasons = ["Already a client", "Too big", "Bad timing", "Wrong fit"];
      const prospect = activeProspect();
      recordPrototypeActivity("Dismissed", prospect, reasons[Number(event.key) - 1]);
      state.dismissedProspects = [...new Set([...state.dismissedProspects, prospect.id])];
      state.prototypeModal = null;
      moveToNextProspect();
    }
    return;
  }
  if (state.prototypeView !== "deck") return;
  if (event.key.toLowerCase() === "o") {
    event.preventDefault();
    state.deckViewMode = state.deckViewMode === "overview" ? "focused" : "overview";
    savePrototypeState();
    renderActPrototype();
    return;
  }
  if (state.deckViewMode === "overview") return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    state.prototypeModal = "dismiss";
    renderActPrototype();
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    state.prototypeModal = "snooze";
    renderActPrototype();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setPrototypeView("dossier");
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    if (activeProspect().contact.email) {
      state.prototypeModal = "email";
      renderActPrototype();
    } else if (activeProspect().contact.phone) {
      const prospect = activeProspect();
      recordPrototypeActivity("Call queued", prospect, prospect.contact.phone);
      markActed(prospect);
      moveToNextProspect();
    }
  }
});

$("previewButton").addEventListener("click", () => navigate("/act"));
$("loginButton").addEventListener("click", login);
$("logoutButton").addEventListener("click", logout);
$("newChatButton").addEventListener("click", newChat);
$("homeActButton").addEventListener("click", () => navigate("/act"));
$("homeChatButton").addEventListener("click", () => navigate("/chat"));
$("homeSettingsButton").addEventListener("click", () => navigate("/settings"));
$("settingsHomeButton").addEventListener("click", () => navigate("/"));
$("saveSettingsButton").addEventListener("click", saveSettings);
$("loadPipelinesButton").addEventListener("click", loadPipelines);
$("addAccessButton").addEventListener("click", addAccess);
$("pipelineSelect").addEventListener("change", () => {
  if ($("pipelineSelect").value) $("pipelineInput").value = $("pipelineSelect").value;
});
$("composer").addEventListener("submit", sendMessage);
$("messageInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    $("composer").requestSubmit();
  }
});

window.addEventListener("popstate", () => {
  void renderRoute();
});

applyOneTimeDeckReset();

if (state.token) bootApp();
else void renderRoute();
