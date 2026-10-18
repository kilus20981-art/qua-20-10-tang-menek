const intro = document.getElementById("intro");
const app = document.getElementById("app");
const startBtn = document.getElementById("startBtn");
const viewport = document.getElementById("spaceViewport");
const space = document.getElementById("space");
const letterModal = document.getElementById("letterModal");
const letterBtn = document.getElementById("letterBtn");
const closeLetter = document.getElementById("closeLetter");
const replayBtn = document.getElementById("replayBtn");
const musicBtn = document.getElementById("musicBtn");
const toast = document.getElementById("toast");
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let toastTimer;
let musicOn = false;
let audioContext = null;
let melodyTimer = null;
let noteIndex = 0;
const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];

// Start screen
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  app.classList.remove("hidden");
  resizeCanvas();
  createSparkles(65);
  setTimeout(() => showToast("Chạm vào trái tim để gửi mẹ một điều ước ♡"), 1200);
});

replayBtn.addEventListener("click", () => {
  viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  showToast("Mình cùng xem lại món quà nhé ♡");
});

// Letter open/close
function openLetter() {
  letterModal.classList.add("open");
  letterModal.setAttribute("aria-hidden", "false");
  document.getElementById("letterTitle").focus?.();
}
function closeLetterModal() {
  letterModal.classList.remove("open");
  letterModal.setAttribute("aria-hidden", "true");
}
letterBtn.addEventListener("click", openLetter);
closeLetter.addEventListener("click", closeLetterModal);
letterModal.querySelector(".letter-backdrop").addEventListener("click", closeLetterModal);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLetterModal();
});

// Drag to explore the large 2D space, including touch screens
let isDown = false, startX = 0, startY = 0, scrollLeft = 0, scrollTop = 0, moved = false;
viewport.addEventListener("pointerdown", e => {
  if (e.target.closest("button, .photo-card")) return;
  isDown = true; moved = false;
  startX = e.clientX; startY = e.clientY;
  scrollLeft = viewport.scrollLeft; scrollTop = viewport.scrollTop;
  viewport.classList.add("dragging");
  viewport.setPointerCapture?.(e.pointerId);
});
viewport.addEventListener("pointermove", e => {
  if (!isDown) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
  viewport.scrollLeft = scrollLeft - dx;
  viewport.scrollTop = scrollTop - dy;
});
function stopDrag() { isDown = false; viewport.classList.remove("dragging"); }
viewport.addEventListener("pointerup", stopDrag);
viewport.addEventListener("pointercancel", stopDrag);
viewport.addEventListener("pointerleave", stopDrag);

// Canvas stars
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.min(150, Math.floor(window.innerWidth / 7)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + .25,
    a: Math.random() * .7 + .15,
    speed: Math.random() * .012 + .003,
    phase: Math.random() * Math.PI * 2
  }));
}
function drawStars(time = 0) {
  if (!ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach(s => {
    const alpha = s.a * (.55 + .45 * Math.sin(time * s.speed + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 190, 235, ${alpha})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#ff5fc6";
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  requestAnimationFrame(drawStars);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawStars);

// Floating hearts and sparkles
function createHeart() {
  if (app.classList.contains("hidden")) return;
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > .35 ? "♡" : "♥";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.top = (window.innerHeight + 20) + "px";
  heart.style.fontSize = (12 + Math.random() * 22) + "px";
  heart.style.opacity = (.45 + Math.random() * .5).toFixed(2);
  heart.style.animationDuration = (7 + Math.random() * 8) + "s";
  app.appendChild(heart);
  setTimeout(() => heart.remove(), 16000);
}
function createSparkles(amount) {
  for (let i = 0; i < amount; i++) {
    const spark = document.createElement("span");
    spark.className = "sparkle";
    spark.style.left = Math.random() * 100 + "%";
    spark.style.top = Math.random() * 100 + "%";
    spark.style.animationDelay = (Math.random() * 3) + "s";
    spark.style.opacity = Math.random();
    app.appendChild(spark);
  }
}
setInterval(createHeart, 420);

// Tap/click in space to send little heart bursts
viewport.addEventListener("click", e => {
  if (moved || e.target.closest("button, .photo-card")) return;
  const rect = viewport.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  for (let i = 0; i < 7; i++) {
    const h = document.createElement("span");
    h.className = "floating-heart";
    h.textContent = i % 2 ? "♡" : "♥";
    h.style.position = "fixed";
    h.style.left = (e.clientX + (Math.random() - .5) * 70) + "px";
    h.style.top = (e.clientY + (Math.random() - .5) * 35) + "px";
    h.style.fontSize = (12 + Math.random() * 18) + "px";
    h.style.animationDuration = (1.5 + Math.random() * 1.4) + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 3200);
  }
  showToast("Một trái tim dành tặng mẹ ♡");
});

// Soft generated tones (no external audio file needed)
musicBtn.addEventListener("click", async () => {
  if (!musicOn) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) { showToast("Trình duyệt này chưa hỗ trợ âm thanh."); return; }
      audioContext = audioContext || new AudioCtx();
      await audioContext.resume();
      musicOn = true;
      musicBtn.innerHTML = "♫ <span>Đang bật</span>";
      playNote();
      melodyTimer = setInterval(playNote, 650);
      showToast("Nhạc nền dịu dàng đã bật ♫");
    } catch (err) {
      showToast("Bạn hãy thử bật âm thanh lại nhé.");
    }
  } else {
    musicOn = false;
    clearInterval(melodyTimer);
    if (audioContext) audioContext.suspend();
    musicBtn.innerHTML = "♫ <span>Nhạc</span>";
    showToast("Đã tắt nhạc");
  }
});
function playNote() {
  if (!audioContext || !musicOn) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  osc.type = "sine";
  osc.frequency.value = notes[noteIndex % notes.length];
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + .08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + .55);
  osc.connect(gain); gain.connect(audioContext.destination);
  osc.start(now); osc.stop(now + .58);
  noteIndex++;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// A click on the centerpiece heart opens the letter too
document.querySelector(".center-heart").addEventListener("click", openLetter);
document.querySelector(".center-heart").style.cursor = "pointer";
