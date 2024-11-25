var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    velocityX: 0,
    velocityY: 0,
    radius: 15
};

var keys = [];
var asteroids = [];
var bullets = [];
var score = 0;
var canShoot = true;
var level = 1;
var isGameOver = false; // Added to track game over state

document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

// Updated to prevent asteroids from spawning too close to the ship
function createAsteroids(level) {
    var num = level + 4; // Increase the number of asteroids with each level
    for (var i = 0; i < num; i++) {
        var asteroid = {
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 30 + Math.random() * 20
        };

        // Generate a position for the asteroid that is not too close to the ship
        var safeDistance = asteroid.radius * 2; // No closer than 1 asteroid diameter
        var isTooClose = true;

        while (isTooClose) {
            asteroid.x = Math.random() * canvas.width;
            asteroid.y = Math.random() * canvas.height;

            var dx = asteroid.x - ship.x;
            var dy = asteroid.y - ship.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= safeDistance) {
                isTooClose = false;
            }
        }

        asteroids.push(asteroid);
    }
}

// Initialize the first wave of asteroids
createAsteroids(level);

function update() {
    if (isGameOver) {
        return; // Stop updating when game is over
    }

    // Rotate ship
    if (keys[37]) {
        // Left arrow key
        ship.angle -= 0.05;
    }
    if (keys[39]) {
        // Right arrow key
        ship.angle += 0.05;
    }

    // Thrust
    if (keys[38]) {
        // Up arrow key
        ship.velocityX += Math.cos(ship.angle) * 0.1;
        ship.velocityY += Math.sin(ship.angle) * 0.1;
    }

    // Shoot
    if (keys[32]) {
        // Spacebar
        if (canShoot) {
            bullets.push({
                x: ship.x + Math.cos(ship.angle) * ship.radius,
                y: ship.y + Math.sin(ship.angle) * ship.radius,
                vx: Math.cos(ship.angle) * 5,
                vy: Math.sin(ship.angle) * 5,
                radius: 2
            });
            canShoot = false;
        }
    } else {
        canShoot = true;
    }

    // Move ship
    ship.x += ship.velocityX;
    ship.y += ship.velocityY;

    // Screen wrap
    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;

    // Move asteroids
    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i];
        a.x += a.vx;
        a.y += a.vy;

        // Screen wrap
        if (a.x < 0) a.x = canvas.width;
        if (a.x > canvas.width) a.x = 0;
        if (a.y < 0) a.y = canvas.height;
        if (a.y > canvas.height) a.y = 0;
    }

    // Move bullets
    for (var i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // Remove bullets that go off-screen
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    // Collision detection between bullets and asteroids
    for (var i = asteroids.length - 1; i >= 0; i--) {
        var a = asteroids[i];
        for (var j = bullets.length - 1; j >= 0; j--) {
            var b = bullets[j];
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < a.radius + b.radius) {
                // Collision detected
                bullets.splice(j, 1);
                asteroids.splice(i, 1);
                score += 100;
                break;
            }
        }
    }

    // Check if all asteroids are destroyed to start a new wave
    if (asteroids.length === 0) {
        level++; // Increase the level
        createAsteroids(level); // Create new asteroids for the next wave
    }

    // Collision detection between ship and asteroids
    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i];
        var dx = a.x - ship.x;
        var dy = a.y - ship.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < a.radius + ship.radius) {
            // Game over
            isGameOver = true; // Set game over state
            break;
        }
    }
}

function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

function drawAsteroids() {
    ctx.strokeStyle = 'white';
    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i];
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawBullets() {
    ctx.fillStyle = 'white';
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Level: ' + level, 10, 45); // Display current level
}

function drawGameOver() {
    ctx.fillStyle = 'white';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '30px Arial';
    ctx.fillText('Your Score: ' + score, canvas.width / 2, canvas.height / 2 + 50);
}

function gameLoop() {
    update();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawAsteroids();
    drawBullets();
    drawScore();

    if (isGameOver) {
        drawGameOver(); // Display Game Over message
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
