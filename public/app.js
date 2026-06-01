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

if (state.token) bootApp();
else showOnly("login");
