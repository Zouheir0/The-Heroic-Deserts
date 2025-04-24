const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const shootSound = document.getElementById("shootSound");
const explosionSound = document.getElementById("explosionSound");
const bgMusic = document.getElementById("bgMusic");

let ship = { x: 400, y: 550, width: 40, height: 20, speed: 5, shield: false };
let bullets = [];
let enemies = [];
let explosions = [];
let powerUps = [];
let score = 0;
let lives = 3;
let gameOver = false;
let started = false;
let enemySpeed = 1;
let isPaused = false;
let isMuted = false;
let bossWave = false;
let scoreMultiplier = 1;
let highScore = localStorage.getItem("highScore") || 0;

function spawnEnemies() {
  enemies = [];
  for (let i = 0; i < (bossWave ? 1 : 5); i++) {
    enemies.push({
      x: 100 + i * 120, y: 50, width: 40, height: 20, alive: true, type: bossWave ? 'boss' : 'normal'
    });
  }
}

function spawnPowerUp() {
  const type = Math.random() > 0.5 ? 'shield' : 'triple';
  powerUps.push({ x: Math.random() * canvas.width, y: 0, width: 20, height: 20, type });
}

spawnEnemies();

document.addEventListener("keydown", (e) => {
  if (!started && (e.key === " " || e.key === "Enter")) {
    started = true;
    bgMusic.play();
  }

  if (gameOver && e.key === "r") {
    restartGame();
    return;
  }

  if (e.key === "p") togglePause();
  if (e.key === "m") toggleMute();
  
  if (isPaused || !started || gameOver) return;

  if (e.key === "ArrowLeft" || e.key === "a") ship.x -= ship.speed;
  if (e.key === "ArrowRight" || e.key === "d") ship.x += ship.speed;
  if (e.key === " " || e.key === "Spacebar") shoot();
});

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) bgMusic.pause();
  else bgMusic.play();
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    shootSound.muted = true;
    explosionSound.muted = true;
    bgMusic.muted = true;
  } else {
    shootSound.muted = false;
    explosionSound.muted = false;
    bgMusic.muted = false;
  }
}

function shoot() {
  const bulletSpeed = ship.shield ? 10 : 7;
  bullets.push({ x: ship.x + ship.width / 2 - 2, y: ship.y, speed: bulletSpeed });
  if (!isMuted) shootSound.currentTime = 0;
  if (!isMuted) shootSound.play();
}

function restartGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  ship.shield = false;
  bullets = [];
  explosions = [];
  powerUps = [];
  enemySpeed = 1;
  scoreMultiplier = 1;
  bossWave = false;
  spawnEnemies();
  bgMusic.play();
}

