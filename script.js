const wordDisplay = document.getElementById("word-display");
const wordInput = document.getElementById("word-input");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const restartBtn = document.getElementById("restart-btn");
const recordList = document.getElementById("record-list");

let currentWord = "";
let score = 0;
let timeLeft = 60;
let timer;

// 無限単語を取得するためのAPI URL
const API_URL = "https://api.datamuse.com/words?ml=game&max=100";
let wordPool = [];

// ローカルストレージから記録を読み込む
function loadRecords() {
  const records = JSON.parse(localStorage.getItem("typingGameRecords")) || [];
  recordList.innerHTML = records.map(record => `<li>${record}</li>`).join("");
}

// 記録を保存する
function saveRecord() {
  const records = JSON.parse(localStorage.getItem("typingGameRecords")) || [];
  const newRecord = `Score: ${score}, Time: ${new Date().toLocaleString()}`;
  records.push(newRecord);
  localStorage.setItem("typingGameRecords", JSON.stringify(records));
}

// Datamuse APIで単語を取得
async function fetchWords() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    wordPool = data.map((wordObj) => wordObj.word);
  } catch (error) {
    console.error("Error fetching words:", error);
    wordPool = ["default", "fallback", "words", "typing", "example"];
  }
}

// ランダムな単語を生成
async function generateWord() {
  if (wordPool.length === 0) {
    await fetchWords();
  }
  currentWord = wordPool[Math.floor(Math.random() * wordPool.length)];
  wordDisplay.textContent = currentWord;
  gsap.fromTo(wordDisplay, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5 });
}

// ゲームを開始
function startGame() {
  score = 0;
  timeLeft = 60;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  wordInput.value = "";
  wordInput.disabled = false;
  restartBtn.classList.add("hidden");

  // 最初の単語生成
  generateWord();

  // タイマー開始
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
    } else {
      endGame();
    }
  }, 1000);
}

// ユーザー入力を判定
wordInput.addEventListener("input", () => {
  if (wordInput.value === currentWord) {
    score++;
    scoreDisplay.textContent = score;
    wordInput.value = "";
    generateWord();
  }
});

// ゲームを終了
function endGame() {
  clearInterval(timer);
  wordInput.disabled = true;
  restartBtn.classList.remove("hidden");
  wordDisplay.textContent = "Game Over!";
  gsap.to(wordDisplay, { scale: 1.2, duration: 1 });

  // 記録を保存
  saveRecord();
  loadRecords();
}

// ゲームを再スタート
restartBtn.addEventListener("click", startGame);

// 初期化処理
async function init() {
  await fetchWords(); // 単語プールを初期化
  loadRecords(); // 記録を読み込み
  startGame(); // ゲーム開始
}

init();
