// Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game variables
let ship = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 5,
    shield: false
};

let bullets = [];
let enemies = [];
let powerUps = [];
let score = 0;
let lives = 3;
let gameOver = false;
let enemySpeed = 1;
let waveNumber = 0;
let bossWave = false;
let highScore = localStorage.getItem("highScore") || 0;
let started = false;

// Sound Setup
const shootSound = new Audio('sounds/shoot.mp3');
const hitSound = new Audio('sounds/hit.mp3');
const powerUpSound = new Audio('sounds/powerup.mp3');
const backgroundMusic = new Audio('sounds/background.mp3');

// Keypress events
let rightKey = false;
let leftKey = false;
let spaceKey = false;

// Background music control
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;

// Start background music when game starts
function startBackgroundMusic() {
    if (!backgroundMusic.paused) return;
    backgroundMusic.play();
}

// Game initialization functions
function spawnEnemies() {
    let numEnemies = waveNumber * 3 + 5;
    for (let i = 0; i < numEnemies; i++) {
        let x = i * 120 + 50;
        let y = 50 + (waveNumber * 20);
        let type = (i % 5 === 0 && waveNumber > 5) ? 'boss' : 'normal'; // Boss enemy
        enemies.push({
            x: x,
            y: y,
            width: 60,
            height: 40,
            alive: true,
            type: type
        });
    }
}

function spawnPowerUps() {
    // Randomly spawn power-ups with a chance to spawn
    if (Math.random() < 0.1) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let type = Math.random() < 0.5 ? 'shield' : 'extraLife';
        powerUps.push({
            x: x,
            y: y,
            width: 30,
            height: 30,
            type: type
        });
    }
}

// Draw game elements on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ship
    ctx.fillStyle = ship.shield ? "blue" : "white";
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);

    // Draw bullets
    bullets.forEach((b) => {
        ctx.fillStyle = "red";
        ctx.fillRect(b.x, b.y, 4, 10);
    });

    // Draw enemies
    enemies.forEach((e) => {
        if (e.alive) {
            ctx.fillStyle = e.type === 'boss' ? "red" : "green";
            ctx.fillRect(e.x, e.y, e.width, e.height);
        }
    });

    // Draw power-ups
    powerUps.forEach((p) => {
        ctx.fillStyle = p.type === 'shield' ? "blue" : "yellow";
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Draw score, lives, and high score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Lives: " + lives, 700, 20);
    ctx.fillText("High Score: " + highScore, 300, 20);

    // Game Over screen
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 290, 300);
        ctx.font = "20px Arial";
        ctx.fillText("Press 'R' to restart", 310, 340);
    }

    // Starting screen
    if (!started) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("ALIEN INVASION", 250, 260);
        ctx.font = "20px Arial";
        ctx.fillText("Press SPACE to start", 280, 320);
    }
}

// Update game state
function update() {
    if (gameOver) return;

    if (!started) return; // Don't update if game isn't started

    // Ship movement
    if (rightKey && ship.x + ship.width < canvas.width) {
        ship.x += ship.speed;
    }
    if (leftKey && ship.x > 0) {
        ship.x -= ship.speed;
    }

    // Bullet movement
    bullets.forEach((b, index) => {
        b.y -= 5;
        if (b.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // Enemy movement
    enemies.forEach((e) => {
        if (e.alive) {
            e.x += enemySpeed;
            if (e.x <= 0 || e.x + e.width >= canvas.width) {
                enemySpeed *= -1;
                e.y += 20;
            }
        }
    });

    // Power-up collection
    powerUps.forEach((p, index) => {
        if (ship.x < p.x + p.width && ship.x + ship.width > p.x && ship.y < p.y + p.height && ship.y + ship.height > p.y) {
            powerUpSound.play();
            if (p.type === 'shield') {
                ship.shield = true;
                setTimeout(() => { ship.shield = false; }, 5000);
            } else if (p.type === 'extraLife') {
                lives += 1;
            }
            powerUps.splice(index, 1);
        }
    });

    // Bullet-enemy collision detection
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (b.x < e.x + e.width && b.x + 4 > e.x && b.y < e.y + e.height && b.y + 10 > e.y) {
                e.alive = false;
                bullets.splice(bi, 1);
                score += 10;
                hitSound.play();
            }
        });
    });

    // Check if player has lost all lives
    if (lives <= 0) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
        return;
    }

    // Add more enemies after clearing the current wave
    if (enemies.every((e) => !e.alive)) {
        waveNumber++;
        spawnEnemies();
    }

    // Add power-ups periodically
    spawnPowerUps();
}

// Key controls
document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight") {
        rightKey = true;
    }
    if (e.code === "ArrowLeft") {
        leftKey = true;
    }
    if (e.code === "Space" && !started) {
        started = true;
        spawnEnemies();
        startBackgroundMusic();
    }
    if (e.code === "Space" && gameOver) {
        gameOver = false;
        lives = 3;
        score = 0;
        enemies = [];
        spawnEnemies();
    }
    if (e.code === "ArrowRight" && !gameOver) {
        shootBullet();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowRight") {
        rightKey = false;
    }
    if (e.code === "ArrowLeft") {
        leftKey = false;
    }
});

// Fire bullet
function shootBullet() {
    shootSound.play();
    bullets.push({ x: ship.x + ship.width / 2 - 2, y: ship.y, speed: 5 });
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Keep the loop running
}

gameLoop(); // Start the game loop