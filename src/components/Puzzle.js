import React, { useState } from 'react';

const Puzzle = ({ puzzle, onSolve }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSolve(puzzle.id, answer);
  };

  return (
    <div className={`puzzle ${puzzle.isSolved ? 'solved' : 'locked'}`}>
      <h2>{puzzle.isSolved ? puzzle.name : "Locked"}</h2>
      {puzzle.isSolved ? (
        <p>{puzzle.hint}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>{puzzle.riddle}</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
          />
          <button type="submit">Unlock</button>
        </form>
      )}
    </div>
  );
};

export default Puzzle;
