// ─── EmailJS ─────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = "service_rj7foe9";
const EMAILJS_TEMPLATE_ID = "template_if6gwra";
const EMAILJS_PUBLIC_KEY  = "3dX3_Jiv3TbjDgaDZ";

emailjs.init(EMAILJS_PUBLIC_KEY);

// ─── Schritte ────────────────────────────────────────────────────────────────
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

// ─── State ───────────────────────────────────────────────────────────────────
const answers = {};
let currentStep = 0;
let busy = false;

// ─── DOM ─────────────────────────────────────────────────────────────────────
const botMessage   = document.getElementById("botMessage");
const typingEl     = document.getElementById("typingIndicator");
const inputWrap    = document.getElementById("inputWrap");
const chatInput    = document.getElementById("chatInput");
const sendBtn      = document.getElementById("sendBtn");
const skipBtn      = document.getElementById("skipBtn");
const optionsRow   = document.getElementById("optionsRow");
const optionsCont  = document.getElementById("optionsContainer");
const inputHint    = document.getElementById("inputHint");
const progressBar  = document.getElementById("progressBar");

// ─── Helpers ─────────────────────────────────────────────────────────────────
function updateProgress() {
  progressBar.style.width = ((currentStep / steps.length) * 100) + "%";
}

function showTyping() {
  botMessage.innerHTML = "";
  botMessage.appendChild(typingEl);
  typingEl.style.display = "flex";
}

function setBotMessage(text) {
  typingEl.style.display = "none";
  botMessage.innerHTML = `<span class="bot-text">${text.replace(/\n/g, "<br>")}</span>`;
}

function showUserAnswer(text) {
  // Remove previous user answer if any
  const prev = document.querySelector(".widget__user-answer");
  if (prev) prev.remove();

  const el = document.createElement("div");
  el.className = "widget__user-answer";
  el.innerHTML = `<div class="widget__user-bubble">${text}</div>`;
  botMessage.parentNode.insertBefore(el, botMessage);
}

function lockInput(placeholder) {
  chatInput.disabled    = true;
  chatInput.placeholder = placeholder || "";
  sendBtn.disabled      = true;
  skipBtn.style.display = "none";
  inputWrap.classList.add("is-locked");
  inputHint.style.display = "none";
  optionsRow.style.display = "none";
  optionsCont.innerHTML    = "";
}

function unlockInput(step) {
  chatInput.disabled    = false;
  chatInput.type        = step.type === "email" ? "email" : "text";
  chatInput.placeholder = step.placeholder;
  chatInput.value       = "";
  sendBtn.disabled      = false;
  inputWrap.classList.remove("is-locked");
  inputHint.style.display = "block";
  optionsRow.style.display = "none";
  if (step.optional) skipBtn.style.display = "block";
  setTimeout(() => chatInput.focus(), 80);
}

function showOptions(step) {
  lockInput("Oder gib direkt ein …");
  inputHint.style.display  = "block";
  inputWrap.classList.remove("is-locked");
  chatInput.disabled        = true;
  sendBtn.disabled          = true;
  chatInput.placeholder     = "⬆  Wähle eine Option …";

  optionsCont.innerHTML = "";
  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className   = "widget__option";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleButtonAnswer(step, opt));
    optionsCont.appendChild(btn);
  });
  optionsRow.style.display = "flex";
}

// ─── Schritt ─────────────────────────────────────────────────────────────────
function askStep(index) {
  if (busy) return;
  busy = true;

  lockInput("Einen Moment …");
  showTyping();

  setTimeout(() => {
    const step = steps[index];
    setBotMessage(step.question);
    updateProgress();

    if (step.type === "buttons") {
      showOptions(step);
    } else {
      unlockInput(step);
    }

    busy = false;
  }, 650 + Math.random() * 300);
}

// ─── Antworten ───────────────────────────────────────────────────────────────
function handleButtonAnswer(step, answer) {
  optionsRow.style.display = "none";
  optionsCont.innerHTML    = "";
  answers[step.id] = answer;
  showUserAnswer(answer);
  goNext();
}

function handleTextAnswer() {
  if (busy || chatInput.disabled) return;
  const step = steps[currentStep];
  const val  = chatInput.value.trim();
  if (!val && !step.optional) { chatInput.focus(); return; }

  answers[step.id] = val || "–";
  lockInput("Einen Moment …");
  showUserAnswer(val || "Keine Anmerkungen");
  goNext();
}

function goNext() {
  currentStep++;
  if (currentStep >= steps.length) {
    setTimeout(sendEmail, 500);
  } else {
    setTimeout(() => askStep(currentStep), 400);
  }
}

// ─── E-Mail ──────────────────────────────────────────────────────────────────
async function sendEmail() {
  lockInput("Anfrage wird gesendet …");
  showTyping();
  updateProgress();

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

    progressBar.style.width = "100%";
    setBotMessage(`Vielen Dank, ${answers.name || ""}! 🎉\nDeine Anfrage ist bei uns eingegangen – wir melden uns innerhalb von 24 Stunden bei dir.`);

    const successEl = document.createElement("div");
    successEl.className = "widget__success";
    successEl.innerHTML = `<div class="widget__success-icon">✓</div><p>Anfrage erfolgreich gesendet!</p>`;
    botMessage.parentNode.insertBefore(successEl, inputWrap.parentNode);
    document.querySelector(".widget__composer").style.display = "none";
    optionsRow.style.display = "none";
    document.querySelector(".widget__disclaimer").style.display = "none";

  } catch (err) {
    console.error("EmailJS Fehler:", err);
    setBotMessage("Ups, da ist etwas schiefgelaufen. 😕\nBitte schreib uns direkt an: Info@brandheiss.Agency");
  }
}

// ─── Events ──────────────────────────────────────────────────────────────────
sendBtn.addEventListener("click", handleTextAnswer);
skipBtn.addEventListener("click", () => {
  answers[steps[currentStep].id] = "–";
  lockInput("Einen Moment …");
  showUserAnswer("Keine Anmerkungen");
  goNext();
});
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTextAnswer(); }
});

// ─── Start ───────────────────────────────────────────────────────────────────
lockInput("Einen Moment …");
updateProgress();

setTimeout(() => {
  showTyping();
  setTimeout(() => {
    setBotMessage("Hallo! 👋 Schön, dass du da bist.\nIch helfe dir, in wenigen Schritten ein kostenloses Angebot anzufordern.");
    setTimeout(() => askStep(0), 800);
  }, 900);
}, 400);
