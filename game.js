let canvas, ctx;
let ship, bullets = [], enemies = [];
let score = 0, highScore = 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let shootSound, hitSound, backgroundMusic;
let shipImage = new Image(), alienImage = new Image(), backgroundImage = new Image();

window.onload = () => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 600;

  document.getElementById("pauseBtn").addEventListener("click", togglePause);
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  loadAssets().then(() => {
    drawStartScreen();
  }).catch((err) => {
    console.error("Asset loading failed:", err);
  });
};

function loadAssets() {
  return Promise.all([
    loadImage('https://i.imgur.com/Z5xqF6M.png', shipImage),       // spaceship
loadImage('https://i.imgur.com/Nj2D1GJ.png', alienImage),      // alien
loadImage('https://i.imgur.com/jf9nrcF.jpg', backgroundImage), // background
    loadAudio("sounds/shoot.mp3").then(audio => shootSound = audio),
    loadAudio("sounds/hit.mp3").then(audio => hitSound = audio),
    loadAudio("sounds/background.mp3").then(audio => {
      backgroundMusic = audio;
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.3;
    }),
  ]);
}

function loadImage(src, img) {
  return new Promise((res, rej) => {
    img.src = src;
    img.onload = res;
    img.onerror = () => rej("Failed to load image: " + src);
  });
}

function loadAudio(src) {
  return new Promise((res, rej) => {
    const audio = new Audio(src);
    audio.oncanplaythrough = () => res(audio);
    audio.onerror = () => rej("Failed to load sound: " + src);
  });
}

function drawStartScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2);
}

function startGame() {
  gameRunning = true;
  gamePaused = false;
  gameOver = false;
  bullets = [];
  enemies = [];
  score = 0;
  highScore = localStorage.getItem("highScore") || 0;

  ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0
  };

  backgroundMusic.play();
  setInterval(spawnEnemy, 1000);
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
}

function resetGame() {
  gameRunning = false;
  backgroundMusic.pause();
  drawStartScreen();
}

function spawnEnemy() {
  if (!gameRunning || gamePaused || gameOver) return;
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    width: 40,
    height: 40,
    speed: 2 + Math.random() * 2
  });
}

function handleKeyDown(e) {
  if (e.code === "Space") {
    if (!gameRunning) {
      startGame();
    } else {
      shoot();
    }
  }
  if (e.code === "ArrowLeft") ship.dx = -ship.speed;
  if (e.code === "ArrowRight") ship.dx = ship.speed;
}

function handleKeyUp(e) {
  if (e.code === "ArrowLeft" || e.code === "ArrowRight") ship.dx = 0;
}

function shoot() {
  shootSound?.play();
  bullets.push({
    x: ship.x + ship.width / 2 - 5,
    y: ship.y,
    width: 10,
    height: 20,
    speed: 7
  });
}

function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawShip() {
  ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

function drawBullets() {
  ctx.fillStyle = "white";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawEnemies() {
  enemies.forEach(e => {
    ctx.drawImage(alienImage, e.x, e.y, e.width, e.height);
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("High Score: " + highScore, canvas.width - 160, 30);
}

function update() {
  if (gamePaused || gameOver) return;

  ship.x += ship.dx;
  ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x));

  bullets = bullets.filter(b => b.y > 0);
  bullets.forEach(b => b.y -= b.speed);

  enemies.forEach(e => e.y += e.speed);

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.width && b.x + b.width > e.x &&
          b.y < e.y + e.height && b.y + b.height > e.y) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        hitSound?.play();
        score += 10;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
      }
    });
  });

  enemies.forEach(e => {
    if (e.y + e.height > ship.y && e.x < ship.x + ship.width && e.x + e.width > ship.x) {
      gameOver = true;
      gameRunning = false;
      backgroundMusic.pause();
    }
  });
}

function drawGameOver() {
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Press Space to Restart", canvas.width / 2, canvas.height / 2 + 50);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  if (gameRunning) {
    update();
    drawShip();
    drawBullets();
    drawEnemies();
    drawScore();
  }
  drawGameOver();
  requestAnimationFrame(gameLoop);
}