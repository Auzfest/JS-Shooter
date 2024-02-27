const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
var windowWidth = window.innerWidth;
var canvasWidth = Math.floor(0.70 * windowWidth);
canvas.width = canvasWidth;

var canvasHeight = Math.floor((canvasWidth / 1200) * 800);
canvas.height = canvasHeight;

let gameOver = false;
let gamePaused = false;
let score = 0;

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: canvasWidth * .05,
    speed: 5
};

// Gun object
const gun = {
    width: canvasWidth * 0.01,
    length: canvasWidth * 0.03,
    angle: 0
};

// Bullet object
const bullets = [];

// Enemy object
class Enemy {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = canvasWidth * 0.05;
        this.speed = 0.75;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    moveTowardsPlayer() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speedX = (dx / distance) * this.speed;
        const speedY = (dy / distance) * this.speed;
        this.x += speedX;
        this.y += speedY;
    }
}

// Array to store enemies
const enemies = [];

// Mouse event to rotate gun
canvas.addEventListener("mousemove", event => {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    gun.angle = Math.atan2(dy, dx);
});

// Mouse event to shoot
canvas.addEventListener("mousedown", event => {
    if (event.button === 0) {
        const bulletSpeed = 10; // Set bullet speed
        const bulletDirectionX = Math.cos(gun.angle); // Calculate x component of bullet direction
        const bulletDirectionY = Math.sin(gun.angle); // Calculate y component of bullet direction
        const newBullet = {
            size: canvasWidth * 0.005, // Define size property
            speed: bulletSpeed, // Define speed property
            directionX: bulletDirectionX, // Store x component of bullet direction
            directionY: bulletDirectionY, // Store y component of bullet direction
            x: player.x,
            y: player.y,
            isVisible: true
        };
        bullets.push(newBullet); // Add new bullet to the array
    }
});
// Keyboard event listeners
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

function keyDownHandler(event) {
    if (event.key === 'a' || event.key === 'A') {
        leftPressed = true;
    } else if (event.key === 'd' || event.key === 'D') {
        rightPressed = true;
    } else if (event.key === 'w' || event.key === 'W') {
        upPressed = true;
    } else if (event.key === 's' || event.key === 'S') {
        downPressed = true;
    }
}

function keyUpHandler(event) {
    if (event.key === 'a' || event.key === 'A') {
        leftPressed = false;
    } else if (event.key === 'd' || event.key === 'D') {
        rightPressed = false;
    } else if (event.key === 'w' || event.key === 'W') {
        upPressed = false;
    } else if (event.key === 's' || event.key === 'S') {
        downPressed = false;
    }
}

function handleTouch(button, pressAction, releaseAction) {
    button.addEventListener('touchstart', () => {
        pressAction();
    });
    button.addEventListener('touchend', () => {
        releaseAction();
    });
}

// Event listeners for directional buttons
handleTouch(document.querySelector('.up'), () => {
    upPressed = true;
}, () => {
    upPressed = false;
});

handleTouch(document.querySelector('.down'), () => {
    downPressed = true;
}, () => {
    downPressed = false;
});

handleTouch(document.querySelector('.left'), () => {
    leftPressed = true;
}, () => {
    leftPressed = false;
});

handleTouch(document.querySelector('.right'), () => {
    rightPressed = true;
}, () => {
    rightPressed = false;
});

// Function to check collision between player and enemies
function checkPlayerEnemyCollision() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.size / 2 + enemy.size / 2) {
            gameOver = true;
        }
    });
}

// Update game objects
function update() {
    if (!gameOver) {
        // Update player position
        if (leftPressed && player.x > player.size / 2) {
            player.x -= player.speed;
        } else if (rightPressed && player.x < canvas.width - player.size / 2) {
            player.x += player.speed;
        }
        if (upPressed && player.y > player.size / 2) {
            player.y -= player.speed;
        } else if (downPressed && player.y < canvas.height - player.size / 2) {
            player.y += player.speed;
        }

        // Update bullet positions and check visibility
        bullets.forEach((bullet, index) => {
            if (bullet.isVisible) {
                bullet.x += bullet.directionX * bullet.speed;
                bullet.y += bullet.directionY * bullet.speed;
                if (
                    bullet.x < 0 ||
                    bullet.x > canvas.width ||
                    bullet.y < 0 ||
                    bullet.y > canvas.height
                ) {
                    bullets.splice(index, 1); // Remove bullet if out of canvas
                }
            }
        });


        // Update enemies
        enemies.forEach(enemy => {
            enemy.moveTowardsPlayer();
        });



        // Check bullet-enemy collision
        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.isVisible) {
                    const dx = bullet.x - enemy.x;
                    const dy = bullet.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < bullet.size / 2 + enemy.size / 2) {
                        enemies.splice(enemyIndex, 1);
                        bullets.splice(bulletIndex, 1);
                        score += 10;
                    }
                }
            });
        });

        // Check collision between player and enemies
        checkPlayerEnemyCollision();
    }
    else {
        // Game over logic
        handleGameOver();
    }
}

