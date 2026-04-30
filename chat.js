// ─── EmailJS ─────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_rj7foe9";
const EMAILJS_TEMPLATE_ID = "template_if6gwra";
const EMAILJS_PUBLIC_KEY  = "3dX3_Jiv3TbjDgaDZ";

emailjs.init(EMAILJS_PUBLIC_KEY);

// ─── Formular-Schritte ────────────────────────────────────────────────────────
const steps = [
  {
    id: "typ",
    question: "Was soll gereinigt werden?",
    type: "buttons",
    options: ["Büro / Gewerbe", "Privathaushalt", "Industrie / Lager", "Treppenhaus"],
  },
  {
    id: "flaeche",
    question: "Wie groß ist die Fläche?",
    type: "buttons",
    options: ["Bis 100 m²", "100 – 300 m²", "300 – 500 m²", "Über 500 m²"],
  },
  {
    id: "haeufigkeit",
    question: "Wie oft soll gereinigt werden?",
    type: "buttons",
    options: ["Einmalig", "Wöchentlich", "14-tägig", "Monatlich"],
  },
  {
    id: "zeitraum",
    question: "Wann soll es losgehen?",
    type: "buttons",
    options: ["So schnell wie möglich", "Innerhalb eines Monats", "Termin flexibel"],
  },
  {
    id: "name",
    question: "Wie lautet dein Name?",
    type: "text",
    placeholder: "Dein Vor- und Nachname …",
  },
  {
    id: "email",
    question: "Und deine E-Mail-Adresse?",
    type: "email",
    placeholder: "deine@email.de",
  },
  {
    id: "anmerkung",
    question: "Hast du noch Anmerkungen oder Sonderwünsche?",
    type: "text",
    placeholder: "Hier eingeben …",
    optional: true,
  },
];

// ─── State ────────────────────────────────────────────────────────────────────
const answers = {};
let currentStep = 0;
let busy = false;

// ─── DOM ──────────────────────────────────────────────────────────────────────
const messagesEl   = document.getElementById("chatMessages");
const inputWrapper = document.getElementById("inputWrapper");
const chatInput    = document.getElementById("chatInput");
const sendBtn      = document.getElementById("sendBtn");
const skipBtn      = document.getElementById("skipBtn");
const progressBar  = document.getElementById("progressBar");
const stepCounter  = document.getElementById("stepCounter");
const chatFooter   = document.getElementById("chatFooter");

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateProgress() {
  const pct = (currentStep / steps.length) * 100;
  progressBar.style.width = pct + "%";
  stepCounter.textContent = `${currentStep} / ${steps.length}`;
}

function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `message message--${role}`;

  const avatarHTML = role === "ai"
    ? `<div class="message__avatar" style="background:linear-gradient(135deg,#7c5cfc,#60a5fa);color:#fff;">✦</div>`
    : `<div class="message__avatar">👤</div>`;

  el.innerHTML = `${avatarHTML}<div class="message__bubble">${text.replace(/\n/g, "<br>")}</div>`;
  messagesEl.appendChild(el);
  scrollToBottom();
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "typing";
  el.id = "typingIndicator";
  el.innerHTML = `
    <div class="message__avatar" style="background:linear-gradient(135deg,#7c5cfc,#60a5fa);color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;flex-shrink:0;margin-bottom:2px;">✦</div>
    <div class="typing__bubble">
      <div class="typing__dot"></div>
      <div class="typing__dot"></div>
      <div class="typing__dot"></div>
    </div>
  `;
  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

// ─── Input lock / unlock ──────────────────────────────────────────────────────
function lockInput(placeholder) {
  chatInput.disabled    = true;
  chatInput.placeholder = placeholder || "Wähle eine Option oben aus …";
  sendBtn.disabled      = true;
  skipBtn.style.display = "none";
  inputWrapper.classList.add("is-locked");
}

function unlockInput(step) {
  chatInput.disabled    = false;
  chatInput.type        = step.type === "email" ? "email" : "text";
  chatInput.placeholder = step.placeholder;
  chatInput.value       = "";
  sendBtn.disabled      = false;
  inputWrapper.classList.remove("is-locked");
  if (step.optional) skipBtn.style.display = "block";
  setTimeout(() => chatInput.focus(), 80);
}

