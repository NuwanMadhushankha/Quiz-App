// api/index.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));  // Serve public/ correctly

const questionsData = require('../questions.json');  // Load synchronously

function getRandomElements(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

app.get('/questions', (req, res) => {
  try {
    const questions = questionsData;
    const selectedQuestions = getRandomElements(questions, Math.min(questions.length, 20));
    const formattedQuestions = selectedQuestions.map(q => {
      const options = getRandomElements(q.incorrectAnswers, 3).concat(q.correctAnswer);
      return {
        question: q.question,
        options: getRandomElements(options, 4), // Shuffle options
        correctAnswer: q.correctAnswer
      };
    });
    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error loading questions:', error);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;