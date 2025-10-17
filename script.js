// Touch controls for mobile
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

if (leftBtn && rightBtn) {
  // When left button is pressed and held, move paddle left
  leftBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    leftPressed = true;
  });
  leftBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    leftPressed = false;
  });
  leftBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    leftPressed = true;
  });
  leftBtn.addEventListener('mouseup', function(e) {
    e.preventDefault();
    leftPressed = false;
  });

  // When right button is pressed and held, move paddle right
  rightBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    rightPressed = true;
  });
  rightBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    rightPressed = false;
  });
  rightBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    rightPressed = true;
  });
  rightBtn.addEventListener('mouseup', function(e) {
    e.preventDefault();
    rightPressed = false;
  });
}
// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const scoreDisplay = document.getElementById("score");
const endMessage = document.getElementById("endMessage");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let score = 0;
let timer = 0;
let interval;
let gameOver = false;
let paused = false;

// Ball
let ballRadius = canvas.width * 0.01; // Scales with canvas size
let x = canvas.width / 2;
let y = canvas.height - canvas.height * 0.05;
let dx = canvas.width * 0.005;
let dy = -canvas.height * 0.005;

// Paddle
const paddleHeight = canvas.height * 0.02;
const paddleWidth = canvas.width * 0.20;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Bricks
const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = canvas.width * 0.13;
const brickHeight = canvas.height * 0.04;
const brickPadding = canvas.width * 0.012;
const brickOffsetTop = canvas.height * 0.10;
// Center the bricks horizontally
const totalBricksWidth = brickColumnCount * brickWidth + (brickColumnCount - 1) * brickPadding;
const brickOffsetLeft = (canvas.width - totalBricksWidth) / 2;

let bricks = [];

function initBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const bw = (typeof window.brickWidth !== 'undefined') ? window.brickWidth : brickWidth;
        const bh = (typeof window.brickHeight !== 'undefined') ? window.brickHeight : brickHeight;
        const bp = (typeof window.brickPadding !== 'undefined') ? window.brickPadding : brickPadding;
        const bo = (typeof window.brickOffsetLeft !== 'undefined') ? window.brickOffsetLeft : brickOffsetLeft;
        const bt = (typeof window.brickOffsetTop !== 'undefined') ? window.brickOffsetTop : brickOffsetTop;
        const brickX = c * (bw + bp) + bo;
        const brickY = r * (bh + bp) + bt;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, bw, bh);
        ctx.fillStyle = "#0077ff";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#00bfff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  const ph = (typeof window.paddleHeight !== 'undefined') ? window.paddleHeight : paddleHeight;
  const pw = (typeof window.paddleWidth !== 'undefined') ? window.paddleWidth : paddleWidth;
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - ph - 10, pw, ph);
  ctx.fillStyle = "#f8b500";
  ctx.fill();
  ctx.closePath();
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        const bw = (typeof window.brickWidth !== 'undefined') ? window.brickWidth : brickWidth;
        const bh = (typeof window.brickHeight !== 'undefined') ? window.brickHeight : brickHeight;
        if (
          x > b.x &&
          x < b.x + bw &&
          y > b.y &&
          y < b.y + bh
        ) {
          dy = -dy;
          b.status = 0;
          score += 5;
          scoreDisplay.textContent = score;
          if (score === brickRowCount * brickColumnCount * 5) {
            endGame(true);
          }
        }
      }
    }
  }
}

