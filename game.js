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
    dy: 0,
    health: 100,
    gunTexture: 'images/gun.png'  // Player Gun Image
};

let bullets = [];
let enemies = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let rightKey = false;
let leftKey = false;
let spaceKey = false;
let mouseX = 0;
let mouseY = 0;

// Images
const shipImage = new Image();
const alienImage = new Image();
const backgroundImage = new Image();

// Sounds
const shootSound = new Audio('sounds/shoot.mp3');
const hitSound = new Audio('sounds/hit.mp3');
const backgroundMusic = new Audio('sounds/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

// Load images and start the game
window.onload = () => {
    loadAssets().then(() => {
        startGame();
    }).catch((err) => {
        console.error('Error loading assets:', err);
    });
};

// Function to load images and sounds
function loadAssets() {
    return Promise.all([
        loadImage('images/spaceship.png', shipImage),
        loadImage('images/alien.png', alienImage),
        loadImage('images/background.png', backgroundImage),
        loadAudio('sounds/shoot.mp3'),
        loadAudio('sounds/hit.mp3'),
        loadAudio('sounds/background.mp3')
    ]);
}

function loadImage(src, imgObj) {
    return new Promise((resolve, reject) => {
        imgObj.src = src;
        imgObj.onload = resolve;
        imgObj.onerror = reject;
    });
}

function loadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
    });
}

// Player Ship Movement
function moveShip() {
    ship.x += ship.dx;
    ship.y += ship.dy;

    // Boundaries for ship
    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
    if (ship.y < 0) ship.y = 0;
    if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;
}

// Draw Player Ship with Gun Texture
function drawShip() {
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
}

// Bullet Mechanics
function shootBullet() {
    shootSound.play();
    let bullet = {
        x: ship.x + ship.width / 2 - 5,
        y: ship.y,
        width: 10,
        height: 20,
        speed: 6
    };
    bullets.push(bullet);
}

// Draw Bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed; // Move bullet up
    });

    // Remove bullets off screen
    bullets = bullets.filter(bullet => bullet.y >= 0);
}

// Alien Mechanics
function spawnAlien() {
    let alien = {
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: Math.random() * 2 + 1
    };
    enemies.push(alien);
}

// Draw Aliens
function drawAliens() {
    enemies.forEach((alien, index) => {
        ctx.drawImage(alienImage, alien.x, alien.y, alien.width, alien.height);
    });
}

// Bullet-Alien Collision Detection
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((alien, aIndex) => {
            if (bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y) {
                hitSound.play();
                enemies.splice(aIndex, 1);
                bullets.splice(bIndex, 1);
                score += 10;
            }
        });
    });
}

// Enemy movement
function moveEnemies() {
    enemies.forEach(alien => {
        alien.y += alien.speed;
    });
}

// Game Over Check
function checkGameOver() {
    enemies.forEach(alien => {
        if (alien.y + alien.height > ship.y && !gameOver) {
            gameOver = true;
            ctx.fillStyle = 'red';
            ctx.font = '30px Arial';
            ctx.fillText('GAME OVER!', canvas.width / 2 - 90, canvas.height / 2);
            ctx.fillText('Score: ' + score, canvas.width / 2 - 50, canvas.height / 2 + 40);
            if (score > highScore) {
                localStorage.setItem('highScore', score);
            }
            ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 70, canvas.height / 2 + 80);
        }
    });
}

// Draw Score
function drawScore() {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.fillText('High Score: ' + highScore, canvas.width - 160, 30);
}

// Draw Background
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Update Game State
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

// Create new aliens and start game loop
function startGame() {
    setInterval(spawnAlien, 1000);  // Spawn enemies every second
    backgroundMusic.play();
    gameLoop();
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    update();
    requestAnimationFrame(gameLoop); // Keep the loop running
}

// Control Ship Movement
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') rightKey = true;
    if (e.code === 'ArrowLeft') leftKey = true;
    if (e.code === 'ArrowUp') ship.dy = -ship.speed;
    if (e.code === 'ArrowDown') ship.dy = ship.speed;
    if (e.code === 'Space') {
        if (!spaceKey) {
            shootBullet();
            spaceKey = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') rightKey = false;
    if (e.code === 'ArrowLeft') leftKey = false;
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') ship.dy = 0;
    if (e.code === 'Space') spaceKey = false;
});