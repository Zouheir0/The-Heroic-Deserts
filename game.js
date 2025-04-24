// Setup canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game Variables
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
let keys = {};

let shipImage = new Image();
let alienImage = new Image();
let backgroundImage = new Image();

let shootSound, hitSound, backgroundMusic;

// Load all assets and start game
window.onload = () => {
    loadAssets().then(() => {
        backgroundMusic.play();
        startGame();
    }).catch(err => {
        console.error('Error loading assets:', err);
    });
};

function loadImage(src, imgObj) {
    return new Promise((resolve, reject) => {
        imgObj.src = src;
        imgObj.onload = resolve;
        imgObj.onerror = () => reject(`Failed to load image: ${src}`);
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

function loadAssets() {
    return Promise.all([
        loadImage('images/spaceship.png', shipImage),
        loadImage('images/alien.png', alienImage),
        loadImage('images/background.png', backgroundImage),
        loadAudio('sounds/shoot.mp3'),
        loadAudio('sounds/hit.mp3'),
        loadAudio('sounds/background.mp3')
    ]).then(assets => {
        shootSound = assets[3];
        hitSound = assets[4];
        backgroundMusic = assets[5];
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.4;
    });
}

function moveShip() {
    if (keys['ArrowRight']) ship.x += ship.speed;
    if (keys['ArrowLeft']) ship.x -= ship.speed;
    if (keys['ArrowUp']) ship.y -= ship.speed;
    if (keys['ArrowDown']) ship.y += ship.speed;

    // Boundaries
    ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x));
    ship.y = Math.max(0, Math.min(canvas.height - ship.height, ship.y));
}

function shootBullet() {
    shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 2,
        y: ship.y,
        width: 4,
        height: 20,
        speed: 8
    });
}

function spawnAlien() {
    enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: 2 + Math.random() * 2
    });
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawShip() {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawEnemies() {
    enemies.forEach(e => ctx.drawImage(alienImage, e.x, e.y, e.width, e.height));
}

function updateBullets() {
    bullets = bullets.filter(b => b.y + b.height > 0);
    bullets.forEach(b => b.y -= b.speed);
}

function updateEnemies() {
    enemies.forEach(e => e.y += e.speed);
    enemies = enemies.filter(e => e.y < canvas.height);
}

function checkCollisions() {
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (b.x < e.x + e.width && b.x + b.width > e.x &&
                b.y < e.y + e.height && b.y + b.height > e.y) {
                hitSound.play();
                bullets.splice(bi, 1);
                enemies.splice(ei, 1);
                score += 10;
            }
        });
    });

    enemies.forEach(e => {
        if (e.y + e.height > ship.y &&
            e.x < ship.x + ship.width &&
            e.x + e.width > ship.x) {
            gameOver = true;
            backgroundMusic.pause();
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High Score: ${highScore}`, 650, 30);
}

function showGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 120, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 60, canvas.height / 2 + 20);
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        ctx.fillText('New High Score!', canvas.width / 2 - 70, canvas.height / 2 + 50);
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    moveShip();
    updateBullets();
    updateEnemies();
    checkCollisions();
    drawShip();
    drawBullets();
    drawEnemies();
    drawScore();
    if (gameOver) {
        showGameOver();
        return;
    }
    requestAnimationFrame(update);
}

function startGame() {
    setInterval(spawnAlien, 1000);
    update();
}

// Controls
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') shootBullet();
});
document.addEventListener('keyup', e => {
    keys[e.code] = false;
});