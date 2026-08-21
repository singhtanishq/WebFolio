/*
 * Shadow AI Detection Assessment
 * Front-end only. The production score and lead record must be validated server-side.
 */

const CONFIG = {
  // Replace this with the deployed Cloudflare Worker URL before launch.
  API_ENDPOINT: "",
  DEMO_MODE: false,
  MAX_SCORE: 24
};

const QUESTIONS = [
  { id:"discovery", category:"Discovery", title:"Can your organization identify the AI agents and agentic workflows currently operating across the enterprise?", options:[
    [0,"Not sure / not established","No reliable discovery process or visibility."],
    [1,"Partially","Some teams or environments are inventoried."],
    [2,"Established","A maintained discovery process covers the relevant estate."]
  ]},
  { id:"inventory", category:"Discovery", title:"Is there an owned inventory of AI agents, agentic workflows and their key integrations?", options:[
    [0,"No","There is no owned inventory."],[1,"Partial","An inventory exists but has known gaps or weak ownership."],[2,"Yes","Inventory and ownership are maintained and reviewed."]
  ]},
  { id:"identity", category:"Identity & Access", title:"Does each production AI agent have a distinct, attributable identity rather than relying on shared human credentials?", options:[
    [0,"No / unknown","Shared or unclear identity is used."],[1,"Partial","Some agents have attributable identities."],[2,"Yes","Production agents use distinct, attributable identities."]
  ]},
  { id:"credentials", category:"Identity & Access", title:"Are agent credentials centrally managed, scoped and revocable?", options:[
    [0,"No / unknown","Credential control is ad hoc or unclear."],[1,"Partial","Some controls exist but coverage is incomplete."],[2,"Yes","Credentials are managed, scoped and revocable."]
  ]},
  { id:"authorization", category:"Identity & Access", title:"Are an agent’s permissions limited to the minimum access required for its job?", options:[
    [0,"No / unknown","Permissions are broad, inherited or unclear."],[1,"Partial","Least privilege is applied to some agents or tools."],[2,"Yes","Permissions are explicitly scoped and reviewed."]
  ]},
  { id:"tools", category:"Runtime", title:"Can security or platform owners control which tools and external actions an agent is allowed to invoke?", options:[
    [0,"No / unknown","Tool access is largely uncontrolled or unclear."],[1,"Partial","Controls exist for some tools or workflows."],[2,"Yes","Tool access is explicitly governed by policy."]
  ]},
  { id:"runtime", category:"Runtime", title:"Can risky agent actions be blocked, constrained or evaluated before execution?", options:[
    [0,"No / unknown","There is no reliable pre-action control."],[1,"Partial","Some high-risk paths are gated."],[2,"Yes","Runtime policy can evaluate and constrain risky actions."]
  ]},
  { id:"approval", category:"Runtime", title:"Do high-impact or irreversible agent actions require human approval when appropriate?", options:[
    [0,"No / unknown","No defined approval control."],[1,"Partial","Approval exists for selected workflows."],[2,"Yes","Risk-based approval is defined for appropriate actions."]
  ]},
  { id:"data", category:"Data", title:"Is an agent’s access to sensitive or regulated data explicitly constrained and reviewable?", options:[
    [0,"No / unknown","Data access is broad or unclear."],[1,"Partial","Some sensitive-data boundaries exist."],[2,"Yes","Sensitive-data access is explicitly constrained and reviewable."]
  ]},
  { id:"injection", category:"Data", title:"Are prompt injection, indirect instructions and agent-specific abuse paths addressed in the security model?", options:[
    [0,"No / unknown","These threats are not materially addressed."],[1,"Partial","Controls or testing exist for selected workflows."],[2,"Yes","The threat model and controls explicitly address these paths."]
  ]},
  { id:"logging", category:"Governance", title:"Are agent actions, tool calls and important decisions logged in a way security teams can investigate?", options:[
    [0,"No / unknown","There is little or no useful agent-level audit trail."],[1,"Partial","Logs exist for some agents or systems."],[2,"Yes","Relevant agent activity is centrally available for investigation."]
  ]},
  { id:"governance", category:"Governance", title:"Can your organization establish ownership and reconstruct who or what authorized an agent action?", options:[
    [0,"No / unknown","Ownership or authorization cannot be reliably reconstructed."],[1,"Partial","Some workflows have ownership and audit trails."],[2,"Yes","Ownership and authorization can be reconstructed for relevant actions."]
  ]}
];

const CATEGORY_IDS = {
  "Discovery": ["discovery","inventory"],
  "Identity & Access": ["identity","credentials","authorization"],
  "Runtime": ["tools","runtime","approval"],
  "Data": ["data","injection"],
  "Governance": ["logging","governance"]
};

const state = { answers:{}, result:null, stickySuppressed:false };

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
}

