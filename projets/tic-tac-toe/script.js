const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");

let currentPlayer = "X";
let grid = Array(9).fill(null);
let iaMode = "easy"; // "easy", "hard" ou "human"

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // lignes
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // colonnes
  [0, 4, 8],
  [2, 4, 6], // diagonales
];

function checkWinner() {
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      return grid[a];
    }
  }
  if (!grid.includes(null)) return "Egalité";
  return null;
}

function updateDifficultyText() {
  const diffDiv = document.getElementById("difficulty");
  if (!diffDiv) return;
  if (iaMode === "easy") diffDiv.textContent = "Vous jouez en mode facile";
  else if (iaMode === "hard")
    diffDiv.textContent = "Vous jouez en mode difficile";
  else
    diffDiv.textContent = "Vous jouez avec un ami (enfin j'espère pour vous)";
}

function setMode(mode) {
  iaMode = mode;
  updateDifficultyText();
  if (statusText) {
    if (mode === "easy") statusText.textContent = "Mode : Balade de santé";
    else if (mode === "hard") statusText.textContent = "Mode : Roter du sang";
    else statusText.textContent = "Mode : Humain contre humain";
    setTimeout(() => {
      resetGame();
    }, 700);
  }
}

function iaPlay() {
  if (iaMode === "human") return; // Pas d'IA
  if (iaMode === "easy") {
    // IA facile : choisit une case vide au hasard
    const emptyIndices = grid
      .map((val, idx) => (val === null ? idx : null))
      .filter((idx) => idx !== null);
    if (emptyIndices.length === 0 || checkWinner()) return;
    const randomIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const cell = board.querySelector(`.cell[data-index='${randomIndex}']`);
    if (cell) {
      grid[randomIndex] = "O";
      cell.textContent = "O";
      cell.classList.add("taken");
      const winner = checkWinner();
      if (winner) {
        statusText.textContent =
          winner === "Egalité" ? "Match nul !" : `Joueur ${winner} a gagné !`;
      } else {
        currentPlayer = "X";
        statusText.textContent = `À X de jouer`;
      }
    }
  } else if (iaMode === "hard") {
    // IA difficile : Minimax
    const bestMove = getBestMove();
    if (bestMove !== null) {
      const cell = board.querySelector(`.cell[data-index='${bestMove}']`);
      if (cell) {
        grid[bestMove] = "O";
        cell.textContent = "O";
        cell.classList.add("taken");
        const winner = checkWinner();
        if (winner) {
          statusText.textContent =
            winner === "Egalité" ? "Match nul !" : `Joueur ${winner} a gagné !`;
        } else {
          currentPlayer = "X";
          statusText.textContent = `À X de jouer`;
        }
      }
    }
  }
}

function getBestMove() {
  // Minimax pour O (l'IA)
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < 9; i++) {
    if (grid[i] === null) {
      grid[i] = "O";
      let score = minimax(grid, 0, false);
      grid[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newGrid, depth, isMaximizing) {
  const winner = checkWinnerMinimax(newGrid);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (winner === "Egalité") return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newGrid[i] === null) {
        newGrid[i] = "O";
        let score = minimax(newGrid, depth + 1, false);
        newGrid[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newGrid[i] === null) {
        newGrid[i] = "X";
        let score = minimax(newGrid, depth + 1, true);
        newGrid[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinnerMinimax(testGrid) {
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (
      testGrid[a] &&
      testGrid[a] === testGrid[b] &&
      testGrid[a] === testGrid[c]
    ) {
      return testGrid[a];
    }
  }
  if (!testGrid.includes(null)) return "Egalité";
  return null;
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (grid[index] || checkWinner()) return;
  if (iaMode !== "human" && currentPlayer !== "X") return;

  grid[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add("taken");

  const winner = checkWinner();
  if (!statusText) return;
  if (winner) {
    statusText.textContent =
      winner === "Egalité" ? "Match nul !" : `Joueur ${winner} a gagné !`;
  } else {
    if (iaMode === "human") {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      statusText.textContent = `À ${currentPlayer} de jouer`;
    } else {
      currentPlayer = "O";
      statusText.textContent = `À O de jouer`;
      setTimeout(() => {
        iaPlay();
      }, 500);
    }
  }
}

function resetGame() {
  grid = Array(9).fill(null);
  currentPlayer = "X";
  if (!statusText) return;
  statusText.textContent = "Joueur X commence";
  board.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken");
  });
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  }
}

resetBtn.addEventListener("click", resetGame);
document
  .getElementById("easy")
  .addEventListener("click", () => setMode("easy"));
document
  .getElementById("hard")
  .addEventListener("click", () => setMode("hard"));
document
  .getElementById("human")
  .addEventListener("click", () => setMode("human"));

window.addEventListener("DOMContentLoaded", updateDifficultyText);

createBoard();
