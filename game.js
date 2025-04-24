const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let ship = { x: 400, y: 550, width: 40, height: 20, speed: 5 };
let bullets = [];
let enemies = [];
let score = 0;

// Create enemies
for (let i = 0; i < 5; i++) {
  enemies.push({ x: 100 + i * 120, y: 50, width: 40, height: 20, alive: true });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") ship.x -= ship.speed;
  if (e.key === "ArrowRight" || e.key === "d") ship.x += ship.speed;
  if (e.key === " " || e.key === "Spacebar") {
    bullets.push({ x: ship.x + ship.width / 2 - 2, y: ship.y, speed: 7 });
  }
});

function update() {
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
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
        score += 10;
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ship
  ctx.fillStyle = "white";
  ctx.fillRect(ship.x, ship.y, ship.width, ship.height);

  // Draw bullets
  ctx.fillStyle = "red";
  bullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  // Draw enemies
  ctx.fillStyle = "green";
  enemies.forEach((e) => {
    if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();