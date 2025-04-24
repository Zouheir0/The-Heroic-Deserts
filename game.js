const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 6,
    dx: 0,
    dy: 0
};

let bullets = [];
let enemies = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let gamePaused = false;

// Image Assets
const shipImage = new Image();
const alienImage = new Image();
const backgroundImage = new Image();

shipImage.src = 'https://i.imgur.com/NkR6X5n.png';
alienImage.src = 'https://i.imgur.com/DiHM5Zb.png';
backgroundImage.src = 'https://i.imgur.com/U1pFZsH.jpg';

// Audio
const shootSound = new Audio('https://freesound.org/data/previews/341/341695_6266190-lq.mp3');
const hitSound = new Audio('https://freesound.org/data/previews/170/170144_2398400-lq.mp3');
const backgroundMusic = new Audio('https://freesound.org/data/previews/250/250629_4486188-lq.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

// Controls
document.addEventListener('keydown', e => {
    if (e.code === 'ArrowRight') ship.dx = ship.speed;
    if (e.code === 'ArrowLeft') ship.dx = -ship.speed;
    if (e.code === 'ArrowUp') ship.dy = -ship.speed;
    if (e.code === 'ArrowDown') ship.dy = ship.speed;
    if (e.code === 'Space') shootBullet();
    if (e.code === 'KeyP') togglePause();
});
document.addEventListener('keyup', e => {
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') ship.dx = 0;
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') ship.dy = 0;
});

// Buttons
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function togglePause() {
    gamePaused = !gamePaused;
    if (!gamePaused) gameLoop();
}

function resetGame() {
    bullets = [];
    enemies = [];
    score = 0;
    ship.x = canvas.width / 2 - 25;
    ship.y = canvas.height - 60;
    gameOver = false;
    gamePaused = false;
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    gameLoop();
}

// Drawing and Game Logic
function drawShip() {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

function shootBullet() {
    shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 2.5,
        y: ship.y,
        width: 5,
        height: 10,
        speed: 8
    });
}

function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(b => ctx.fillRect(b.x, b.y -= b.speed, b.width, b.height));
}

function spawnAlien() {
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: Math.random() * 2 + 1
    });
}

function drawAliens() {
    enemies.forEach(alien => {
        alien.y += alien.speed;
        ctx.drawImage(alienImage, alien.x, alien.y, alien.width, alien.height);
    });
}

function checkCollisions() {
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (
                b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y
            ) {
                hitSound.play();
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score += 10;
            }
        });
    });
}

function checkGameOver() {
    enemies.forEach(e => {
        if (e.y + e.height > ship.y && !gameOver) {
            gameOver = true;
            backgroundMusic.pause();
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', score);
            }
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High Score: ${highScore}`, 650, 30);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function update() {
    if (gameOver || gamePaused) return;

    ship.x += ship.dx;
    ship.y += ship.dy;

    drawBackground();
    drawShip();
    drawBullets();
    drawAliens();
    checkCollisions();
    checkGameOver();
    drawScore();
}

function gameLoop() {
    if (gamePaused || gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    requestAnimationFrame(gameLoop);
}

// Start
window.onload = () => {
    backgroundMusic.play().catch(() => {}); // Catch autoplay errors
    setInterval(spawnAlien, 1000);
    gameLoop();
};