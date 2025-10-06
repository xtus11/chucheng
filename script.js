"use strict";

/* === CẤU HÌNH === */
const settings = {
  particles: {
    length: 600,
    duration: 3.5,
    velocity: 20,
    effect: -0.2,
    size: 30
  },
};

/* === CÁC LỚP VẼ HẠT, TRÁI TIM, ẢNH === */
const Point = function (x = 0, y = 0) {
  this.x = x; this.y = y;
};
Point.prototype = {
  clone() { return new Point(this.x, this.y); },
  length(length) {
    if (length === undefined) return Math.sqrt(this.x ** 2 + this.y ** 2);
    this.normalize(); this.x *= length; this.y *= length; return this;
  },
  normalize() {
    const len = this.length(); this.x /= len; this.y /= len; return this;
  }
};

const Particle = function () {
  this.position = new Point();
  this.velocity = new Point();
  this.acceleration = new Point();
  this.age = 0;
};
Particle.prototype = {
  initialize(x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  },
  update(dt) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
    this.age += dt;
  },
  draw(ctx, image) {
    const ease = t => (--t) * t * t + 1;
    const size = image.width * ease(this.age / settings.particles.duration);
    ctx.globalAlpha = 1 - this.age / settings.particles.duration;
    ctx.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
  }
};

const ParticlePool = function (length) {
  const particles = new Array(length).fill().map(() => new Particle());
  let firstActive = 0, firstFree = 0, duration = settings.particles.duration;
  this.add = function (x, y, dx, dy) {
    particles[firstFree].initialize(x, y, dx, dy);
    firstFree = (firstFree + 1) % length;
    if (firstFree === firstActive) firstActive = (firstActive + 1) % length;
  };
  this.update = function (dt) {
    let i = firstActive;
    while (i !== firstFree) {
      particles[i].update(dt);
      if (particles[i].age >= duration) firstActive = (firstActive + 1) % length;
      i = (i + 1) % length;
    }
  };
  this.draw = function (ctx, image) {
    let i = firstActive;
    while (i !== firstFree) {
      particles[i].draw(ctx, image);
      i = (i + 1) % length;
    }
  };
};

/* === TẠO HÌNH TRÁI TIM === */
function pointOnHeart(t) {
  return new Point(
    160 * Math.pow(Math.sin(t), 3),
    130 * Math.cos(t) - 50 * Math.cos(2 * t)
    - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
  );
}

function createHeartImage() {
  const c = document.createElement("canvas"), ctx = c.getContext("2d");
  c.width = c.height = settings.particles.size;
  ctx.beginPath();
  let t = -Math.PI;
  const start = pointOnHeart(t);
  ctx.moveTo(settings.particles.size / 2 + start.x * settings.particles.size / 350,
             settings.particles.size / 2 - start.y * settings.particles.size / 350);
  while (t < Math.PI) {
    t += 0.01;
    const p = pointOnHeart(t);
    ctx.lineTo(settings.particles.size / 2 + p.x * settings.particles.size / 350,
               settings.particles.size / 2 - p.y * settings.particles.size / 350);
  }
  ctx.closePath();
  ctx.fillStyle = "#ff7eb9";
  ctx.shadowColor = "#ff99cc";
  ctx.shadowBlur = 15;
  ctx.fill();

  const img = new Image();
  img.src = c.toDataURL();
  return img;
}

const Heart = createHeartImage();

/* === CHỮ BAY === */
const messages = [
  "Chúc bé luôn vui vẻ 💕",
  "Hạnh phúc tràn đầy 💖",
  "Yêu thương ngập tràn 💫",
  "Mãi luôn mỉm cười 🌸",
  "Một ngày tuyệt vời 💐",
  "Yêu em rất nhiều 💞",
  "Mãi mãi xinh đẹp 💝",
  "Cười thật tươi 😄",
  "Hạnh phúc bên nhau 💞",
  "Luôn tiến về phía trước 🚀",
  "Giấc mơ sẽ thành hiện thực 💫"

];
const flyingTexts = [];
const MAX_TEXTS = 15;

function spawnText() {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  const pos = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
  const vel = { x: (Math.random() - 0.5) * 0.6, y: (Math.random() - 0.5) * 0.6 };
  const life = 400 + Math.random() * 200;
  flyingTexts.push({ msg, pos, vel, life });
}

function drawTexts(ctx) {
  ctx.font = "24px 'Dancing Script', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = flyingTexts.length - 1; i >= 0; i--) {
    const t = flyingTexts[i];
    t.pos.x += t.vel.x;
    t.pos.y += t.vel.y;
    t.life--;
    const alpha = Math.max(0, Math.min(1, t.life / 300));
    ctx.fillStyle = `rgba(255,182,193,${alpha})`;
    ctx.fillText(t.msg, t.pos.x, t.pos.y);
    if (t.life <= 0) flyingTexts.splice(i, 1);
  }
}

/* === ẢNH TRONG TRÁI TIM === */
const centerImage = new Image();
centerImage.src = "IMG_61281.JPG";

function drawImageInHeart(ctx, canvas) {
  if (!centerImage.complete) return;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const heartWidth = 360, heartHeight = 330;
  ctx.save();
  ctx.beginPath();
  for (let t = 0; t <= 2 * Math.PI; t += 0.02) {
    const x = cx + 160 * Math.pow(Math.sin(t), 3);
    const y = cy - (130 * Math.cos(t) - 50 * Math.cos(2 * t)
      - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25);
    if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); //độ sáng
  ctx.clip();
  ctx.filter = "brightness(1.1) contrast(1.1)";
  ctx.drawImage(centerImage, cx - heartWidth / 2, cy - heartHeight / 2, heartWidth, heartHeight);
  ctx.filter = "none";
  ctx.restore();
}

/* === CANVAS & HIỆU ỨNG CHÍNH === */
const canvas = document.getElementById("pinkboard");
const ctx = canvas.getContext("2d");
const pool = new ParticlePool(settings.particles.length);
const particleRate = settings.particles.length / settings.particles.duration;
let time;

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.onresize = onResize;

function render() {
  const newTime = new Date().getTime() / 1000;
  const dt = newTime - (time || newTime);
  time = newTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawImageInHeart(ctx, canvas);

  const amount = particleRate * dt;
  for (let i = 0; i < amount; i++) {
    const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
    const dir = pos.clone().length(settings.particles.velocity);
    pool.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
  }
  pool.update(dt);
  pool.draw(ctx, Heart);

  if (Math.random() < 0.05 && flyingTexts.length < MAX_TEXTS) spawnText();
  drawTexts(ctx);

  requestAnimationFrame(render);
}

setTimeout(() => { onResize(); render(); }, 10);

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
document.head.appendChild(fontLink);

/* === ÂM NHẠC NỀN === */
const bgMusic = new Audio("music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

const musicBtn = document.getElementById("musicBtn");
let isPlaying = false;

musicBtn.addEventListener("click", () => {
  if (!isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicBtn.textContent = "🔈 Tắt nhạc";
    }).catch(err => console.log("Trình duyệt chặn tự động phát:", err));
  } else {
    bgMusic.pause();
    isPlaying = false;
    musicBtn.textContent = "🔊 Bật nhạc";
  }
});
