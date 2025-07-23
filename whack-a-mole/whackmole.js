const grid = document.getElementById('gameGrid');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const endScreen = document.getElementById('endScreen');
const finalScore = document.getElementById('finalScore');

let score = 0;
let timeLeft = 30;
let currentMole = null;
let gameInterval = null;
let moleTimer = null;
let username = "";

// Create the grid once on load
function createGrid() {
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.classList.add('hole');

    const mole = document.createElement('div');
    mole.classList.add('mole');
    mole.addEventListener('click', () => {
      if (mole.style.display === 'block') {
        score++;
        scoreDisplay.textContent = score;
        mole.style.display = 'none';
      }
    });

    hole.appendChild(mole);
    grid.appendChild(hole);
  }
}
createGrid();

// Show a random mole every interval
function showRandomMole() {
  const moles = document.querySelectorAll('.mole');
  moles.forEach(m => m.style.display = 'none');
  const index = Math.floor(Math.random() * moles.length);
  moles[index].style.display = 'block';
  currentMole = moles[index];
}

// Start game after username input
function startGame() {
  username = prompt("Enter your name to start:");
  if (!username || username.trim() === "") {
    alert("Username is required!");
    return;
  }

  localStorage.setItem("wackUsername", username);
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  startBtn.style.display = 'none';

  moleTimer = setInterval(showRandomMole, 800);
  gameInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      clearInterval(moleTimer);
      document.querySelectorAll('.mole').forEach(m => m.style.display = 'none');
      finalScore.textContent = `${score} (${username})`;
      saveScore(username, score);
      endScreen.classList.add('show');
    }
  }, 1000);
}

function saveScore(name, score) {
  const newScore = { username: name, score, time: 30 };
  let scores = JSON.parse(localStorage.getItem("wackScores")) || [];
  scores.push(newScore);
  localStorage.setItem("wackScores", JSON.stringify(scores));
  showLeaderboard();
}

function showLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("wackScores")) || [];
  const sorted = scores.sort((a, b) => b.score - a.score || a.time - b.time);
  const tbody = document.querySelector('#scoreTable tbody');
  tbody.innerHTML = "";
  sorted.slice(0, 10).forEach(score => {
    const row = `<tr><td>${score.username}</td><td>${score.score}</td><td>${score.time}</td></tr>`;
    tbody.innerHTML += row;
  });
}

showLeaderboard();
startBtn.addEventListener('click', startGame);