function update() {
  if (gameOver || isPaused) return;

  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  });

  enemies.forEach((e) => {
    if (e.alive) {
      e.x += enemySpeed;
      if (e.x < 0 || e.x + e.width > canvas.width) enemySpeed *= -1;
    }
  });

  powerUps.forEach((p, i) => {
    p.y += 3;
    if (p.y > canvas.height) powerUps.splice(i, 1);
  });

  bullets.forEach((b, bi) => {
    enemies.forEach((e) => {
      if (
        e.alive &&
        b.x < e.x + e.width &&
        b.x + 4 > e.x &&
        b.y < e.y + e.height &&
        b.y + 10 > e.y
      ) {
        e.alive = false;
        bullets.splice(bi, 1);
        score += 10 * scoreMultiplier;
        explosionSound.currentTime = 0;
        if (!isMuted) explosionSound.play();
        explosions.push({ x: e.x + e.width / 2, y: e.y + e.height / 2, radius: 0 });
      }
    });
  });

  powerUps.forEach((p, i) => {
    if (
      p.x < ship.x + ship.width &&
      p.x + p.width > ship.x &&
      p.y < ship.y + ship.height &&
      p.y + p.height > ship.y
    ) {
      if (p.type === 'shield') ship.shield = true;
      else if (p.type === 'triple') {
        scoreMultiplier = 3;
        setTimeout(() => scoreMultiplier = 1, 5000); // Triple shot for 5 seconds
      }
      powerUps.splice(i, 1);
    }
  });

  enemies.forEach((e) => {
    if (e.alive && e.y + e.height >= ship.y) {
      e.alive = false;
      if (!ship.shield) lives--;
      if (lives <= 0) {
        gameOver = true;
        bgMusic.pause();
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
      }
    }
  });

  if (enemies.every(e => !e.alive)) {
    bossWave = !bossWave;
    enemySpeed += 0.5;
    spawnEnemies();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!started) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("ALIEN INVASION", 250, 260);
    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE or TAP to start", 280, 320);
    return;
  }

  if (!gameOver) {
    ctx.fillStyle = ship.shield ? "blue" : "white";
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
  }

  bullets.forEach((b) => {
    ctx.fillStyle = ship.shield ? "cyan" : "red";
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  enemies.forEach((e) => {
    ctx.fillStyle = e.type === 'boss' ? "red" : "green";
    if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  explosions.forEach((ex) => {
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "orange";
    ctx.stroke();
  });

  powerUps.forEach((p) => {
    ctx.fillStyle = p.type === 'shield' ? "blue" : "yellow";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Lives: " + lives, 700, 20);
  ctx.fillText("High Score: " + highScore, 300, 20);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 290, 300);
    ctx.font = "20px Arial";
    ctx.fillText("Press 'R' to restart", 310, 340);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
// Boss mechanics
let bossHealth = 100;
let bossDamage = 10;

// Boss battle handling
function spawnBoss() {
  enemies = [
    {
      x: 350, y: 50, width: 100, height: 40, alive: true, type: 'boss', health: bossHealth
    }
  ];
}

function updateBoss() {
  if (bossWave && enemies[0].alive) {
    enemies[0].x += enemySpeed;
    if (enemies[0].x <= 0 || enemies[0].x + enemies[0].width >= canvas.width) {
      enemySpeed *= -1;
    }
    if (enemies[0].y + enemies[0].height >= ship.y) {
      lives -= 1; // Boss hits player if it touches
      enemies[0].alive = false;
      if (lives <= 0) {
        gameOver = true;
        bgMusic.pause();
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
      }
    }
  }
}

// Handling Boss hit
function hitBoss() {
  bullets.forEach((b, bi) => {
    if (
      b.x < enemies[0].x + enemies[0].width &&
      b.x + 4 > enemies[0].x &&
      b.y < enemies[0].y + enemies[0].height &&
      b.y + 10 > enemies[0].y
    ) {
      enemies[0].health -= 20;
      bullets.splice(bi, 1);
      score += 30;
      if (enemies[0].health <= 0) {
        enemies[0].alive = false;
        score += 100; // Boss defeat bonus
        bossWave = false;
        spawnEnemies();
      }
    }
  });
}

// Additional gameplay and visual improvements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!started) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("ALIEN INVASION", 250, 260);
    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE or TAP to start", 280, 320);
    return;
  }

  if (!gameOver) {
    ctx.fillStyle = ship.shield ? "blue" : "white";
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
  }

  // Draw bullets
  bullets.forEach((b) => {
    ctx.fillStyle = ship.shield ? "cyan" : "red";
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  // Draw enemies
  enemies.forEach((e) => {
    ctx.fillStyle = e.type === 'boss' ? "red" : "green";
    if (e.alive) {
      ctx.fillRect(e.x, e.y, e.width, e.height);
      if (e.type === 'boss') {
        ctx.fillStyle = 'black';
        ctx.fillText(`HP: ${e.health}`, e.x + 10, e.y - 10);
      }
    }
  });

  // Draw power-ups
  powerUps.forEach((p) => {
    ctx.fillStyle = p.type === 'shield' ? "blue" : "yellow";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Draw explosions
  explosions.forEach((ex) => {
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "orange";
    ctx.stroke();
  });

  // Game stats
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Lives: " + lives, 700, 20);
  ctx.fillText("High Score: " + highScore, 300, 20);

  // Game over screen
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 290, 300);
    ctx.font = "20px Arial";
    ctx.fillText("Press 'R' to restart", 310, 340);
  }
}

// Update function to include boss logic
function update() {
  if (gameOver || isPaused) return;

  // Regular updates
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  });

  enemies.forEach((e) => {
    if (e.alive) {
      e.x += enemySpeed;
      if (e.x < 0 || e.x + e.width > canvas.width) enemySpeed *= -1;
    }
  });

  powerUps.forEach((p, i) => {
    p.y += 3;
    if (p.y > canvas.height) powerUps.splice(i, 1);
  });

  // Boss update
  if (bossWave) {
    updateBoss();
    hitBoss();
  }

  // Check if power-ups interact with the ship
  powerUps.forEach((p, i) => {
    if (
      p.x < ship.x + ship.width &&
      p.x + p.width > ship.x &&
      p.y < ship.y + ship.height &&
      p.y + p.height > ship.y
    ) {
      if (p.type === 'shield') ship.shield = true;
      else if (p.type === 'triple') {
        scoreMultiplier = 3;
        setTimeout(() => scoreMultiplier = 1, 5000); // Triple shot for 5 seconds
      }
      powerUps.splice(i, 1);
    }
  });

  enemies.forEach((e) => {
    if (e.alive && e.y + e.height >= ship.y) {
      e.alive = false;
      if (!ship.shield) lives--;
      if (lives <= 0) {
        gameOver = true;
        bgMusic.pause();
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
      }
    }
  });

  if (enemies.every(e => !e.alive)) {
    bossWave = !bossWave;
    enemySpeed += 0.5;
    spawnEnemies();
  }
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();