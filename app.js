const SYMBOLS = [
  { symbol: "A", count: 2, multiplier: 5 },
  { symbol: "B", count: 4, multiplier: 4 },
  { symbol: "C", count: 6, multiplier: 3 },
  { symbol: "D", count: 8, multiplier: 2 },
];

const balanceElement = document.querySelector("#balance");
const linesElement = document.querySelector("#lines");
const betElement = document.querySelector("#bet");
const spinButton = document.querySelector("#spin");
const messageElement = document.querySelector("#message");
const depositForm = document.querySelector("#deposit-form");
const depositElement = document.querySelector("#deposit");
const reelRows = [...document.querySelectorAll(".reel-row")];

let balance = 100;

const formatMoney = (amount) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const showMessage = (message, type = "") => {
  messageElement.textContent = message;
  messageElement.className = `message${type ? ` is-${type}` : ""}`;
};

const updateBalance = () => {
  balanceElement.textContent = formatMoney(balance);
};

const updateSpinButton = () => {
  spinButton.disabled = balance <= 0;
};

const spin = () => {
  const symbols = SYMBOLS.flatMap(({ symbol, count }) =>
    Array(count).fill(symbol),
  );

  return Array.from({ length: 3 }, () => {
    const reelSymbols = [...symbols];
    return Array.from({ length: 3 }, () => {
      const index = Math.floor(Math.random() * reelSymbols.length);
      return reelSymbols.splice(index, 1)[0];
    });
  });
};

const getWinnings = (rows, bet, lines) => {
  let winnings = 0;
  const winningLines = [];

  for (let row = 0; row < lines; row += 1) {
    if (rows[row].every((symbol) => symbol === rows[row][0])) {
      const payout = SYMBOLS.find(
        ({ symbol }) => symbol === rows[row][0],
      ).multiplier;
      winnings += bet * payout;
      winningLines.push(row);
    }
  }

  return { winnings, winningLines };
};

const renderReels = (rows, winningLines) => {
  reelRows.forEach((rowElement, rowIndex) => {
    rowElement.classList.toggle("is-winner", winningLines.includes(rowIndex));
    rowElement.querySelectorAll(".symbol").forEach((symbolElement, reelIndex) => {
      symbolElement.textContent = rows[rowIndex][reelIndex];
      symbolElement.className = `symbol symbol-${rows[rowIndex][reelIndex].toLowerCase()}`;
    });
  });
};

spinButton.addEventListener("click", () => {
  const lines = Number(linesElement.value);
  const bet = Number(betElement.value);
  const totalBet = bet * lines;

  if (!Number.isFinite(bet) || bet <= 0) {
    showMessage("Enter a bet greater than $0.", "error");
    betElement.focus();
    return;
  }

  if (totalBet > balance) {
    showMessage("That is more than your play money. Lower your bet or add more.", "error");
    betElement.focus();
    return;
  }

  balance -= totalBet;
  const reels = spin();
  const rows = Array.from({ length: 3 }, (_, rowIndex) =>
    reels.map((reel) => reel[rowIndex]),
  );
  const { winnings, winningLines } = getWinnings(rows, bet, lines);

  balance += winnings;
  renderReels(rows, winningLines);
  updateBalance();
  updateSpinButton();

  if (winnings > 0) {
    showMessage(`🎉 You win! You won ${formatMoney(winnings)}! 🎉`, "win");
  } else if (balance === 0) {
    showMessage("No win this time. Add more play money to keep playing.");
  } else {
    showMessage(`No win this time. You played ${formatMoney(totalBet)}.`);
  }
});

linesElement.addEventListener("change", updateSpinButton);
betElement.addEventListener("input", updateSpinButton);

depositForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = Number(depositElement.value);

  if (!Number.isInteger(amount) || amount <= 0) {
    showMessage("Enter a whole dollar amount, such as 5 or 10.", "error");
    depositElement.focus();
    return;
  }

  balance += amount;
  depositElement.value = "";
  updateBalance();
  updateSpinButton();
  showMessage(`${formatMoney(amount)} added to your play money.`);
});

updateBalance();
updateSpinButton();
