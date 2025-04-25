const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;

let ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 6,
    dx: 0,
    dy: 0,
    health: 100,
    money: 0,
    weaponLevel: 1,
};

let bullets = [];
let enemies = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gamePaused = true;
let gameOver = false;
let wave = 0;
let currentMap = 0;

const maps = [
    'https://i.imgur.com/5Kj8jvM.png', // map 1
    'https://i.imgur.com/xF6HCU2.png', // map 2
    'https://i.imgur.com/S7fr5sl.png', // map 3
];

const assets = {
    ship: 'https://i.imgur.com/nG7VyYr.png',
    alien: 'https://i.imgur.com/N5uCbDu.png',
    zombie: 'https://i.imgur.com/B3xWhzF.png',
    ufo: 'https://i.imgur.com/94jXzMa.png',
    background: maps[currentMap],
    shootSound: 'https://www.soundjay.com/mechanical/sounds/mechanical-gun-01.mp3',
    hitSound: 'https://www.soundjay.com/button/sounds/button-16.mp3',
    bgMusic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
};

const shipImg = new Image();
const alienImg = new Image();
const zombieImg = new Image();
const ufoImg = new Image();
const bgImg = new Image();
shipImg.src = assets.ship;
alienImg.src = assets.alien;
zombieImg.src = assets.zombie;
ufoImg.src = assets.ufo;
bgImg.src = assets.background;

const shootSound = new Audio(assets.shootSound);
const hitSound = new Audio(assets.hitSound);
const bgMusic = new Audio(assets.bgMusic);
bgMusic.loop = true;
bgMusic.volume = 0.3;
function drawShip() {
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    ctx.fillStyle = "green";
    ctx.fillRect(ship.x, ship.y - 10, ship.health / 2, 5);
}

function shootBullet() {
    shootSound.currentTime = 0;
    shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 2,
        y: ship.y,
        width: 5,
        height: 15,
        speed: 10 + ship.weaponLevel * 2
    });
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function spawnEnemy(type = 'alien') {
    const enemyTypes = {
        alien: alienImg,
        zombie: zombieImg,
        ufo: ufoImg
    };
    const speed = Math.random() * 1.5 + 1;
    enemies.push({
        type: type,
        img: enemyTypes[type],
        x: Math.random() * (canvas.width - 50),
        y: -60,
        width: 50,
        height: 50,
        speed: speed,
        health: type === 'zombie' ? 3 : 1
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.drawImage(e.img, e.x, e.y, e.width, e.height);
    });
}

function moveEnemies() {
    enemies.forEach(e => {
        e.y += e.speed;
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
                hitSound.currentTime = 0;
                hitSound.play();
                e.health -= ship.weaponLevel;
                if (e.health <= 0) {
                    enemies.splice(ei, 1);
                    ship.money += 10;
                    score += 5;
                }
                bullets.splice(bi, 1);
            }
        });
    });
}
function checkGameOver() {
    enemies.forEach(e => {
        if (
            e.y + e.height > ship.y &&
            e.x < ship.x + ship.width &&
            e.x + e.width > ship.x &&
            !gameOver
        ) {
            ship.health -= 20;
            if (ship.health <= 0) {
                gameOver = true;
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
                alert("Game Over! Final Score: " + score);
            }
        }
    });
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("Money: $" + ship.money, 10, 40);
    ctx.fillText("Weapon Level: " + ship.weaponLevel, 10, 60);
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function update() {
    if (!paused && !gameOver) {
        moveShip();
        moveEnemies();
        bullets.forEach(b => b.y -= b.speed);
        bullets = bullets.filter(b => b.y > 0);
        checkCollisions();
        checkGameOver();
    }

    drawBackground();
    drawShip();
    drawBullets();
    drawEnemies();
    drawScore();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    requestAnimationFrame(gameLoop);
}
function startGame() {
    gameStarted = true;
    backgroundMusic.play();
    setInterval(spawnEnemy, 2000);
    gameLoop();
}

// --- CONTROLS ---
document.addEventListener("keydown", e => {
    if (e.code === "ArrowLeft") left = true;
    if (e.code === "ArrowRight") right = true;
    if (e.code === "ArrowUp") up = true;
    if (e.code === "ArrowDown") down = true;
    if (e.code === "Space") {
        if (!gameStarted) startGame();
        else shootBullet();
    }
});

document.addEventListener("keyup", e => {
    if (e.code === "ArrowLeft") left = false;
    if (e.code === "ArrowRight") right = false;
    if (e.code === "ArrowUp") up = false;
    if (e.code === "ArrowDown") down = false;
});

// --- UI BUTTONS ---
document.getElementById("pauseBtn").addEventListener("click", () => {
    paused = !paused;
    if (paused) backgroundMusic.pause();
    else backgroundMusic.play();
});

document.getElementById("resetBtn").addEventListener("click", () => {
    location.reload();
});

document.getElementById("shopBtn").addEventListener("click", () => {
    if (ship.money >= 50) {
        ship.weaponLevel++;
        ship.money -= 50;
    }
});

// --- MAP SELECTION ---
const mapSelect = document.getElementById("mapSelect");
mapSelect.addEventListener("change", () => {
    const map = mapSelect.value;
    if (map === "desert") backgroundImg.src = "https://i.imgur.com/UOqM9.jpg";
    if (map === "space") backgroundImg.src = "https://i.imgur.com/oCkEbrn.jpg";
    if (map === "lava") backgroundImg.src = "https://i.imgur.com/Fo7CwdO.jpg";
});