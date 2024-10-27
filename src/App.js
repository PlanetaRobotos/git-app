import React, { useState, useEffect } from 'react';
import { getProgressStatus, updateProgress } from './api'; // Adjust the path as needed
import './App.css';

function App() {
  const [puzzles, setPuzzles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current puzzle status from the backend when the component mounts
  useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await getProgressStatus();
        setPuzzles(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching puzzle progress:", error);
      }
    }
    fetchProgress();
  }, []);

  // Function to update the puzzle state
  const handleSolve = async (puzzleId) => {
    try {
      await updateProgress(puzzleId, true);

      // Update the puzzle state locally after a successful backend update
      setPuzzles((prevPuzzles) =>
        prevPuzzles.map((puzzle) =>
          puzzle.puzzle_id === puzzleId ? { ...puzzle, is_solved: true } : puzzle
        )
      );
    } catch (error) {
      console.error("Error updating puzzle:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="App">
      <h1>Progress Tracker</h1>
      <div className="puzzle-grid">
        {puzzles.map((puzzle) => (
          <div
            key={puzzle.puzzle_id}
            className={`puzzle ${puzzle.is_solved ? 'solved' : 'unsolved'}`}
          >
            <h2>{puzzle.is_solved ? puzzle.puzzle_id.charAt(0).toUpperCase() + puzzle.puzzle_id.slice(1) : 'Locked'}</h2>
            <p>{puzzle.is_solved ? `Look for a ${puzzle.puzzle_id}.` : puzzle.hint}</p>
            {!puzzle.is_solved && (
              <button onClick={() => handleSolve(puzzle.puzzle_id)}>Unlock</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
