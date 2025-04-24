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
    dy: 0,
    health: 100
};

let bullets = [];
let enemies = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let keys = {};

const shipImage = new Image();
const alienImage = new Image();
const backgroundImage = new Image();

const shootSound = new Audio('sounds/shoot.mp3');
const hitSound = new Audio('sounds/hit.mp3');
const backgroundMusic = new Audio('sounds/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;

function loadAssets() {
    return Promise.all([
        loadImage('images/spaceship.png', shipImage),
        loadImage('images/alien.png', alienImage),
        loadImage('images/background.png', backgroundImage),
        loadAudio(shootSound),
        loadAudio(hitSound),
        loadAudio(backgroundMusic)
    ]);
}

function loadImage(src, imgObj) {
    return new Promise((resolve, reject) => {
        imgObj.onload = resolve;
        imgObj.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        imgObj.src = src;
    });
}

function loadAudio(audio) {
    return new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = () => reject(new Error(`Failed to load audio: ${audio.src}`));
    });
}

function moveShip() {
    if (keys['ArrowLeft']) ship.x -= ship.speed;
    if (keys['ArrowRight']) ship.x += ship.speed;
    if (keys['ArrowUp']) ship.y -= ship.speed;
    if (keys['ArrowDown']) ship.y += ship.speed;

    ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x));
    ship.y = Math.max(0, Math.min(canvas.height - ship.height, ship.y));
}

function shootBullet() {
    shootSound.currentTime = 0;
    shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 5,
        y: ship.y,
        width: 10,
        height: 20,
        speed: 7
    });
}

function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
        b.y -= b.speed;
    });
    bullets = bullets.filter(b => b.y > 0);
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

function drawAliens() {
    enemies.forEach(e => {
        ctx.drawImage(alienImage, e.x, e.y, e.width, e.height);
        e.y += e.speed;
    });
    enemies = enemies.filter(e => e.y < canvas.height + 50);
}

function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                hitSound.currentTime = 0;
                hitSound.play();
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 10;
            }
        });
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`High Score: ${highScore}`, 650, 25);
}

function drawShip() {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function checkGameOver() {
    for (let enemy of enemies) {
        if (enemy.y + enemy.height > ship.y) {
            gameOver = true;
            break;
        }
    }
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 80, canvas.height / 2 + 50);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    moveShip();
    drawShip();
    drawBullets();
    drawAliens();
    checkCollisions();
    drawScore();
    checkGameOver();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    backgroundMusic.play();
    setInterval(spawnAlien, 1500);
    gameLoop();
}

document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet();
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

window.onload = () => {
    loadAssets().then(startGame).catch(err => console.error('Error loading assets:', err));
};