function draw() {
  if (gameOver || paused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius - 10) {
    // Use current paddle width (supports resized/mobile values)
    const currentPaddleWidth = (typeof window.paddleWidth !== 'undefined') ? window.paddleWidth : paddleWidth;
    if (x > paddleX && x < paddleX + currentPaddleWidth) {
      dy = -dy;
    } else {
      // Ball missed paddle -> game over
      endGame(false);
    }
  }

  x += dx;
  y += dy;

  // Move paddle using current paddle width and clamp to canvas edges
  const currentPaddleWidth = (typeof window.paddleWidth !== 'undefined') ? window.paddleWidth : paddleWidth;
  const moveSpeed = Math.max(4, Math.round(canvas.width * 0.005));
  if (rightPressed) {
    paddleX = Math.min(canvas.width - currentPaddleWidth, paddleX + moveSpeed);
  } else if (leftPressed) {
    paddleX = Math.max(0, paddleX - moveSpeed);
  }

  requestAnimationFrame(draw);
}
// Pause button toggles paused state
if (pauseBtn) {
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    if (paused) {
      clearInterval(interval); // Stop the timer
    } else {
      interval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = `Elapsed Time: ${timer}s`;
      }, 1000);
      draw();
    }
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  });
}

// Reset button restarts the game
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    paused = false;
    pauseBtn.textContent = "Pause";
    startGame();
  });
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = false;
  }
}

function startGame() {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  endScreen.classList.add("hidden");

  // Recalculate sizes in case canvas size changed
  // If small screen, make the internal canvas taller and scale up ball/paddle
  if (window.innerWidth <= 520) {
    // Set internal drawing buffer to match displayed CSS dimensions
    canvas.width = Math.floor(window.innerWidth * 0.96);
    canvas.height = Math.floor(window.innerHeight * 0.76);
  } else {
    // default internal canvas size
    canvas.width = 960;
    canvas.height = 600;
  }

  // recompute sizes based on current canvas size
  ballRadius = Math.max(6, canvas.width * 0.02); // slightly larger on small screens
  x = canvas.width / 2;
  y = canvas.height - canvas.height * 0.05;
  dx = canvas.width * 0.005;
  dy = -canvas.height * 0.005;

  // update paddle sizes
  // note: paddleWidth and paddleHeight were consts earlier; recreate local vars instead
  const newPaddleHeight = canvas.height * 0.03;
  const newPaddleWidth = canvas.width * 0.22;
  // assign to globals used by drawPaddle and logic
  // overwrite the previously computed paddleHeight/paddleWidth by updating drawing references
  // We'll set paddleHeight/paddleWidth as variables on window for simplicity
  window.paddleHeight = newPaddleHeight;
  window.paddleWidth = newPaddleWidth;
  paddleX = (canvas.width - newPaddleWidth) / 2;

  // Recompute brick sizes
  // These were declared as const earlier; set window-scoped replacements used by drawing
  window.brickWidth = canvas.width * 0.13;
  window.brickHeight = canvas.height * 0.04;
  window.brickPadding = canvas.width * 0.012;
  window.brickOffsetTop = canvas.height * 0.10;
  const totalBricksWidthLocal = brickColumnCount * window.brickWidth + (brickColumnCount - 1) * window.brickPadding;
  window.brickOffsetLeft = (canvas.width - totalBricksWidthLocal) / 2;

  initBricks();
  score = 0;
  scoreDisplay.textContent = 0;
  gameOver = false;
  clearInterval(interval);
  timer = 0;
  document.getElementById("timer").textContent = `Elapsed Time: 0s`;
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = `Elapsed Time: ${timer}s`;
  }, 1000);
  draw();
}

function showConfetti() {
  const confetti = document.getElementById("confetti");
  confetti.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 90 + "%";
    piece.style.top = Math.random() * 20 + "%";
    piece.style.background = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F5402C", "#F16061"][Math.floor(Math.random() * 7)];
    confetti.appendChild(piece);
  }
  setTimeout(() => { confetti.innerHTML = ""; }, 1500);
}
function endGame(win) {
  gameOver = true;
  clearInterval(interval);
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");
  endMessage.textContent = win
    ? "🎉 You Win! Clean water for all!"
    : "💧 Game Over! Try again to help more communities! 💧";
  if (win) showConfetti();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
homeBtn.addEventListener("click", () => {
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});