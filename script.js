// Gameboard Module (IIFE)
// Responsible ONLY for managing board data (no game logic, no UI)
const Gameboard = (() => {
  // Private board array (not accessible outside directly)
  let board = ["", "", "", "", "", "", "", "", ""];

  // Returns current state of the board
  const getBoard = () => board;

  // Places a mark ("X" or "O") at a given index
  // Returns true if move is successful, false if spot is already taken
  const placeMark = (index, mark) => {
    // Prevent overwriting an already filled cell
    if (board[index] !== "") return false;

    board[index] = mark;
    return true;
  };

  // Resets the board to initial empty state
  const reset = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  // Public methods (accessible outside)
  return { getBoard, placeMark, reset };
})();

// Factory function to create players
const Player = (name, mark) => {
  return { name, mark };
};

const GameController = (() => {
  // Create players
  let player1;
  let player2;
  const setPlayers = (name1, name2) => {
    player1 = Player(name1 || "Player 1", "X");
    player2 = Player(name2 || "Player 2", "O");
    currentPlayer = player1;
    gameOver = false;
    Gameboard.reset();
  };

  // Track current player
  let currentPlayer = null;

  let gameOver = false;

  // Switch turns
  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  // Play one round
  const playRound = (index) => {
    if (gameOver) {
      return { status: "over" };
    }

    const success = Gameboard.placeMark(index, currentPlayer.mark);

    if (!success) {
      {
        return { status: "invalid" };
      }
    }

    // Check win
    if (checkWin()) {
      gameOver = true;
      return { status: "win", winner: currentPlayer.name };
    }

    // Check tie
    if (checkTie()) {
      gameOver = true;
      return { status: "tie" };
    }

    // Switch turn
    switchPlayer();
    return { status: "continue", player: currentPlayer.name };
  };

  // Winning logic
  const checkWin = () => {
    const board = Gameboard.getBoard();

    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // cols
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ];

    return winPatterns.some((pattern) =>
      pattern.every((i) => board[i] === currentPlayer.mark),
    );
  };

  // Tie logic
  const checkTie = () => {
    return Gameboard.getBoard().every((cell) => cell !== "");
  };

  const resetGame = () => {
    Gameboard.reset();
    currentPlayer = player1;
    gameOver = false;
  };

  const getCurrentPlayer = () => currentPlayer?.name;

  return { playRound, resetGame, setPlayers, getCurrentPlayer };
})();

// Display Controller Module (IIFE)
// Responsible ONLY for handling DOM (UI rendering + user interaction)
const DisplayController = (() => {
  // Cache DOM elements (avoid querying repeatedly)
  const startBtn = document.getElementById("start");
  const player1Input = document.getElementById("player1");
  const player2Input = document.getElementById("player2");
  const boardDiv = document.getElementById("board");
  const statusDiv = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  // Render the gameboard on the UI
  const render = () => {
    boardDiv.innerHTML = ""; // Clear previous board before re-rendering

    // Loop through board state and create UI cells
    Gameboard.getBoard().forEach((cell, index) => {
      // Create a square for each cell
      const square = document.createElement("div");
      square.classList.add("cell");

      // Display "X", "O", or empty
      square.textContent = cell;

      // Add click event to allow player move
      square.addEventListener("click", () => {
        if (!GameController.getCurrentPlayer()) return;

        const result = GameController.playRound(index);

        if (!result || result.status === "invalid" || result.status === "over")
          return;

        render();

        if (result.status === "win") {
          statusDiv.textContent = `${result.winner} wins!`;
        } else if (result.status === "tie") {
          statusDiv.textContent = "It's a tie!";
        } else if (result.status === "continue") {
          statusDiv.textContent = `${result.player}'s turn`;
        }
      });

      // Add square to board container
      boardDiv.appendChild(square);
    });
  };

  startBtn.addEventListener("click", () => {
    const name1 = player1Input.value;
    const name2 = player2Input.value;

    GameController.setPlayers(name1, name2);

    render();

    statusDiv.textContent = `${name1 || "Player 1"}'s turn`;
  });

  // Restart button logic
  restartBtn.addEventListener("click", () => {
    // Reset gameboard state
    GameController.resetGame();

    // Re-render empty board
    render();
    // Clear any status message (winner/tie)
    statusDiv.textContent = `${GameController.getCurrentPlayer()}'s turn`;
  });

  // Expose render method to outside
  return { render };
})();

DisplayController.render();
