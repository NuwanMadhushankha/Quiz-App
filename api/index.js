const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));  // Serve public/ correctly

let questionsData;
try {
  const filePath = path.join(__dirname, '..', 'questions.json');  // Explicit relative path
  console.log('Attempting to load questions.json from:', filePath);
  questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('Successfully loaded questions.json with', questionsData.length, 'questions');
} catch (error) {
  console.error('Failed to load questions.json:', error.message);
  questionsData = [];  // Fallback to avoid crash
}

function getRandomElements(arr, n) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

app.get('/questions', (req, res) => {
  try {
    const questions = questionsData;
    if (questions.length === 0) {
      throw new Error('No questions loaded');
    }
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
    console.error('Error in /questions:', error.message);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;