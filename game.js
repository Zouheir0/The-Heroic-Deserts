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
let rightKey = false;
let leftKey = false;
let spaceKey = false;

// Images
const shipImage = new Image();
const alienImage = new Image();
const backgroundImage = new Image();
let imagesLoaded = true;

// Sounds
let shootSound = new Audio();
let hitSound = new Audio();
let backgroundMusic = new Audio();
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

window.onload = () => {
    loadAssets().then(() => {
        startGame();
    }).catch((err) => {
        console.error('Error loading assets:', err);
        imagesLoaded = false; // fallback: still run the game
        startGame();
    });
};

function loadAssets() {
    return Promise.all([
        loadImage('https://i.imgur.com/Z5xqF6M.png', shipImage),       // spaceship
loadImage('https://i.imgur.com/Nj2D1GJ.png', alienImage),      // alien
loadImage('https://i.imgur.com/jf9nrcF.jpg', backgroundImage), // background
        loadAudio('sounds/shoot.mp3'),
        loadAudio('sounds/hit.mp3'),
        loadAudio('sounds/background.mp3')
    ]);
}
function loadImage(src, image) {
    return new Promise((resolve, reject) => {
        image.src = src;
        image.onload = resolve;
        image.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            resolve(); // don't block the game
        };
    });
}

function loadAudio(src, assignFunc) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.oncanplaythrough = () => {
            assignFunc(audio);
            resolve();
        };
        audio.onerror = () => {
            console.warn(`Failed to load audio: ${src}`);
            assignFunc(new Audio()); // empty fallback audio
            resolve();
        };
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
    if (imagesLoaded) {
        ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
    } else {
        ctx.fillStyle = '#0f0';
        ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
    }
}

function shootBullet() {
    shootSound.play();
    bullets.push({
        x: ship.x + ship.width / 2 - 2.5,
        y: ship.y,
        width: 5,
        height: 20,
        speed: 8
    });
}

function drawBullets() {
    ctx.fillStyle = "#FFF";
    bullets.forEach(b => ctx.fillRect(b.x, b.y -= b.speed, b.width, b.height));
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
    enemies.forEach(alien => {
        if (imagesLoaded) {
            ctx.drawImage(alienImage, alien.x, alien.y, alien.width, alien.height);
        } else {
            ctx.fillStyle = '#f00';
            ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        }
    });
}

function moveEnemies() {
    enemies.forEach(a => a.y += a.speed);
}

function checkCollisions() {
    bullets.forEach((bullet, bIdx) => {
        enemies.forEach((alien, aIdx) => {
            if (bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                hitSound.play();
                bullets.splice(bIdx, 1);
                enemies.splice(aIdx, 1);
                score += 10;
            }
        });
    });
}

function checkGameOver() {
    enemies.forEach(alien => {
        if (alien.y + alien.height > ship.y && !gameOver) {
            gameOver = true;
            ctx.fillStyle = 'red';
            ctx.font = '30px Arial';
            ctx.fillText('GAME OVER!', canvas.width / 2 - 90, canvas.height / 2);
            ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 40);
            if (score > highScore) {
                localStorage.setItem('highScore', score);
            }
            ctx.fillText(`High Score: ${highScore}`, canvas.width / 2 - 70, canvas.height / 2 + 80);
        }
    });
}

function drawScore() {
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 180, 30);
}

function drawBackground() {
    if (imagesLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function update() {
    if (gameOver) return;
    moveShip();
    drawBackground();
    drawShip();
    drawBullets();
    moveEnemies();
    drawAliens();
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
    setInterval(spawnAlien, 1000);
    backgroundMusic.play().catch(() => console.warn('Autoplay blocked.'));
    gameLoop();
}

// Controls
document.addEventListener('keydown', e => {
    if (e.code === 'ArrowRight') ship.dx = ship.speed;
    if (e.code === 'ArrowLeft') ship.dx = -ship.speed;
    if (e.code === 'ArrowUp') ship.dy = -ship.speed;
    if (e.code === 'ArrowDown') ship.dy = ship.speed;
    if (e.code === 'Space' && !spaceKey) {
        shootBullet();
        spaceKey = true;
    }
});

document.addEventListener('keyup', e => {
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') ship.dx = 0;
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') ship.dy = 0;
    if (e.code === 'Space') spaceKey = false;
});