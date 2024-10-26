import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HomePage from './components/HomePage';
import Puzzle from './components/Puzzle';
import FinalReveal from './components/FinalReveal';
import './App.css';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [puzzles, setPuzzles] = useState([
    { id: 'star', name: 'Star', riddle: 'What shines in the night sky?', hint: 'Look for a star.', isSolved: false },
    { id: 'hands', name: 'Hands', riddle: 'Something gold...', hint: 'Find a hand shape.', isSolved: false },
    { id: 'heart', name: 'Heart', riddle: 'A symbol of love...', hint: 'Search for a heart shape.', isSolved: false },
    { id: 'wings', name: 'Wings', riddle: 'What gives you freedom to fly?', hint: 'Look for wings.', isSolved: false },
  ]);
  const [isFinalUnlocked, setIsFinalUnlocked] = useState(false);

  const startQuiz = () => setIsStarted(true);
  const url = 'https://0201-46-135-6-87.ngrok-free.app'

  const handleSolve = async (puzzleId, answer) => {
    const correctAnswers = {
      star: "star",
      hands: "gold",
      heart: "love",
      wings: "freedom"
    };

    // Check if the answer matches
    const updatedPuzzles = puzzles.map(p => {
      if (p.id === puzzleId && answer.toLowerCase() === correctAnswers[puzzleId].toLowerCase()) {
        // Make an API call to update the puzzle progress in the database
        axios.post(`${url}/progress/update`, {
          puzzle_id: puzzleId,
          is_solved: true
        })
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error("Error updating progress:", error);
          });

        // Update state to mark as solved
        return { ...p, isSolved: true };
      }
      return p;
    });

    // Update the puzzle state
    setPuzzles(updatedPuzzles);

    // Check if all puzzles are solved for final unlock
    setIsFinalUnlocked(updatedPuzzles.every(p => p.isSolved));
  };

  useEffect(() => {
    // Fetch current progress from the backend
    axios.get(`${url}/progress/status`)
      .then(response => {
        const dbProgress = response.data;

        // Update puzzle state based on database progress
        const updatedPuzzles = puzzles.map(puzzle => {
          const dbEntry = dbProgress.find(item => item.puzzle_id === puzzle.id);
          return dbEntry ? { ...puzzle, isSolved: dbEntry.is_solved } : puzzle;
        });

        setPuzzles(updatedPuzzles);

        // Check if all puzzles are solved for final reveal
        setIsFinalUnlocked(updatedPuzzles.every(p => p.isSolved));
      })
      .catch(error => {
        console.error("Error fetching progress:", error);
      });
  }, []);

  return (
    <div className="App">
      {!isStarted ? (
        <HomePage startQuiz={startQuiz} />
      ) : (
        <div className="puzzle-grid">
          {puzzles.map(puzzle => (
            <Puzzle key={puzzle.id} puzzle={puzzle} onSolve={handleSolve} />
          ))}
          {isFinalUnlocked && <FinalReveal message="All puzzles unlocked! Here's the final clue." />}
        </div>
      )}
    </div>
  );
}

export default App;