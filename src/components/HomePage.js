import React from 'react';

const HomePage = ({ startQuiz }) => (
  <div className="container">
    <h1>Welcome to the Graffiti Quiz</h1>
    <p>Find 4 hidden graffiti sketches across Prague. Solve the puzzles to unlock each clue.</p>
    <button onClick={startQuiz} className="start-button">Start Quiz</button>
  </div>
);

export default HomePage;
