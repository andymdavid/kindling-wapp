const PROFILE_CACHE_KEY = "chat_wapp_profiles_v1";
const PIPELINES_CACHE_KEY = "chat_wapp_pipelines_v1";
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
  activeProspectId: localStorage.getItem("kindling_active_prospect") || "northstar-studio",
  dismissedProspects: loadPrototypeList("kindling_dismissed"),
  snoozedProspects: loadPrototypeList("kindling_snoozed"),
  actedProspects: loadPrototypeList("kindling_acted"),
  prototypeActivity: loadPrototypeList("kindling_activity"),
  deckViewMode: sessionStorage.getItem("kindling_deck_view_mode") || "focused",
  deckOrder: loadSessionList("kindling_deck_order"),
  sidebarCollapsed: sessionStorage.getItem("kindling_sidebar_collapsed") === "1",
  commandValue: "",
  commandResult: "",
  commandConfirm: null,
  prototypeModal: null,
};

const kindlingData = {
  prospects: [
    {
      id: "northstar-studio",
      company: "Northstar Studio",
      descriptor: "Web design agency - Melbourne - 18 staff",
      offering: "Website refresh opportunities",
      warmth: "cold",
      fitScore: 91,
      mode: "signal_led",
      whyNow: "Their homepage still ships a non-responsive layout on mobile and the copyright footer is four years stale.",
      gap: "A visibly dated site is undercutting a premium positioning claim.",
      angle: "Lead with a fast visual audit and show the mobile friction before pitching a rebuild.",
      contact: { name: "Mia Chen", role: "Managing director", email: "mia@northstar.example", phone: "+61 3 5550 0184", source: "Website team page", confidence: "High" },
      evidence: [
        { label: "Viewport meta missing on homepage", source: "Homepage scan", captured: "Today", confidence: "High", url: "https://northstar.example", type: "website" },
        { label: "Footer copyright reads 2021", source: "Website source", captured: "Today", confidence: "High", url: "https://northstar.example", type: "scan" },
        { label: "PageSpeed mobile score 41", source: "PageSpeed sample", captured: "Today", confidence: "Medium", url: "https://pagespeed.example/northstar", type: "performance" },
      ],
      history: ["No prior outreach found", "No CRM ownership conflict"],
      computeTrail: ["Stage 0: passed geography and size", "Stage 1: website artifact trigger found", "Stage 2: corroborated with PageSpeed", "Stage 3: synthesized outreach hypothesis"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Passed rules" }, { stage: "Stage 1", cost: "$0.18", outcome: "Trigger found" }, { stage: "Stage 2", cost: "$1.42", outcome: "Corroborated" }, { stage: "Stage 3", cost: "$0.31", outcome: "Hypothesis ready" }],
      draft: "Hi Mia - noticed Northstar's mobile homepage is working against the premium positioning you lead with. I put together a quick visual audit showing three fixes that would make the site feel current without forcing a full rebrand.",
      status: "ready",
    },
    {
      id: "stirling-industries",
      company: "Stirling Industries",
      descriptor: "Manufacturing - Perth - 72 staff",
      offering: "Custom AI systems for SMEs",
      warmth: "warm",
      fitScore: 87,
      mode: "signal_led",
      whyNow: "They posted two manual operations coordinator roles this week. Both ads point to repetitive reporting, routing, and spreadsheet reconciliation work.",
      gap: "Hiring suggests manual workflow pressure that an internal AI system could absorb.",
      angle: "Offer a low-risk workflow audit before the new hires inherit the same manual reporting loops.",
      contact: { name: "Renee Walsh", role: "Operations lead", email: "renee@stirling.example", phone: "", source: "LinkedIn profile match", confidence: "Medium" },
      evidence: [
        { label: "Operations coordinator ad mentions daily spreadsheet reconciliation", source: "Seek job ad", captured: "Yesterday", confidence: "High", url: "https://seek.example/stirling-ops", type: "job board" },
        { label: "Attended Other Stuff AI roundtable", source: "First-party event list", captured: "18 days ago", confidence: "High", url: "https://airspace.example/events/roundtable", type: "first-party" },
        { label: "Recent newsletter click on automation article", source: "First-party newsletter", captured: "6 days ago", confidence: "Medium", url: "https://airspace.example/newsletter/clicks", type: "first-party" },
      ],
      history: ["Roundtable attendee", "No sales thread opened yet"],
      computeTrail: ["Stage 0: passed ICP filters", "Stage 1: manual-role hire trigger found", "Stage 2: first-party warm signal fused", "Stage 3: contact path selected"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Passed ICP" }, { stage: "Stage 1", cost: "$0.34", outcome: "Manual-role trigger" }, { stage: "Stage 2", cost: "$0.62", outcome: "Warm signal fused" }, { stage: "Stage 3", cost: "$0.28", outcome: "Draft ready" }],
      draft: "Hi Renee - your recent ops coordinator ads read like the team is carrying a lot of repeatable reporting by hand. Since you joined our AI roundtable, I thought a focused workflow audit might be useful before you add another manual process around the new hire.",
      status: "partial",
    },
    {
      id: "adapt-by-design",
      company: "Adapt by Design",
      descriptor: "SME coaching - Subiaco - 9 staff",
      offering: "Relationship-led SME advisory",
      warmth: "warm",
      fitScore: 73,
      mode: "relationship_led",
      whyNow: "",
      gap: "Likely founder-led growth constraint, but there is no honest timing trigger in public data.",
      angle: "Use the shared connection path and lead with relevance, not urgency.",
      contact: { name: "Simon Burke", role: "Founder", email: "", phone: "+61 8 5550 0127", source: "ABN and event graph match", confidence: "Medium" },
      evidence: [
        { label: "Founder and business age verified", source: "ABN lookup mock", captured: "3 days ago", confidence: "High", url: "https://abr.example/adapt", type: "registry" },
        { label: "Shared event connection through Subiaco SME breakfast", source: "First-party event list", captured: "41 days ago", confidence: "Medium", url: "https://airspace.example/events/subiaco", type: "first-party" },
      ],
      history: ["Relationship-led ICP", "No runnable why-now trigger"],
      computeTrail: ["Stage 0: passed geography and business-age filters", "Stage 1: no cheap timing trigger", "Stage 2: reachability checked through first-party graph", "Stage 3: thin relationship-led hypothesis generated"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Passed relationship ICP" }, { stage: "Stage 1", cost: "$0.12", outcome: "No timing trigger" }, { stage: "Stage 2", cost: "$0.48", outcome: "Reachability found" }, { stage: "Stage 3", cost: "$0.22", outcome: "Thin hypothesis" }],
      draft: "Hi Simon - we both crossed paths around the Subiaco SME breakfast circuit. I work with founder-led service firms where growth creates more coordination than the team can comfortably hold, and thought there may be a useful conversation there.",
      status: "degraded",
    },
    {
      id: "harbour-health",
      company: "Harbour Health Co.",
      descriptor: "Allied health - Fremantle - 34 staff",
      offering: "Custom AI systems for SMEs",
      warmth: "cold",
      fitScore: 79,
      mode: "signal_led",
      whyNow: "They are hiring a client intake administrator with heavy repeat-form and follow-up responsibilities.",
      gap: "Client intake looks manual and fragmented.",
      angle: "Offer a contained intake automation audit tied to the role they are hiring for.",
      contact: { name: "Priya Nair", role: "Practice manager", email: "priya@harbourhealth.example", phone: "", source: "Practice website", confidence: "High" },
      evidence: [
        { label: "Client intake administrator role posted", source: "LinkedIn Jobs mock", captured: "Today", confidence: "High", url: "https://linkedin.example/jobs/harbour-intake", type: "job board" },
        { label: "Website exposes four separate intake PDFs", source: "Website scan", captured: "Today", confidence: "Medium", url: "https://harbourhealth.example/forms", type: "website" },
      ],
      history: ["No prior touch", "No known warm connection"],
      computeTrail: ["Stage 0: passed size and geography", "Stage 1: manual-role trigger found", "Stage 2: website process artifact corroborated", "Stage 3: email path selected"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Passed rules" }, { stage: "Stage 1", cost: "$0.29", outcome: "Hiring trigger" }, { stage: "Stage 2", cost: "$0.96", outcome: "PDF artifact corroborated" }, { stage: "Stage 3", cost: "$0.25", outcome: "Email draft ready" }],
      draft: "Hi Priya - saw Harbour Health is hiring around client intake, and your site still points patients through several separate PDF forms. There may be a cleaner way to reduce admin load before the next person starts.",
      status: "ready",
    },
    {
      id: "cygnet-west",
      company: "Cygnet West",
      descriptor: "Commercial real estate - Perth - 140+ experts",
      offering: "Wingman / Flight Deck pilots",
      warmth: "cold",
      fitScore: 94,
      mode: "signal_led",
      whyNow: "No sharp trigger yet; this is fit-led. PropTech maturity makes a workflow-layer pilot plausible.",
      gap: "Existing data visibility needs to become coordinated action, narrative updates, approval workflows, and client-ready follow-through.",
      angle: "Lead with action queues above existing systems.",
      contact: { name: "Denis Leane", role: "CFO", email: "", phone: "", source: "Public PropTech article", confidence: "Medium" },
      evidence: [
        { label: "WA-owned commercial real estate agency with 140+ experts", source: "Cygnet West official site", captured: "Research brief", confidence: "High", url: "https://cygnetwest.com/about-cygnet-west/", type: "company" },
        { label: "Integrated PropTech platform with live performance data and automated reporting", source: "Cygnet West PropTech page", captured: "Research brief", confidence: "High", url: "https://cygnetwest.com/service/proptech/", type: "proptech" },
        { label: "MRI webinar centers data visibility, client reporting, and operational efficiency", source: "MRI Software webinar", captured: "Research brief", confidence: "Medium", url: "https://www.mrisoftware.com/au/resources/discover-how-cygnet-west-revolutionised-data-visibility-client-reporting-operational-efficiency/", type: "third-party" },
        { label: "WA infrastructure and property-market context may increase operating complexity", source: "WA Government and Cushman & Wakefield", captured: "Research brief", confidence: "Medium", url: "https://www.cushmanwakefield.com/en/australia/insights/perth-marketbeat", type: "market" },
      ],
      history: ["No prior outreach in prototype memory", "Public research suggests technology leadership, not technology immaturity"],
      computeTrail: ["Stage 0: passed enterprise-fit and geography rules", "Stage 1: PropTech maturity signal found", "Stage 2: service-line operating surfaces mapped", "Stage 3: multi-pilot outreach brief synthesized"],
      stageCosts: [{ stage: "Stage 0", cost: "$0", outcome: "Passed fit rules" }, { stage: "Stage 1", cost: "$0.44", outcome: "PropTech signal found" }, { stage: "Stage 2", cost: "$3.86", outcome: "Research brief compiled" }, { stage: "Stage 3", cost: "$0.74", outcome: "Pilot strategy synthesized" }],
      draft: "Hi Denis - Cygnet West already looks ahead of many agencies on data visibility and client reporting. Wingman and Flight Deck are strongest when that data needs to become coordinated action: exception queues, narrative updates, approval workflows, and accountable follow-through across teams.",
      status: "partial",
      researchBrief: {
        title: "Wingman / Flight Deck Opportunity Brief",
        executiveSummary: [
          "Cygnet West is a strong-fit prospect because it combines a large, workflow-heavy commercial real estate operation with visible PropTech maturity.",
          "The strongest pitch should not frame Wingman as basic digital transformation. Cygnet West already emphasizes live performance data, automated reporting, client access to internal systems, cloud technology, and PropTech leadership.",
          "The better angle is that Wingman and Flight Deck sit above existing systems as an AI-enabled workflow and decision layer that turns data into action queues, narrative updates, stakeholder follow-through, client-ready reports, and accountable operating workflows.",
        ],
        serviceLines: ["Commercial property management", "Retail property management", "Agency and leasing", "Tenant representation", "Project management", "Research and advisory", "Facilities management", "PropTech and business systems"],
        strategicSignals: [
          "Large managed portfolio across diverse asset classes creates coordination and reporting pressure.",
          "Public materials emphasize live performance data, automated reporting, system integration, and client transparency.",
          "Recent leadership and market activity point to industrial growth, retail management, research capability, stakeholder relationships, and significant asset management.",
        ],
        opportunityAreas: [
          {
            title: "Property Management Command Layer",
            evidence: "Cygnet West manages more than 2,500 WA properties and public materials emphasize transparent performance reporting.",
            hypothesis: "Wingman and Flight Deck can triage tenant, owner, contractor, and client requests by asset, urgency, and commercial impact.",
            value: ["Fewer missed follow-ups", "Faster client and tenant response", "Better escalation visibility", "More proactive asset interventions"],
            targets: ["Commercial Property Management", "Retail Property Management", "Facilities Management", "Business Management Systems"],
          },
          {
            title: "Client Reporting and Insight Automation",
            evidence: "Cygnet West already prioritizes real-time client data access, automated reporting, visualization, and transparency.",
            hypothesis: "Wingman can generate narrative summaries, variance explanations, recommendations, and briefing packs from existing dashboards.",
            value: ["Less analyst and manager assembly time", "Faster report turnaround", "More consistent client-facing narrative quality"],
            targets: ["PropTech", "Business Management Systems", "Corporate Finance", "Research and Advisory"],
          },
          {
            title: "Research and Market-Intelligence Production",
            evidence: "Research and Advisory publishes updates across WA economy, Perth office, industrial, residential, retail, and expert opinion categories.",
            hypothesis: "Wingman can assist source monitoring, evidence extraction, first-draft market briefs, comparable summaries, and expert review workflows.",
            value: ["Faster market briefs", "More scalable thought leadership", "Better source traceability and expert sign-off"],
            targets: ["Research and Advisory", "Valuation and Advisory", "Marketing", "Agency Services"],
          },
          {
            title: "Leasing and Tenant-Representation Pipeline Support",
            evidence: "Cygnet West supports leasing, tenant representation, financial analysis, negotiations, renewals, and property strategy.",
            hypothesis: "Flight Deck can track multi-party pursuits, client inputs, document status, negotiation milestones, and next steps.",
            value: ["Improved pursuit discipline", "Reduced broker/admin load", "More consistent tenant and landlord experience"],
            targets: ["Agency Services", "Commercial Leasing", "Tenant Representation", "Industrial Agency"],
          },
        ],
        outreachStrategy: {
          positioning: "Lead with Cygnet West's existing technology leadership. The gap is turning data into coordinated action, not introducing generic transformation.",
          entryPoints: ["CFO / PropTech / Business Management Systems", "Commercial and Retail Property Management", "Research and Advisory", "Strategic Client and Stakeholder Relationships"],
          pilots: ["Retail or commercial property management exception reporting", "Quarterly market update workflow", "Leasing pursuit coordination"],
        },
        discoveryQuestions: [
          "Which internal systems beyond MRI are used for property management, leasing CRM, document management, support/ticketing, and marketing automation?",
          "Which service line has the highest immediate coordination burden?",
          "Which client reporting outputs are most time-consuming today?",
          "What data-access constraints exist for an AI/workflow pilot?",
          "Who owns technology procurement?",
        ],
        limitations: [
          "Employee count varies by source; use the official 140+ figure for outreach.",
          "Some third-party technographic and revenue claims were not corroborated and should not be used in outreach without verification.",
          "Public research does not confirm the full internal systems stack, procurement ownership, exact workflow pain severity, or current AI policy.",
          "Named possible champions are based on public source references and should be verified before direct outreach.",
        ],
        sources: [
          "https://cygnetwest.com/",
          "https://cygnetwest.com/about-cygnet-west/",
          "https://cygnetwest.com/service/proptech/",
          "https://cygnetwest.com/services/management-services/",
          "https://cygnetwest.com/service/research-advisory/",
          "https://www.mrisoftware.com/au/resources/discover-how-cygnet-west-revolutionised-data-visibility-client-reporting-operational-efficiency/",
          "https://www.businessnews.com.au/Company/Cygnet-West",
          "https://www.cushmanwakefield.com/en/australia/insights/perth-marketbeat",
        ],
      },
    },
  ],
  replies: [
    { id: "reply-1", company: "Stirling Industries", contact: "Renee Walsh", state: "objection", age: "3d", urgency: "danger", gist: "Interested, but worried the team will see automation as headcount reduction.", nextMove: "Handle objection" },
    { id: "reply-2", company: "Northstar Studio", contact: "Mia Chen", state: "scheduling", age: "22h", urgency: "warning", gist: "Asked for examples of quick mobile fixes before booking.", nextMove: "Send audit times" },
    { id: "reply-3", company: "Adapt by Design", contact: "Simon Burke", state: "gone quiet", age: "8d", urgency: "danger", gist: "Opened the note twice, no response after first nudge.", nextMove: "Send final light nudge" },
  ],
};

const kindlingModel = buildPrototypeDataModel(kindlingData.prospects);
kindlingData.prospects = projectDeckProspects(kindlingModel);

const $ = (id) => document.getElementById(id);

function buildPrototypeDataModel(prospects) {
  const now = Date.UTC(2026, 5, 9);
  const ownerCompany = {
    id: stableUuid("owner-company:adapt-by-design"),
    name: "Adapt by Design",
    website: "https://adaptbydesign.example",
    location: "Perth, WA",
    summary: "Adapt helps businesses improve workflows with practical AI, automation, training, and implementation support.",
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
      dataRing: prospect.status === "ready" ? "outreach" : prospect.status === "partial" ? "matched" : "enhanced",
      duplicateStatus: "unique",
      enrichmentStatus: "complete",
      confidence: prospect.fitScore / 100,
      profile: {
        summary: prospect.gap,
        description: prospect.descriptor,
        size: { employeeCountBucket: parseDescriptor(prospect.descriptor).employeeCountBucket, locationCount: 1, confidence: 0.7 },
        contactPaths,
        primaryPersonIds: [stableUuid(`person:${prospect.id}:${prospect.contact.name}`)],
        currentCustomerProfileVersionId: stableUuid(`customer-profile-version:${prospect.id}:1`),
        prototypeSlug: prospect.id,
        displayDescriptor: prospect.descriptor,
        mode: prospect.mode,
        warmth: prospect.warmth,
        whyNow: prospect.whyNow,
        wedge: prospect.angle,
        history: prospect.history,
        stageCosts: prospect.stageCosts,
        researchBrief: prospect.researchBrief || null,
        marketProfileName: prospect.offering,
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
  const outreachDrafts = prospects.map((prospect, index) => {
    const company = companies[index];
    const match = matches[index];
    const email = buildOutreachEmail(prospect);
    return {
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
    };
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
      return {
        id: profileData.prototypeSlug || company.id,
        company: company.name,
        descriptor: profileData.displayDescriptor || [company.industry, company.location].filter(Boolean).join(" - "),
        offering: profile?.name || profileData.marketProfileName || match.profileKey || "Unassigned offering",
        warmth: profileData.warmth || "cold",
        fitScore: match.score?.overallScore || Math.round(company.confidence * 100),
        mode: profileData.mode || "signal_led",
        whyNow: profileData.whyNow || "",
        gap: match.reason || profileData.summary || "",
        angle: profileData.wedge || match.score?.nextBestAction || "",
        contact: {
          name: person.name || "Unknown contact",
          role: person.role || "Role unknown",
          email: company.profile?.contactPaths?.find((path) => path.type === "email")?.value || "",
          phone: company.profile?.contactPaths?.find((path) => path.type === "phone")?.value || "",
          source: person.notes || "No source recorded",
          confidence: numberToConfidence(person.buyerConfidence || 0),
        },
        evidence: (sourcesByCompany.get(company.id) || []).map((source) => ({
          label: source.title,
          source: source.summary.split(" - ")[0],
          captured: source.extractedData?.captured || (source.lastCheckedAt ? "Checked" : "Unverified"),
          confidence: numberToConfidence(source.confidence),
          url: source.url || "",
          type: source.sourceType,
        })),
        history: profileData.history || (activitiesByCompany.get(company.id) || []).map((activity) => activity.summary),
        computeTrail: (activitiesByCompany.get(company.id) || []).filter((activity) => activity.actor === "pipeline").map((activity) => activity.summary),
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
  if (prospect.id === "stirling-industries") return "saw Stirling posted two operations coordinator roles this week.";
  if (prospect.id === "northstar-studio") return "noticed Northstar's mobile homepage is still difficult to use on smaller screens.";
  if (prospect.id === "harbour-health") return "saw Harbour Health is hiring for client intake admin.";
  if (prospect.id === "adapt-by-design") return "we crossed paths around the Subiaco SME breakfast circuit.";
  if (prospect.id === "cygnet-west") return "Cygnet West already looks ahead of many agencies on data visibility and client reporting.";
  return prospect.whyNow || prospect.gap || `had a quick thought about ${prospect.company}.`;
}

function observationLine(prospect) {
  if (prospect.id === "stirling-industries") return "Both ads mention reporting, routing, and spreadsheet reconciliation. That usually points to repeatable coordination work sitting with the team.";
  if (prospect.id === "northstar-studio") return "For a premium studio, that kind of friction can quietly work against the first impression.";
  if (prospect.id === "harbour-health") return "The role and the separate intake forms suggest there may be repeat admin that patients and staff both feel.";
  if (prospect.id === "adapt-by-design") return "Founder-led advisory firms often hit a point where growth creates more coordination than the team can comfortably hold.";
  if (prospect.id === "cygnet-west") return "The gap may be turning strong reporting infrastructure into action queues, narrative updates, and accountable follow-through.";
  return prospect.gap;
}

function wedgeLine(prospect) {
  if (prospect.id === "stirling-industries") return "We can map which parts could be simplified before new hires inherit the same manual loops.";
  if (prospect.id === "northstar-studio") return "I can send a short visual audit with the three fixes most likely to make the site feel current.";
  if (prospect.id === "harbour-health") return "We can look at a contained intake workflow audit tied to the role you are hiring for.";
  if (prospect.id === "adapt-by-design") return "It may be worth comparing notes on where simple workflow support would help without changing how you work with clients.";
  if (prospect.id === "cygnet-west") return "Wingman and Flight Deck could sit above existing systems as a practical workflow layer.";
  return prospect.angle;
}

function credibilityLine(prospect) {
  const firstPartySignal = prospect.evidence?.find((item) => item.type === "first-party" || item.source?.includes("First-party"));
  if (firstPartySignal) return `I am basing this on ${firstPartySignal.source.toLowerCase()}, not a generic list scrape.`;
  return "";
}

function ctaLine(prospect) {
  if (prospect.id === "northstar-studio") return "Worth sending the audit over?";
  if (prospect.id === "adapt-by-design") return "Worth a quick conversation?";
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
  if (state.route === "/" || state.route === "/act") {
    stopPolling();
    showOnly("actPage");
    renderActPrototype();
    return;
  }

  if (!state.token || !state.me) {
    stopPolling();
    showOnly("login");
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
  page.innerHTML = `
    <div class="kindlingShell ${state.sidebarCollapsed ? "sidebarClosed" : ""}">
      <aside class="kindlingNav" aria-label="Kindling navigation">
        <div class="brandLockup">
          <div class="brandMark">
            <img src="/kindling-logo.png" alt="" />
            <strong>Kindling</strong>
          </div>
          <button class="sidebarToggle" type="button" data-action="toggle-sidebar" aria-label="${state.sidebarCollapsed ? "Open sidebar" : "Close sidebar"}">${iconSvg(state.sidebarCollapsed ? "panelRightOpen" : "panelLeftClose")}</button>
        </div>
        ${renderPrototypeNav(view)}
      </aside>
      <section class="kindlingMain">
        ${renderPrototypeView(view)}
      </section>
    </div>
    ${state.prototypeModal ? renderPrototypeModal() : ""}
  `;
  bindPrototypeEvents();
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

function iconSvg(name) {
  const icons = {
    layers: `<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>`,
    inbox: `<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-7Z"/>`,
    sliders: `<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>`,
    workflow: `<rect width="8" height="8" x="3" y="3" rx="2"/><rect width="8" height="8" x="13" y="13" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/>`,
    fileText: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>`,
    panelLeftClose: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>`,
    panelRightOpen: `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m8 9 3 3-3 3"/>`,
  };
  return `<svg class="navIcon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.layers}</svg>`;
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
            <button class="primaryAction" type="button" data-action="explore-next-tier">Explore next tier</button>
            <button type="button" data-action="replay-deck">Replay today's deck</button>
          </div>
        </section>
        ${renderCommandBar()}
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
      ${renderCommandBar()}
    </div>
  `;
}

function renderDeckModeToggle(mode) {
  return `
    <div class="viewToggle" role="group" aria-label="Deck view">
      <button class="${mode === "focused" ? "active" : ""}" type="button" data-deck-mode="focused">Focused</button>
      <button class="${mode === "overview" ? "active" : ""}" type="button" data-deck-mode="overview">Overview</button>
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
      <section class="overviewList" aria-label="Today's deck overview">
        ${prospects.map((item, index) => `
          <article class="overviewCard ${item.id === state.activeProspectId ? "selected" : ""}">
            <button class="overviewMain" type="button" data-focus-prospect="${item.id}">
              <header>
                <span>${item.offering}</span>
                <strong>${item.company}</strong>
              </header>
              <section class="${item.whyNow ? "" : "relationship"}">
                <em>${item.whyNow ? "Why now" : "Way in"}</em>
                <p>${item.whyNow || item.gap}</p>
              </section>
              <footer>
                <span class="warmDot ${item.warmth}" title="${item.warmth}"></span>
                <small>${item.warmth}</small>
                <small>${item.fitScore} fit</small>
              </footer>
            </button>
            <button type="button" ${index === 0 ? "disabled" : ""} data-pull-top="${item.id}">Pull to top</button>
          </article>
        `).join("")}
      </section>
      ${renderCommandBar()}
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
  return commandEntities().filter((entity) => entity.label.toLowerCase().includes(query)).slice(0, 6);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCommandBar() {
  const suggestions = commandSuggestions();
  const hasInput = Boolean(state.commandValue.trim());
  const isOpen = hasInput || suggestions.length || state.commandResult || state.commandConfirm;
  const context = currentUiContext();
  return `
    <section class="commandLayer ${isOpen ? "open" : ""}" aria-label="Command bar">
      ${isOpen ? `<button class="commandFrost" type="button" data-action="close-command" aria-label="Close command panel"></button>` : ""}
      ${isOpen ? `
        <div class="commandPanel" role="dialog" aria-label="Agent chat">
          <header>
            <span>Agent chat</span>
            <button type="button" data-action="close-command">Close</button>
          </header>
          <section class="commandContext" aria-label="Default chat context">
            <span>Working on</span>
            <strong>${escapeHtml(context.companyName)}</strong>
            <small>${escapeHtml(context.personName)} · ${escapeHtml(context.mode)}</small>
          </section>
          ${suggestions.length ? `
            <div class="mentionMenu">
              ${suggestions.map((entity) => `<button type="button" data-mention="${escapeHtml(entity.label)}"><strong>${escapeHtml(entity.label)}</strong><span>${entity.type}</span></button>`).join("")}
            </div>
          ` : ""}
          ${state.commandResult ? `<p class="commandResult">${escapeHtml(state.commandResult)}</p>` : ""}
          ${state.commandConfirm ? `
            <div class="commandConfirm">
              <span>${escapeHtml(state.commandConfirm)}</span>
              <button type="button" data-action="confirm-command">Confirm</button>
              <button type="button" data-action="cancel-command">Cancel</button>
            </div>
          ` : ""}
        </div>
      ` : ""}
      <form class="commandBar" id="commandBar">
        <span aria-hidden="true">@</span>
        <input id="commandInput" type="text" value="${escapeHtml(state.commandValue)}" placeholder="Ask or search. Use @ to mention a company, contact, or offering." autocomplete="off" />
        <button type="submit">Run</button>
      </form>
    </section>
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
  return `
    <article class="prospectCard ${prospect.status}">
      <header class="prospectHeader">
        <div>
          <h1>${prospect.company}</h1>
          <span>${prospect.descriptor}</span>
        </div>
        <div class="cueCluster" aria-label="Prospect cues">
          <span class="warmFlag ${prospect.warmth}">${prospect.warmth}</span>
          <span class="fitCue">${prospect.fitScore} fit</span>
        </div>
      </header>
      <section class="contactRow">
        <div class="avatar" aria-hidden="true">${contact.name.slice(0, 1)}</div>
        <div>
          <strong>${contact.name}</strong>
          <span>${contact.role}</span>
        </div>
        <div class="channelGates" aria-label="Available outreach channels">
          <span class="${contact.phone ? "available" : "unavailable"}">Call</span>
          <span class="${contact.email ? "available" : "unavailable"}">Email</span>
        </div>
      </section>
      ${prospect.whyNow ? `
        <section class="whyNow">
          <span>Why now</span>
          <p>${prospect.whyNow}</p>
          <button class="sourceLink" type="button" data-action="sources">${prospect.evidence.length} sources</button>
        </section>
      ` : `
        <section class="relationshipLead">
          <span>Relationship-led</span>
          <p>No timing trigger found. Lead with fit and reachability.</p>
        </section>
      `}
      <section class="angleBlock">
        <span>Wedge</span>
        <p>${prospect.angle}</p>
      </section>
      <footer class="cardActions">
        <button type="button" data-action="dismiss">Dismiss</button>
        <button type="button" data-action="snooze">Snooze</button>
        <button class="dossierAction" type="button" data-view="dossier" data-prospect="${prospect.id}">View Dossier</button>
        ${primaryAction}
      </footer>
    </article>
  `;
}

function renderCardPrimaryAction(prospect) {
  const contact = prospect.contact;
  if (contact.email) return `<button class="primaryAction" type="button" data-action="email">Review Email</button>`;
  if (contact.phone) return `<button class="primaryAction" type="button" data-action="call">Call ${contact.name.split(" ")[0]}</button>`;
  return `<button class="primaryAction" type="button" data-view="dossier" data-prospect="${prospect.id}">Find path</button>`;
}

function renderDossierView(prospect) {
  const primaryAction = prospect.contact.email
    ? `<button class="primaryAction" type="button" data-action="email">Review Email</button>`
    : `<button class="primaryAction" type="button" ${prospect.contact.phone ? "" : "disabled"} data-action="call">Call ${prospect.contact.name.split(" ")[0]}</button>`;
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
            <button class="evidenceRow" type="button" aria-label="Source: ${item.label}">
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
