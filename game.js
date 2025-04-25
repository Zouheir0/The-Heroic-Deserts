const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
};

let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let gamePaused = false;
let gameStarted = false;
let highScore = localStorage.getItem('highScore') || 0;

const shipImage = new Image();
const alienImage = new Image();
const backgroundImage = new Image();

shipImage.src = "https://i.imgur.com/N5uCbDu.png"; // spaceship
alienImage.src = "https://i.imgur.com/KX3pNkQ.png"; // alien
backgroundImage.src = "https://i.imgur.com/kk7gV4f.jpeg"; // background

const shootSound = new Audio('sounds/shoot.mp3');
const hitSound = new Audio('sounds/hit.mp3');
const backgroundMusic = new Audio('sounds/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

function moveShip() {
    if (keys["ArrowLeft"]) ship.dx = -ship.speed;
    else if (keys["ArrowRight"]) ship.dx = ship.speed;
    else ship.dx = 0;

    ship.x += ship.dx;

    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
}

function drawShip() {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

function shootBullet() {
    shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 2.5,
        y: ship.y,
        width: 5,
        height: 15,
        speed: 7
    });
}

function drawBullets() {
    ctx.fillStyle = "white";
    bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
}

function moveBullets() {
    bullets = bullets.filter(b => b.y + b.height > 0);
    bullets.forEach(b => b.y -= b.speed);
}

function spawnAlien() {
    enemies.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: Math.random() * 2 + 1
    });
}

function drawAliens() {
    enemies.forEach(a => {
        ctx.drawImage(alienImage, a.x, a.y, a.width, a.height);
    });
}

function moveAliens() {
    enemies.forEach(a => {
        a.y += a.speed;
    });
}

function checkCollisions() {
    enemies.forEach((alien, ai) => {
        bullets.forEach((bullet, bi) => {
            if (
                bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y
            ) {
                hitSound.play();
                bullets.splice(bi, 1);
                enemies.splice(ai, 1);
                score += 10;
            }
        });

        if (alien.y + alien.height > ship.y &&
            alien.x < ship.x + ship.width &&
            alien.x + alien.width > ship.x
        ) {
            gameOver = true;
        }
    });
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High Score: ${highScore}`, 20, 60);
}

function showGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText("GAME OVER", canvas.width / 2 - 130, canvas.height / 2);
}

function update() {
    if (!gameStarted || gamePaused) return;
    if (gameOver) {
        showGameOver();
        return;
    }

    drawBackground();
    moveShip();
    drawShip();

    moveBullets();
    drawBullets();

    moveAliens();
    drawAliens();

    checkCollisions();
    drawScore();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    requestAnimationFrame(loop);
}

setInterval(() => {
    if (!gamePaused && !gameOver && gameStarted) spawnAlien();
}, 1000);

// Controls
let keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;

    if (e.key === ' ' && !gameStarted) {
        gameStarted = true;
        backgroundMusic.play();
    }

    if (e.key === ' ' && !gameOver) shootBullet();
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

// Buttons
document.getElementById('pauseButton').addEventListener('click', () => {
    gamePaused = true;
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('unpauseButton').style.display = 'inline';
});

document.getElementById('unpauseButton').addEventListener('click', () => {
    gamePaused = false;
    document.getElementById('pauseButton').style.display = 'inline';
    document.getElementById('unpauseButton').style.display = 'none';
});

document.getElementById('resetButton').addEventListener('click', () => {
    location.reload();
});

loop();