// Function to handle game over
function handleGameOver() {
    // Render game over menu
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 100% Arial";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

// Event listener for restart button
const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", () => {
    // Reset game state
    gameOver = false;
    score = 0;
    enemies.length = 0; // Clear enemies array
    resetPlayerPosition(); // Reset player position
    // Restart game loop
    gameLoop();
});

function resetPlayerPosition() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}

// Function to handle game pause
function handleGamePause() {
    // Render pause menu
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 100% Arial";
    ctx.fillText("Game Paused", canvas.width / 2, canvas.height / 2);
}

// Event listener for pause button
const pauseButton = document.getElementById("pauseButton");
pauseButton.addEventListener("click", () => {
    gamePaused = !gamePaused; // Toggle pause state
    if (!gamePaused) {
        // If game is resumed, restart the game loop
        gameLoop();
    }
});

// Render game objects
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bullets.forEach(bullet => {
        if (bullet.isVisible) {
            ctx.fillStyle = "#39FF14";
            ctx.fillRect(bullet.x - bullet.size / 2, bullet.y - bullet.size / 2, bullet.size, bullet.size);
        }
    });

    // Draw player
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);

    // Draw gun
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(gun.angle);
    ctx.fillStyle = "black";
    ctx.fillRect(player.size / 2, -gun.width / 2, gun.length, gun.width);
    ctx.restore();

    // Draw enemies and update their position
    enemies.forEach(enemy => {
        enemy.draw();
        enemy.moveTowardsPlayer();
    });

    drawScore();
}

// Function to draw the score
function drawScore() {
    
    // Set font style
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';

    // Align text to the top right corner
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    // Draw the score
    ctx.fillText('Score: ' + score, canvas.width - 10, 10);
}

// Function to generate random integer
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let currInterval = 5000;
let spawnInterval = 8000;
let enemySpawnCount = 3; 

// Function to handle enemy spawning at intervals
function startEnemySpawning() {
    spawnInterval += 10
    if (spawnInterval >= currInterval)
    {
        let counter = 0;
        while (counter < enemySpawnCount)
        {
            spawnEnemy();
            counter += 1;
        }
        counter = 0;
        spawnInterval = 0;
    }

}

function updateCurrent() {
    currInterval -= 500;
    enemySpawnCount += 2;
}

setInterval(updateCurrent, 60 * 1000); // 1 minute
setInterval(updateCurrent, 5 * 60 * 1000); // 5 minutes
setInterval(updateCurrent, 10 * 60 * 1000); // 10 minutes
setInterval(updateCurrent, 15 * 60 * 1000); // 15 minutes

// Function to spawn enemies at random edges
function spawnEnemy() {
    const side = randomInt(1, 4); // 1: top, 2: right, 3: bottom, 4: left
    let x, y;
    switch (side) {
        case 1: // Top
            x = randomInt(0, canvas.width);
            y = -50;
            break;
        case 2: // Right
            x = canvas.width + 50;
            y = randomInt(0, canvas.height);
            break;
        case 3: // Bottom
            x = randomInt(0, canvas.width);
            y = canvas.height + 50;
            break;
        case 4: // Left
            x = -50;
            y = randomInt(0, canvas.height);
            break;
    }
    const enemy = new Enemy(x, y, 50, 0.5); // Adjust size and speed as needed
    enemies.push(enemy); // Add the enemy to the array}
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver && !gamePaused) {
        update();
        render();
        startEnemySpawning();
        requestAnimationFrame(gameLoop);
    } else if (gamePaused) {
        // Handle game pause state
        handleGamePause();
    } else {
        // Handle game over state
        handleGameOver();
    }
}

// Start the game loop
gameLoop();