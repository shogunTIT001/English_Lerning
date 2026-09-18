let vocabData = [];
let fillInPool = [];
let currentFillInWord = null;
let score = 0;
let answeredCount = 0;

// Load Vocabulary Data from JSON File
async function loadVocabData() {
  try {
    const response = await fetch('words.json');
    vocabData = await response.json();
    initFillInQuiz();
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
  }
}

// Initialize / Reset Fill-in Quiz
function initFillInQuiz() {
  if (!vocabData || vocabData.length === 0) return;
  fillInPool = [...vocabData];
  score = 0;
  answeredCount = 0;
  updateScoreBoard();
  
  const container = document.getElementById('fillInContainer');
  const finished = document.getElementById('fillInFinished');
  if (container) container.classList.remove('hidden');
  if (finished) finished.classList.add('hidden');
  
  loadNextFillInQuestion();
}

// Load Next Question
function loadNextFillInQuestion() {
  const container = document.getElementById('fillInContainer');
  const finished = document.getElementById('fillInFinished');
  const sentenceElem = document.getElementById('sentencePrompt');
  const phoneticElem = document.getElementById('thaiPhonetic');
  const translationElem = document.getElementById('thaiTranslation');
  const optionsElem = document.getElementById('fillInOptions');
  const feedbackBanner = document.getElementById('feedbackBanner');
  const nextBtn = document.getElementById('nextQuestionBtn');

  if (!container || !finished || !sentenceElem || !optionsElem) return;

  // Reset Feedback and Next Button
  if (feedbackBanner) feedbackBanner.classList.add('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');

  if (fillInPool.length === 0) {
    container.classList.add('hidden');
    finished.classList.remove('hidden');
    document.getElementById('finalScore').innerText = score;
    return;
  }

  const randomIndex = Math.floor(Math.random() * fillInPool.length);
  currentFillInWord = fillInPool[randomIndex];

  // Create blank sentence by replacing target word (case-insensitive)
  const regex = new RegExp(currentFillInWord.word, 'gi');
  const blankSentence = currentFillInWord.example.replace(regex, '_____');

  sentenceElem.innerText = `"${blankSentence}"`;
  phoneticElem.innerText = currentFillInWord.phonetic;
  translationElem.innerText = currentFillInWord.thai;

  // Generate options (1 correct + 3 distractors)
  const distractors = vocabData.filter((item) => item.word !== currentFillInWord.word);
  const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
  const options = [currentFillInWord, ...shuffledDistractors].sort(() => 0.5 - Math.random());

  optionsElem.innerHTML = '';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'p-4 border border-slate-200 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-500 font-semibold transition-all text-slate-800 shadow-sm text-lg';
    btn.innerText = opt.word;
    btn.onclick = (e) => checkFillInAnswer(e.currentTarget, opt.word === currentFillInWord.word);
    optionsElem.appendChild(btn);
  });
}

// Check Selected Answer
function checkFillInAnswer(selectedBtn, isCorrect) {
  const optionsElem = document.getElementById('fillInOptions');
  const buttons = optionsElem.querySelectorAll('button');
  const feedbackBanner = document.getElementById('feedbackBanner');
  const nextBtn = document.getElementById('nextQuestionBtn');

  buttons.forEach(btn => btn.disabled = true);
  answeredCount++;

  if (isCorrect) {
    score++;
    selectedBtn.classList.remove('bg-white', 'hover:bg-blue-50', 'hover:border-blue-500');
    selectedBtn.classList.add('bg-green-500', 'text-white', 'border-green-600');
    
    if (feedbackBanner) {
      feedbackBanner.className = 'p-4 rounded-xl text-center font-medium mb-6 bg-green-100 text-green-800 border border-green-200';



        feedbackBanner.innerText = `ถูกต้อง! 🎉 "${currentFillInWord.word}" (${currentFillInWord.thai})\nประโยคเต็ม: ${currentFillInWord.example}\n ${currentFillInWord.exampleThai ? ` แปลประโยค: ${currentFillInWord.exampleThai}` : ''}`;    }
  } else {
    selectedBtn.classList.remove('bg-white', 'hover:bg-blue-50', 'hover:border-blue-500');
    selectedBtn.classList.add('bg-red-500', 'text-white', 'border-red-600');
    
    // Highlight correct option
    buttons.forEach(btn => {
      if (btn.innerText === currentFillInWord.word) {
        btn.classList.add('bg-green-100', 'text-green-800', 'border-green-300');
      }
    });

    if (feedbackBanner) {
      feedbackBanner.className = 'p-4 rounded-xl text-center font-medium mb-6 bg-red-100 text-red-800 border border-red-200';
      feedbackBanner.innerText = `ยังไม่ถูกต้อง! คำตอบที่ถูกต้องคือ "${currentFillInWord.word}" (${currentFillInWord.thai})`;
      feedbackBanner.classList.remove('hidden');
    }
  }

  // Remove current question from pool
  fillInPool = fillInPool.filter((item) => item.word !== currentFillInWord.word);
  updateScoreBoard();

  if (nextBtn) nextBtn.classList.remove('hidden');
}

// Update Score & Progress UI
function updateScoreBoard() {
  const scoreElem = document.getElementById('scoreCount');
  const progressElem = document.getElementById('progressCount');
  if (scoreElem) scoreElem.innerText = score;
  if (progressElem) progressElem.innerText = answeredCount;
}

// Restart Quiz Action
function restartFillInQuiz() {
  initFillInQuiz();
}

// Initialize App
document.addEventListener('DOMContentLoaded', loadVocabData);