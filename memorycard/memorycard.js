const gameBoard = document.getElementById('gameBoard');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');
const winMessage = document.getElementById('winMessage');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');

let username = "";
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let timer = 0;
let timerInterval;

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const cardData = [...emojis, ...emojis];

function askUsername() {
  username = prompt("Enter your name to start:");
  if (!username || username.trim() === "") {
    alert("Username is required!");
    askUsername(); // Ask again if empty
  } else {
    localStorage.setItem("currentUsername", username);
  }
}

startBtn.addEventListener('click', ()=>{
    askUsername();
});

function createCards() {
  // Shuffle cards
  for (let i = cardData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
  }

  gameBoard.innerHTML = '';
  cardData.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-face card-front">${emoji}</div>
      <div class="card-face card-back"></div>
    `;

    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });

  cards = document.querySelectorAll('.card');
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flipped');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    startTimer();
    return;
  }

  secondCard = this;
  moves++;
  movesDisplay.textContent = moves;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();
  checkWin();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function startTimer() {
  if (timer === 0) {
    timerInterval = setInterval(() => {
      timer++;
      timerDisplay.textContent = timer;
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
}

function checkWin() {
  const flippedCards = document.querySelectorAll('.flipped');
  if (flippedCards.length === cardData.length) {
    stopTimer();
    finalMoves.textContent = moves;
    finalTime.textContent = timer;
    winMessage.classList.add('show');

    // Save score to local storage
    const newScore = { username, moves, time: timer };
    let scores = JSON.parse(localStorage.getItem('memoryGameScores')) || [];
    scores.push(newScore);
    localStorage.setItem('memoryGameScores', JSON.stringify(scores));
    showLeaderboard();
  }
}

function showLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('memoryGameScores')) || [];
  const sorted = scores.sort((a, b) => a.moves - b.moves || a.time - b.time);
  const tbody = document.querySelector('#scoreTable tbody');
  tbody.innerHTML = "";
  sorted.slice(0, 10).forEach(score => {
    const row = `<tr><td>👑Ashwin👑</td><td>11</td><td>19</td></tr><tr><td>${score.username}</td><td>${score.moves}</td><td>${score.time}</td></tr>`;
    tbody.innerHTML += row;
  });
}

function resetGame() {
  stopTimer();
  moves = 0;
  timer = 0;
  movesDisplay.textContent = '0';
  timerDisplay.textContent = '0';
  winMessage.classList.remove('show');
  createCards();
  showLeaderboard();
}

restartBtn.addEventListener('click', resetGame);

// Init
// askUsername();
createCards();
showLeaderboard();
