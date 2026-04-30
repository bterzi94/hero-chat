// ─────────────────────────────────────────────
// EmailJS Konfiguration
// Anleitung: emailjs.com → kostenlosen Account erstellen
// Dann Service ID, Template ID und Public Key eintragen
// ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";

emailjs.init(EMAILJS_PUBLIC_KEY);

// ─────────────────────────────────────────────
// Formular-Schritte
// ─────────────────────────────────────────────
const steps = [
  {
    id: "typ",
    question: "Hallo! 👋 Schön, dass du da bist.\nWas soll gereinigt werden?",
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
    question: "Super! Wie lautet dein Name?",
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
    question: "Hast du noch Anmerkungen oder Sonderwünsche? (optional)",
    type: "text",
    placeholder: "Hier eingeben …",
    optional: true,
  },
];

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const answers = {};
let currentStep = 0;
let busy = false;

// ─────────────────────────────────────────────
// DOM Refs
// ─────────────────────────────────────────────
const messagesEl   = document.getElementById("chatMessages");
const inputWrapper = document.getElementById("inputWrapper");
const chatInput    = document.getElementById("chatInput");
const sendBtn      = document.getElementById("sendBtn");
const chatHint     = document.getElementById("chatHint");
const skipBtn      = document.getElementById("skipBtn");
const progressBar  = document.getElementById("progressBar");
const stepCounter  = document.getElementById("stepCounter");
const chatFooter   = document.getElementById("chatFooter");

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateProgress() {
  const pct = (currentStep / steps.length) * 100;
  progressBar.style.width = pct + "%";
  stepCounter.textContent = `${currentStep} / ${steps.length}`;
}

function avatarAI() {
  return `<div class="message__avatar">AI</div>`;
}
function avatarUser() {
  return `<div class="message__avatar">👤</div>`;
}

function formatText(text) {
  return text.replace(/\n/g, "<br>");
}

function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `message message--${role}`;
  el.innerHTML = `
    ${role === "ai" ? avatarAI() : avatarUser()}
    <div class="message__bubble">${formatText(text)}</div>
  `;
  messagesEl.appendChild(el);
  scrollToBottom();
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "typing";
  el.id = "typingIndicator";
  el.innerHTML = `
    ${avatarAI()}
    <div class="typing__dots">
      <div class="typing__dot"></div>
      <div class="typing__dot"></div>
      <div class="typing__dot"></div>
    </div>
  `;
  messagesEl.appendChild(el);
  scrollToBottom();
  return el;
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

function clearOptions() {
  const el = document.getElementById("optionsContainer");
  if (el) el.remove();
}

function resetFooter() {
  inputWrapper.style.display = "none";
  skipBtn.style.display      = "none";
  chatHint.textContent       = "";
}

// ─────────────────────────────────────────────
// Form Logic
// ─────────────────────────────────────────────
function askStep(index) {
  if (busy) return;
  busy = true;
  const step = steps[index];

  resetFooter();
  clearOptions();

  const typingEl = showTyping();
  const delay    = 700 + Math.random() * 400;

  setTimeout(() => {
    typingEl.remove();
    appendMessage("ai", step.question);

    if (step.type === "buttons") {
      showOptionButtons(step);
    } else {
      showTextInput(step);
    }

    updateProgress();
    busy = false;
  }, delay);
}

function showOptionButtons(step) {
  const container = document.createElement("div");
  container.className = "chat__options";
  container.id        = "optionsContainer";

  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className   = "chat__option";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleButtonAnswer(step, opt));
    container.appendChild(btn);
  });

  messagesEl.appendChild(container);
  chatHint.textContent = "Bitte wähle eine Option aus.";
  scrollToBottom();
}

function showTextInput(step) {
  chatInput.placeholder = step.placeholder;
  chatInput.type        = step.type === "email" ? "email" : "text";
  chatInput.value       = "";
  inputWrapper.style.display = "flex";

  if (step.optional) {
    skipBtn.style.display = "block";
  }

  setTimeout(() => chatInput.focus(), 50);
}

function handleButtonAnswer(step, answer) {
  clearOptions();
  resetFooter();
  answers[step.id] = answer;
  appendMessage("user", answer);
  goNext();
}

function handleTextAnswer() {
  if (busy) return;
  const step = steps[currentStep];
  const val  = chatInput.value.trim();

  if (!val && !step.optional) {
    chatInput.classList.add("shake");
    setTimeout(() => chatInput.classList.remove("shake"), 400);
    return;
  }

  answers[step.id] = val || "–";
  resetFooter();
  appendMessage("user", val || "Keine Anmerkungen");
  goNext();
}

function handleSkip() {
  const step = steps[currentStep];
  answers[step.id] = "–";
  resetFooter();
  appendMessage("user", "Keine Anmerkungen");
  goNext();
}

function goNext() {
  currentStep++;
  if (currentStep >= steps.length) {
    setTimeout(sendEmail, 400);
  } else {
    setTimeout(() => askStep(currentStep), 400);
  }
}

// ─────────────────────────────────────────────
// Email senden
// ─────────────────────────────────────────────
async function sendEmail() {
  resetFooter();
  chatHint.textContent = "Anfrage wird gesendet …";

  const typingEl = showTyping();
  updateProgress();

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email:    "Info@brandheiss.Agency",
      reply_to:    answers.email    || "–",
      typ:         answers.typ      || "–",
      flaeche:     answers.flaeche  || "–",
      haeufigkeit: answers.haeufigkeit || "–",
      zeitraum:    answers.zeitraum || "–",
      name:        answers.name     || "–",
      anmerkung:   answers.anmerkung || "–",
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
    chatHint.textContent = "";
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

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────
sendBtn.addEventListener("click", handleTextAnswer);
skipBtn.addEventListener("click", handleSkip);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleTextAnswer();
  }
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
updateProgress();
setTimeout(() => askStep(0), 600);