function renderQuestions() {
  const list = $("#questionList");
  list.innerHTML = QUESTIONS.map((q,index) => `
    <div class="question" data-question="${q.id}" role="group" aria-labelledby="question-title-${q.id}" aria-describedby="question-help-${q.id}">
      <div class="question-top">
        <div class="question-number">QUESTION ${String(index+1).padStart(2,"0")} / ${QUESTIONS.length}</div>
        <div class="question-category">${escapeHtml(q.category)}</div>
      </div>
      <div class="question-prompt">
        <span class="prompt-label">Control question</span>
        <span class="question-title" id="question-title-${q.id}">${escapeHtml(q.title)}</span>
        <span class="question-helper" id="question-help-${q.id}">Select one response that best matches the current state.</span>
      </div>
      <div class="options">
        ${q.options.map(([value,title,description]) => `
          <div class="option">
            <input type="radio" id="${q.id}-${value}" name="${q.id}" value="${value}">
            <label for="${q.id}-${value}"><strong>${escapeHtml(title)}</strong>${escapeHtml(description)}</label>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  $$('input[type="radio"]', list).forEach(input => {
    input.addEventListener("change", () => {
      state.answers[input.name] = Number(input.value);
      const question = input.closest(".question");
      question.classList.add("is-active");
      updateProgress();
      autoAdvanceFromQuestion(question);
    });
  });
}

function updateProgress() {
  const answered = Object.keys(state.answers).length;
  const percent = Math.round((answered / QUESTIONS.length) * 100);
  const text = `${answered} of ${QUESTIONS.length} answered`;
  $("#progressText").textContent = text;
  $("#progressPercent").textContent = `${percent}%`;
  $("#progressBar").style.width = `${percent}%`;
  $("#stickyProgressText").textContent = text;
  $("#stickyProgressPercent").textContent = `${percent}%`;
  $("#stickyProgressBar").style.width = `${percent}%`;
}

function autoAdvanceFromQuestion(question) {
  if (!question) return;

  const currentIndex = QUESTIONS.findIndex(q => q.id === question.dataset.question);
  if (currentIndex < 0) return;

  const scrollAmount = question.getBoundingClientRect().height + 14;

  window.setTimeout(() => {
    if (currentIndex === QUESTIONS.length - 1) {
      const actions = $(".assessment-actions");
      const topbarHeight = document.querySelector(".topbar")?.offsetHeight || 72;
      const sticky = $("#stickyProgress");
      const stickyHeight = sticky && !sticky.hidden ? sticky.offsetHeight : 0;
      const targetTop = actions.getBoundingClientRect().top + window.scrollY - topbarHeight - stickyHeight - 18;
      window.scrollTo({top: Math.max(0, targetTop), behavior:"smooth"});
      return;
    }

    window.scrollBy({top: scrollAmount, behavior:"smooth"});
  }, 90);
}

function allAnswered() {
  return QUESTIONS.every(q => Number.isInteger(state.answers[q.id]));
}

function localScore() {
  return QUESTIONS.reduce((sum,q) => sum + (state.answers[q.id] || 0), 0);
}

function bandForScore(score) {
  if (score <= 8) return {name:"Limited control coverage", summary:"Your responses indicate several foundational control areas are not established or are not yet visible to the security function."};
  if (score <= 16) return {name:"Developing control coverage", summary:"Your responses indicate a mixed control picture: some protections are established, while material visibility or enforcement gaps remain."};
  return {name:"Established control coverage", summary:"Your responses indicate broader control coverage across the areas screened, while the assessment still does not validate the controls technically."};
}

function categoryScores(scoreAnswers=state.answers) {
  return Object.entries(CATEGORY_IDS).map(([name,ids]) => {
    const score = ids.reduce((sum,id) => sum + Number(scoreAnswers[id] || 0), 0);
    const max = ids.length * 2;
    const ratio = score / max;
    let label = ratio < .34 ? "Limited" : ratio < .67 ? "Developing" : "Established";
    return {name,score,max,label};
  });
}

function buildResultPayload() {
  const score = localScore();
  const band = bandForScore(score);
  return {score,maxScore:CONFIG.MAX_SCORE,band:band.name,summary:band.summary,categories:categoryScores()};
}

function showGate() {
  $("#resultsGate").hidden = false;
  state.stickySuppressed = true;

  const sticky = $("#stickyProgress");
  if (sticky) {
    sticky.hidden = true;
    sticky.setAttribute("aria-hidden", "true");
  }

  // Bring the lead form into a comfortable reading position so the
  // complete form and the submit CTA are visible without being covered.
  window.requestAnimationFrame(() => {
    const leadForm = $("#leadForm");
    if (!leadForm) return;
    const topOffset = window.innerWidth <= 700 ? 105 : 150;
    const targetTop = leadForm.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({top: Math.max(0, targetTop), behavior:"smooth"});
  });
}

function renderResult(result) {
  state.result = result;
  state.stickySuppressed = true;
  $("#resultsGate").hidden = true;
  $("#result").hidden = false;
  $("#scoreValue").textContent = result.score;
  $("#resultBand").textContent = result.band;
  $("#resultSummary").textContent = result.summary;
  $("#categoryResults").innerHTML = (result.categories || []).map(item => `
    <div class="category-result">
      <span>${escapeHtml(item.name)}</span>
      <strong>${escapeHtml(item.score)} / ${escapeHtml(item.max)}</strong>
      <small>${escapeHtml(item.label)}</small>
    </div>
  `).join("");
  $("#result").scrollIntoView({behavior:"smooth",block:"start"});
  window.setTimeout(requestStickyUpdate, 450);
}

function captureUtm() {
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  return Object.fromEntries(keys.map(k => [k, params.get(k) || ""]).filter(([,v]) => v));
}

function validLinkedIn(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)linkedin\.com$/i.test(url.hostname.replace(/^www\./,""));
  } catch { return false; }
}

