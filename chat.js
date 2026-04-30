// Demo conversation shown on page load
const demoConversation = [
  {
    role: "ai",
    text: "Hallo! Ich bin dein KI-Assistent. Wie kann ich dir heute helfen? 👋",
    delay: 600,
  },
  {
    role: "user",
    text: "Kannst du mir eine kurze Zusammenfassung über KI schreiben?",
    delay: 1800,
  },
  {
    role: "ai",
    text: "Natürlich! Künstliche Intelligenz (KI) bezeichnet Systeme, die menschenähnliche kognitive Fähigkeiten wie Lernen, Problemlösen und Sprachverständnis nachahmen. Moderne KI basiert auf neuronalen Netzen und riesigen Datensätzen – und wird heute in Medizin, Wissenschaft und Alltag eingesetzt.",
    delay: 3200,
    typing: 1400,
  },
  {
    role: "user",
    text: "Sehr interessant! Was sind die wichtigsten Anwendungsbereiche?",
    delay: 5400,
  },
  {
    role: "ai",
    text: "Die wichtigsten Bereiche sind:\n• **Medizin** – Diagnose & Bildanalyse\n• **Sprache** – Übersetzung & Chatbots\n• **Mobilität** – Autonomes Fahren\n• **Kreativität** – Bild-, Musik- & Texterstellung\n\nDie Möglichkeiten wachsen täglich! 🚀",
    delay: 7200,
    typing: 1600,
  },
];

const messagesEl = document.getElementById("chatMessages");
const inputEl    = document.getElementById("chatInput");
const sendBtn    = document.getElementById("sendBtn");

// ── Helpers ──────────────────────────────────────────────────────────────────

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function avatarFor(role) {
  return role === "ai"
    ? `<div class="message__avatar">AI</div>`
    : `<div class="message__avatar">👤</div>`;
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n•/g, "<br>•")
    .replace(/\n/g, "<br>");
}

function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message message--${role}`;
  msg.innerHTML = `
    ${avatarFor(role)}
    <div class="message__bubble">${formatText(text)}</div>
  `;
  messagesEl.appendChild(msg);
  scrollToBottom();
}

function showTyping() {
  const el = document.createElement("div");
  el.className = "typing";
  el.id = "typingIndicator";
  el.innerHTML = `
    ${avatarFor("ai")}
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

// ── Demo playback ─────────────────────────────────────────────────────────────

function playDemo(steps, index = 0) {
  if (index >= steps.length) return;
  const step = steps[index];

  setTimeout(() => {
    if (step.role === "ai" && step.typing) {
      const typingEl = showTyping();
      setTimeout(() => {
        typingEl.remove();
        appendMessage("ai", step.text);
        playDemo(steps, index + 1);
      }, step.typing);
    } else {
      appendMessage(step.role, step.text);
      playDemo(steps, index + 1);
    }
  }, index === 0 ? step.delay : step.delay - steps[index - 1].delay);
}

playDemo(demoConversation);

// ── Live input ────────────────────────────────────────────────────────────────

const aiReplies = [
  "Das ist eine großartige Frage! Lass mich darüber nachdenken… KI-Systeme lernen aus Daten und werden durch Feedback immer besser.",
  "Interessant! Moderne Sprachmodelle wie ich basieren auf Transformer-Architekturen und wurden mit Milliarden von Texten trainiert.",
  "Gute Frage! Ich kann dir dabei helfen – sag mir einfach, was du genau brauchst.",
  "Das ist ein spannendes Thema! Künstliche Intelligenz entwickelt sich rasant weiter und eröffnet täglich neue Möglichkeiten.",
  "Super! Ich stehe dir jederzeit zur Verfügung. Was möchtest du als nächstes wissen?",
];
let replyIndex = 0;

function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  appendMessage("user", text);
  inputEl.value = "";
  inputEl.focus();

  const typing = showTyping();
  const delay  = 900 + Math.random() * 600;

  setTimeout(() => {
    typing.remove();
    appendMessage("ai", aiReplies[replyIndex % aiReplies.length]);
    replyIndex++;
  }, delay);
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
