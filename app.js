const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.static('public'));

async function loadQuestions() {
  const data = await fs.readFile('questions.json', 'utf8');
  return JSON.parse(data);
}

function getRandomElements(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

app.get('/questions', async (req, res) => {
  const questions = await loadQuestions();
  const selectedQuestions = getRandomElements(questions, 20);
  const formattedQuestions = selectedQuestions.map(q => {
    const options = getRandomElements(q.incorrectAnswers, 3).concat(q.correctAnswer);
    return {
      question: q.question,
      options: getRandomElements(options, 4), // Shuffle options
      correctAnswer: q.correctAnswer
    };
  });
  res.json(formattedQuestions);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