async function submitLead(event) {
  event.preventDefault();
  const error = $("#leadError");
  error.hidden = true;
  const button = $("#leadButton");
  const email = $("#email").value.trim();
  const jobTitle = $("#jobTitle").value.trim();
  const company = $("#company").value.trim();
  const linkedin = $("#linkedin").value.trim();
  const consent = $("#consent").checked;

  if (!email || !jobTitle || !company || !consent) {
    error.textContent = "Please complete the required fields and confirm that you want to receive your result.";
    error.hidden = false;
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    error.textContent = "Please enter a valid work email address.";
    error.hidden = false;
    return;
  }
  if (!validLinkedIn(linkedin)) {
    error.textContent = "If provided, LinkedIn must be an https://www.linkedin.com/... URL.";
    error.hidden = false;
    return;
  }

  button.disabled = true;
  button.setAttribute("aria-busy","true");
  button.innerHTML = "Generating your result…";

  const payload = {
    answers: QUESTIONS.map(q => ({id:q.id,value:state.answers[q.id]})),
    profile:{email,jobTitle,company,linkedin},
    metadata:{path:window.location.pathname,referrer:document.referrer || "",...captureUtm()}
  };

  try {
    if (CONFIG.DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 700));
      renderResult(buildResultPayload());
      return;
    }

    if (!CONFIG.API_ENDPOINT) {
      throw new Error("The results service is not connected yet. Configure the assessment API endpoint before launch.");
    }

    const response = await fetch(CONFIG.API_ENDPOINT, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
      credentials:"omit"
    });

    if (!response.ok) throw new Error("The results service returned an error. Please try again.");
    const data = await response.json();
    if (!data || !data.ok || !data.result) throw new Error("The result could not be verified. Please try again.");
    renderResult(data.result);
  } catch (err) {
    error.textContent = err.message || "Something went wrong. Please try again.";
    error.hidden = false;
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.innerHTML = "View My Score & Get My Report <span>→</span>";
  }
}

let stickyTicking = false;

function updateStickyProgress() {
  const sticky = $("#stickyProgress");
  const assessment = $("#assessment");
  const questionList = $("#questionList");
  const actions = $(".assessment-actions");
  if (state.stickySuppressed) {
    sticky.hidden = true;
    sticky.setAttribute("aria-hidden", "true");
    return;
  }

  const topOffset = 0;
  const activationOffset = 18;
  const questionTop = questionList.getBoundingClientRect().top;
  const actionsBottom = actions.getBoundingClientRect().bottom;
  const active = questionTop <= activationOffset && actionsBottom > activationOffset;

  sticky.hidden = !active;
  sticky.setAttribute("aria-hidden", String(!active));
}

function requestStickyUpdate() {
  if (stickyTicking) return;
  stickyTicking = true;
  requestAnimationFrame(() => {
    stickyTicking = false;
    updateStickyProgress();
  });
}

function setup() {
  renderQuestions();
  updateProgress();
  requestStickyUpdate();
  window.addEventListener("scroll", requestStickyUpdate, {passive:true});
  window.addEventListener("resize", requestStickyUpdate);

  $("#assessmentForm").addEventListener("submit", event => {
    event.preventDefault();
    const error = $("#assessmentError");
    error.hidden = true;
    if (!allAnswered()) {
      const unanswered = QUESTIONS.find(q => !Number.isInteger(state.answers[q.id]));
      error.textContent = "Please answer all 12 questions before continuing.";
      error.hidden = false;
      document.querySelector(`[data-question="${unanswered.id}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }
    showGate();
  });

  $("#leadForm").addEventListener("submit", submitLead);
}

document.addEventListener("DOMContentLoaded", setup);