// ─── Schritt anzeigen ─────────────────────────────────────────────────────────
function askStep(index) {
  if (busy) return;
  busy = true;

  const step = steps[index];
  const old = document.getElementById("optionsContainer");
  if (old) old.remove();

  lockInput("Einen Moment …");

  const typingEl = showTyping();

  setTimeout(() => {
    typingEl.remove();
    appendMessage("ai", step.question);

    if (step.type === "buttons") {
      showOptionButtons(step);
    } else {
      unlockInput(step);
    }

    updateProgress();
    busy = false;
  }, 650 + Math.random() * 350);
}

function showOptionButtons(step) {
  const container = document.createElement("div");
  container.className = "chat__options";
  container.id        = "optionsContainer";

  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className   = "chat__option";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleButtonAnswer(step, opt, container));
    container.appendChild(btn);
  });

  messagesEl.appendChild(container);
  lockInput("⬆  Bitte wähle eine Option aus …");
  scrollToBottom();
}

// ─── Antworten ────────────────────────────────────────────────────────────────
function handleButtonAnswer(step, answer, container) {
  container.remove();
  answers[step.id] = answer;
  appendMessage("user", answer);
  goNext();
}

function handleTextAnswer() {
  if (busy || chatInput.disabled) return;

  const step = steps[currentStep];
  const val  = chatInput.value.trim();

  if (!val && !step.optional) {
    chatInput.focus();
    return;
  }

  answers[step.id] = val || "–";
  lockInput("Einen Moment …");
  appendMessage("user", val || "Keine Anmerkungen");
  goNext();
}

function goNext() {
  currentStep++;
  if (currentStep >= steps.length) {
    setTimeout(sendEmail, 500);
  } else {
    setTimeout(() => askStep(currentStep), 380);
  }
}

// ─── E-Mail senden ────────────────────────────────────────────────────────────
async function sendEmail() {
  lockInput("Anfrage wird gesendet …");
  updateProgress();
  const typingEl = showTyping();

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email:    "Info@brandheiss.Agency",
      reply_to:    answers.email        || "–",
      typ:         answers.typ          || "–",
      flaeche:     answers.flaeche      || "–",
      haeufigkeit: answers.haeufigkeit  || "–",
      zeitraum:    answers.zeitraum     || "–",
      name:        answers.name         || "–",
      anmerkung:   answers.anmerkung    || "–",
    });

    typingEl.remove();
    appendMessage(
      "ai",
      `Vielen Dank, ${answers.name || ""}! 🎉\nDeine Anfrage ist bei uns eingegangen. Wir melden uns innerhalb von 24 Stunden bei dir.`
    );
    showSuccess();

  } catch (err) {
    console.error("EmailJS Fehler:", err);
    typingEl.remove();
    appendMessage(
      "ai",
      "Ups, da ist etwas schiefgelaufen. 😕\nBitte schreib uns direkt an: Info@brandheiss.Agency"
    );
    lockInput("Bitte versuche es später erneut.");
  }
}

function showSuccess() {
  progressBar.style.width  = "100%";
  stepCounter.textContent  = `${steps.length} / ${steps.length}`;
  chatFooter.style.display = "none";

  const el = document.createElement("div");
  el.className = "chat__success";
  el.innerHTML = `
    <div class="chat__success-icon">✓</div>
    <p>Anfrage erfolgreich gesendet!</p>
  `;
  messagesEl.appendChild(el);
  scrollToBottom();
}

// ─── Events ───────────────────────────────────────────────────────────────────
sendBtn.addEventListener("click", handleTextAnswer);
skipBtn.addEventListener("click", () => {
  answers[steps[currentStep].id] = "–";
  lockInput("Einen Moment …");
  appendMessage("user", "Keine Anmerkungen");
  goNext();
});
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleTextAnswer();
  }
});

// ─── Begrüßung + Start ────────────────────────────────────────────────────────
lockInput("Einen Moment …");
updateProgress();

setTimeout(() => {
  const typingEl = showTyping();
  setTimeout(() => {
    typingEl.remove();
    appendMessage(
      "ai",
      "Hallo! 👋 Schön, dass du hier bist.\nIch helfe dir in wenigen Schritten, ein kostenloses Angebot für deine Gebäudereinigung anzufordern."
    );
    setTimeout(() => askStep(0), 500);
  }, 900);
}, 500);
