let vocabData = [];
let currentCardIndex = 0;
let quizPool = [];
let answeredWords = [];
let currentQuizWord = null;

// Load Vocabulary Data from JSON File
async function loadVocabData() {
  try {
    const response = await fetch('words.json');
    vocabData = await response.json();
    renderTable(vocabData);
    initQuiz();
    updateFlashcard();
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
  }
}

// Render Vocabulary Table
function renderTable(data) {
  const tbody = document.getElementById('vocabTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach((item) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-50 transition-colors';
    row.innerHTML = `
      <td class="p-4 font-bold text-slate-900">${item.word}</td>
      <td class="p-4"><span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">${item.pos}</span></td>
      <td class="p-4 text-slate-500">${item.phonetic}</td>
      <td class="p-4 text-slate-800 font-medium">${item.thai}</td>
      <td class="p-4 text-slate-600 italic text-sm">${item.example}</td>
    `;
    tbody.appendChild(row);
  });
}

// Update Interactive Flashcard Display
function updateFlashcard() {
  if (vocabData.length === 0) return;
  const item = vocabData[currentCardIndex];
  document.getElementById('cardWord').innerText = item.word;
  document.getElementById('cardPos').innerText = item.pos;
  document.getElementById('cardPhonetic').innerText = item.phonetic;
  document.getElementById('cardTranslation').innerText = item.thai;
  document.getElementById('cardExample').innerText = `"${item.example}"`;
  document.getElementById('flashcard').classList.remove('rotate-y-180');
}

// Flip Card Action
function flipCard() {
  document.getElementById('flashcard').classList.toggle('rotate-y-180');
}

// Next Flashcard Action
function nextCard() {
  if (vocabData.length === 0) return;
  currentCardIndex = (currentCardIndex + 1) % vocabData.length;
  updateFlashcard();
}

// Previous Flashcard Action
function prevCard() {
  if (vocabData.length === 0) return;
  currentCardIndex = (currentCardIndex - 1 + vocabData.length) % vocabData.length;
  updateFlashcard();
}

// Search and Filter Functionality
function filterVocab() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const level = document.getElementById('levelFilter').value;
  const category = document.getElementById('categoryFilter').value;
  const filtered = vocabData.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(search) || item.thai.includes(search);
    const matchesLevel = level === 'all' || item.level === level;
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesLevel && matchesCategory;
  });
  renderTable(filtered);
}

// Quick Quiz Functionality
function initQuiz() {
  if (!vocabData || vocabData.length === 0) return;
  quizPool = [...vocabData];
  answeredWords = [];
  const quizFinished = document.getElementById('quizFinished');
  if (quizFinished) quizFinished.classList.add('hidden');
  updateAnsweredUI();
  loadNextQuestion();
}

function loadNextQuestion() {
  const quizContainer = document.getElementById('quizContainer');
  const quizFinished = document.getElementById('quizFinished');
  const questionElem = document.getElementById('quizQuestion');
  const optionsElem = document.getElementById('quizOptions');
  if (!quizContainer || !quizFinished || !questionElem || !optionsElem) return;
  if (quizPool.length === 0) {
    quizContainer.classList.add('hidden');
    quizFinished.classList.remove('hidden');
    return;
  }
  quizContainer.classList.remove('hidden');
  quizFinished.classList.add('hidden');
  const randomIndex = Math.floor(Math.random() * quizPool.length);
  currentQuizWord = quizPool[randomIndex];
  questionElem.innerText = `คำว่า "${currentQuizWord.word}" มีความหมายตรงกับข้อใด?`;
  const distractors = vocabData.filter((item) => item.word !== currentQuizWord.word);
  const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
  const options = [currentQuizWord, ...shuffledDistractors].sort(() => 0.5 - Math.random());
  optionsElem.innerHTML = '';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'p-4 border border-slate-200 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-500 font-medium transition-all text-slate-800 shadow-sm';
    btn.innerText = opt.thai;
    btn.onclick = (e) => checkAnswer(e.currentTarget, opt.word === currentQuizWord.word);
    optionsElem.appendChild(btn);
  });
}

function checkAnswer(selectedOpt, isCorrect) {
  const optionsElem = document.getElementById('quizOptions');
  const buttons = optionsElem.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);
  if (isCorrect) {
    selectedOpt.classList.remove('bg-white', 'hover:bg-blue-50', 'hover:border-blue-500');
    selectedOpt.classList.add('bg-green-500', 'text-white', 'border-green-600');
    answeredWords.push(currentQuizWord);
    quizPool = quizPool.filter((item) => item.word !== currentQuizWord.word);
    updateAnsweredUI();
    setTimeout(() => {
      loadNextQuestion();
    }, 1000);
  } else {
    selectedOpt.classList.remove('bg-white', 'hover:bg-blue-50', 'hover:border-blue-500');
    selectedOpt.classList.add('bg-red-500', 'text-white', 'border-red-600');
    setTimeout(() => {
      loadNextQuestion();
    }, 1000);
  }
}

function updateAnsweredUI() {
  const countElem = document.getElementById('answeredCount');
  const listElem = document.getElementById('answeredList');
  if (!countElem || !listElem) return;
  countElem.innerText = answeredWords.length;
  if (answeredWords.length === 0) {
    listElem.innerHTML = '<span class="text-xs text-slate-400 italic">ยังไม่มีคำศัพท์ที่ตอบแล้ว</span>';
    return;
  }
  listElem.innerHTML = '';
  answeredWords.forEach((item) => {
    const tag = document.createElement('span');
    tag.className = 'px-2.5 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium border border-green-200';
    tag.innerText = `${item.word} (${item.thai})`;
    listElem.appendChild(tag);
  });
}

function restartQuiz() {
  initQuiz();
}

// Initialize App
document.addEventListener('DOMContentLoaded', loadVocabData);