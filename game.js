// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game Variables
let ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
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
let spaceKey = false;

// Images
const shipImage = new Image();
const alienImage = new Image();
const backgroundImage = new Image();

// Sounds
let shootSound, hitSound, backgroundMusic;

// Load images and sounds, then start game
window.onload = () => {
    loadAssets().then(() => {
        startGame();
    }).catch((err) => {
        console.error('Error loading assets:', err);
    });
};

// Load all assets
function loadAssets() {
    return Promise.all([
        loadImage('images/spaceship.png', shipImage),
        loadImage('images/alien.png', alienImage),
        loadImage('images/background.png', backgroundImage),
        loadAudio('sounds/shoot.mp3').then(audio => shootSound = audio),
        loadAudio('sounds/hit.mp3').then(audio => hitSound = audio),
        loadAudio('sounds/background.mp3').then(audio => {
            backgroundMusic = audio;
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.3;
        })
    ]);
}

function loadImage(src, imgObj) {
    return new Promise((resolve, reject) => {
        imgObj.onload = resolve;
        imgObj.onerror = () => reject(`Failed to load image: ${src}`);
        imgObj.src = src;
    });
}

function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = src;
        audio.addEventListener('canplaythrough', () => resolve(audio));
        audio.addEventListener('error', () => reject(`Failed to load sound: ${src}`));
    });
}

function moveShip() {
    ship.x += ship.dx;
    ship.y += ship.dy;

    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
    if (ship.y < 0) ship.y = 0;
    if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;
}

function drawShip() {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

function shootBullet() {
    if (shootSound) shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 2,
        y: ship.y,
        width: 4,
        height: 10,
        speed: 7
    });
}

function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function spawnAlien() {
    enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        width: 50,
        height: 50,
        speed: 2 + Math.random() * 2
    });
}

function drawAliens() {
    enemies.forEach(e => ctx.drawImage(alienImage, e.x, e.y, e.width, e.height));
}

function moveEnemies() {
    enemies.forEach(e => e.y += e.speed);
}

function checkCollisions() {
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (b.x < e.x + e.width && b.x + b.width > e.x &&
                b.y < e.y + e.height && b.y + b.height > e.y) {
                if (hitSound) hitSound.play();
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
            ctx.fillStyle = 'red';
            ctx.font = '30px Arial';
            ctx.fillText('GAME OVER!', canvas.width / 2 - 90, canvas.height / 2);
            ctx.fillText('Score: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 40);
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', score);
            }
            ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 70, canvas.height / 2 + 80);
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Score: ' + score, 10, 25);
    ctx.fillText('High Score: ' + highScore, 650, 25);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function update() {
    if (gameOver) return;
    moveShip();
    drawBackground();
    drawShip();
    drawBullets();
    drawAliens();
    moveEnemies();
    checkCollisions();
    checkGameOver();
    drawScore();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    setInterval(spawnAlien, 1500);
    if (backgroundMusic) backgroundMusic.play().catch(() => {});
    gameLoop();
}

// Controls
document.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') ship.dx = -ship.speed;
    if (e.code === 'ArrowRight') ship.dx = ship.speed;
    if (e.code === 'ArrowUp') ship.dy = -ship.speed;
    if (e.code === 'ArrowDown') ship.dy = ship.speed;
    if (e.code === 'Space' && !spaceKey) {
        shootBullet();
        spaceKey = true;
    }
});

document.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') ship.dx = 0;
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') ship.dy = 0;
    if (e.code === 'Space') spaceKey = false;
});