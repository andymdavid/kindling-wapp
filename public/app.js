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
