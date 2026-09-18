let speakingVocab = [];
let currentIndex = 0;
let recognition = null;
let isRecording = false;

// Load Vocabulary Data
async function loadSpeakingData() {
  try {
    const [res1, res2] = await Promise.all([
      fetch('words.json').then(r => r.json()).catch(() => []),
      fetch('words_set2.json').then(r => r.json()).catch(() => [])
    ]);
    speakingVocab = [...res1, ...res2];
    if (speakingVocab.length > 0) {
      document.getElementById('totalWordCount').innerText = speakingVocab.length;
      updateSpeakingCard();
    }
  } catch (err) {
    console.error('Failed to load vocabulary:', err);
  }
}

// Update Card Content
function updateSpeakingCard() {
  if (speakingVocab.length === 0) return;
  const current = speakingVocab[currentIndex];
  document.getElementById('targetWord').innerText = current.word;
  document.getElementById('targetPhonetic').innerText = current.phonetic;
  document.getElementById('targetTranslation').innerText = current.thai;
  document.getElementById('wordCategory').innerText = `${current.category || 'Vocabulary'} (${current.level || 'A1-B2'})`;
  document.getElementById('hintWord').innerText = current.word;
  document.getElementById('currentWordIndex').innerText = currentIndex + 1;

  // Reset Result Box
  const resultBox = document.getElementById('resultBox');
  resultBox.classList.add('hidden');
}

// Native Audio TTS Playback
function playNativeAudio() {
  if (speakingVocab.length === 0) return;
  const current = speakingVocab[currentIndex];
  const utterance = new SpeechSynthesisUtterance(current.word);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

// Initialize Web Speech API
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('เบราว์เซอร์ของคุณไม่รองรับระบบตรวจจับเสียงอ่าน (Web Speech API) กรุณาใช้ Google Chrome หรือ Edge');
    return false;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onstart = function() {
    isRecording = true;
    const btn = document.getElementById('recordBtn');
    btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
    btn.classList.add('bg-red-600', 'animate-pulse');
    document.getElementById('micStatus').innerText = 'กำลังฟัง...';
    document.getElementById('speechHint').innerText = 'กำลังฟังเสียงของคุณ กรุณาพูดเลย...';
  };

  recognition.onend = function() {
    isRecording = false;
    const btn = document.getElementById('recordBtn');
    btn.classList.remove('bg-red-600', 'animate-pulse');
    btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
    document.getElementById('micStatus').innerText = 'กดเพื่อพูด';
    document.getElementById('speechHint').innerHTML = `กดปุ่มแล้วพูดคำว่า "<span id="hintWord">${speakingVocab[currentIndex]?.word || ''}</span>" ชัดๆ`;
  };

  recognition.onresult = function(event) {
    const spokenText = event.results[0][0].transcript.trim().toLowerCase();
    const targetWord = speakingVocab[currentIndex].word.trim().toLowerCase();
    evaluateSpeech(spokenText, targetWord);
  };

  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
    alert('เกิดข้อผิดพลาดในการรับเสียง: ' + event.error);
  };

  return true;
}

// Toggle Recording State
function toggleRecording() {
  if (!recognition) {
    if (!initSpeechRecognition()) return;
  }
  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

// Compare Spoken Word with Target Word
function evaluateSpeech(spoken, target) {
  const resultBox = document.getElementById('resultBox');
  const scoreBadge = document.getElementById('scoreBadge');
  const recognizedText = document.getElementById('recognizedText');
  const feedbackText = document.getElementById('feedbackText');

  resultBox.classList.remove('hidden', 'bg-green-100', 'bg-amber-100', 'bg-red-100', 'border-green-300', 'border-amber-300', 'border-red-300');

  const cleanSpoken = spoken.replace(/[^\w\s]/gi, '');
  const cleanTarget = target.replace(/[^\w\s]/gi, '');

  if (cleanSpoken === cleanTarget) {
    resultBox.classList.add('bg-green-100', 'border', 'border-green-300', 'text-green-900');
    scoreBadge.innerText = '🎯 ยอดเยี่ยม! ออกเสียงถูกต้องแม่นยำ (100%)';
    recognizedText.innerText = `เสียงที่คุณพูด: "${spoken}"`;
    feedbackText.innerText = 'คุณออกเสียงคำนี้ได้ถูกต้องชัดเจนสมบูรณ์แบบ!';
  } else if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
    resultBox.classList.add('bg-amber-100', 'border', 'border-amber-300', 'text-amber-900');
    scoreBadge.innerText = '👍 ใกล้เคียงมาก!';
    recognizedText.innerText = `เสียงที่คุณพูด: "${spoken}"`;
    feedbackText.innerText = `ลองฟังเสียงเจ้าของภาษาแล้วกดพูดใหม่อีกครั้งเพื่อความเป๊ะ!`;
  } else {
    resultBox.classList.add('bg-red-100', 'border', 'border-red-300', 'text-red-900');
    scoreBadge.innerText = '❌ ยังไม่ออกเสียงตามคำนี้';
    recognizedText.innerText = `เสียงที่คุณพูด: "${spoken}"`;
    feedbackText.innerText = `คำเป้าหมายคือ "${speakingVocab[currentIndex].word}" ลองออกเสียงใหม่อีกครั้งครับ`;
  }
}

// Navigation Functions
function nextSpeakingWord() {
  if (speakingVocab.length === 0) return;
  currentIndex = (currentIndex + 1) % speakingVocab.length;
  updateSpeakingCard();
}

function prevSpeakingWord() {
  if (speakingVocab.length === 0) return;
  currentIndex = (currentIndex - 1 + speakingVocab.length) % speakingVocab.length;
  updateSpeakingCard();
}

// Initialize App
document.addEventListener('DOMContentLoaded', loadSpeakingData);