// src/App.js
import React, { useState, useEffect } from 'react';
import { getProgressStatus, updateProgress } from './api';

function App() {
  const [puzzles, setPuzzles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial progress status on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProgressStatus();
        setPuzzles(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch initial progress data.");
      }
    }
    fetchData();
  }, []);

  // Handle progress update for a puzzle
  const handleSolve = async (puzzleId) => {
    try {
      await updateProgress(puzzleId, true);
      setPuzzles((prevPuzzles) =>
        prevPuzzles.map((puzzle) =>
          puzzle.puzzle_id === puzzleId ? { ...puzzle, is_solved: true } : puzzle
        )
      );
    } catch (error) {
      console.error("Failed to update progress.");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="App">
      <h1>Progress Tracker</h1>
      <ul>
        {puzzles.map((puzzle) => (
          <li key={puzzle.puzzle_id}>
            <span>{puzzle.puzzle_id}</span>:{" "}
            {puzzle.is_solved ? "Solved" : "Unsolved"}
            {!puzzle.is_solved && (
              <button onClick={() => handleSolve(puzzle.puzzle_id)}>
                Mark as Solved
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
