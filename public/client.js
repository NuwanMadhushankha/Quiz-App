// public/client.js
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timeLeft = 600; // 10 minutes in seconds
let timerInterval;
let answered = false; // Flag to prevent multiple clicks

async function startSession() {
  const response = await fetch('/questions');
  questions = await response.json();
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 600;
  updateScore();
  updateTimer();
  document.getElementById('new-session-btn').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');
  startTimer();
  showQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      endSession();
    }
  }, 1000);
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateScore() {
  document.getElementById('score').textContent = score;
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length || timeLeft <= 0) {
    endSession();
    return;
  }
  const question = questions[currentQuestionIndex];
  document.getElementById('question').textContent = question.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  answered = false; // Reset flag for new question
  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'bg-gray-200 p-2 rounded hover:bg-gray-300';
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, question.correctAnswer, btn);
    optionsDiv.appendChild(btn);
  });
  document.getElementById('feedback').textContent = '';
}

function checkAnswer(selected, correct, selectedBtn) {
  if (answered) return; // Prevent multiple clicks
  answered = true;

  const feedback = document.getElementById('feedback');
  const allButtons = document.querySelectorAll('#options button');

  // Disable all buttons
  allButtons.forEach(btn => {
    btn.disabled = true;
    btn.onclick = null; // Remove click handler
  });

  if (selected === correct) {
    score++;
    selectedBtn.classList.remove('bg-gray-200', 'hover:bg-gray-300');
    selectedBtn.classList.add('bg-green-500', 'text-white');
    //feedback.textContent = 'Correct!';
    feedback.className = 'mt-4 text-center text-green-500';
    updateScore();
    // Wait 1 second then move to next
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  } else {
    selectedBtn.classList.remove('bg-gray-200', 'hover:bg-gray-300');
    selectedBtn.classList.add('bg-red-500', 'text-white');
    //feedback.textContent = `Wrong! The correct answer is ${correct}.`;
    feedback.className = 'mt-4 text-center text-red-500';
    // Highlight correct button green
    allButtons.forEach(btn => {
      if (btn.textContent === correct) {
        btn.classList.remove('bg-gray-200', 'hover:bg-gray-300');
        btn.classList.add('bg-green-500', 'text-white');
      }
    });
    // Wait 5 seconds then move to next
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  showQuestion();
}

function endSession() {
  clearInterval(timerInterval);
  document.getElementById('question').textContent = 'Session Ended!';
  document.getElementById('options').innerHTML = '';
  document.getElementById('feedback').textContent = `Final Score: ${score}/20`;
  document.getElementById('new-session-btn').classList.remove('hidden');
  saveSessionScore();
}

function saveSessionScore() {
  const sessions = JSON.parse(localStorage.getItem('mcqSessions') || '[]');
  sessions.push({ score, timestamp: new Date().toLocaleString() });
  localStorage.setItem('mcqSessions', JSON.stringify(sessions));
  updateSessionHistory();
}

function updateSessionHistory() {
  const sessions = JSON.parse(localStorage.getItem('mcqSessions') || '[]');
  const historyDiv = document.getElementById('session-history');
  historyDiv.innerHTML = '<h2 class="text-xl font-bold mb-2">Session History</h2>';
  sessions.forEach((session, index) => {
    historyDiv.innerHTML += `<div>Session ${index + 1} (${session.timestamp}): ${session.score}/20</div>`;
  });
}

document.getElementById('new-session-btn').onclick = startSession;
startSession();
updateSessionHistory();