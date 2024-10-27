import React, { useState, useEffect } from 'react';
import { getProgressStatus, solveRiddle, markAsFound, getFinalPuzzle, getPrize } from './api';
import './App.css';

function App() {
  const [puzzles, setPuzzles] = useState([]);
  const [isFinalUnlocked, setIsFinalUnlocked] = useState(false);
  const [finalPuzzle, setFinalPuzzle] = useState(null);
  const [prize, setPrize] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current puzzle status on mount
  useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await getProgressStatus();
        setPuzzles(data);
        setIsFinalUnlocked(data.every(puzzle => puzzle.is_found));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching puzzle progress:", error);
      }
    }
    fetchProgress();
  }, []);

  // Handle riddle solving to unlock puzzles
  const handleSolveRiddle = async (puzzleId, answer) => {
    try {
      await solveRiddle(puzzleId, answer);
      setPuzzles(prevPuzzles =>
        prevPuzzles.map(puzzle =>
          puzzle.puzzle_id === puzzleId ? { ...puzzle, is_unlocked: true } : puzzle
        )
      );
    } catch (error) {
      console.error("Error solving riddle:", error);
      alert("Incorrect answer or error occurred.");
    }
  };

  // Handle marking a puzzle as found
  const handleMarkAsFound = async (puzzleId) => {
    try {
      await markAsFound(puzzleId);
      const updatedPuzzles = puzzles.map(puzzle =>
        puzzle.puzzle_id === puzzleId ? { ...puzzle, is_found: true } : puzzle
      );
      setPuzzles(updatedPuzzles);
      setIsFinalUnlocked(updatedPuzzles.every(puzzle => puzzle.is_found));
    } catch (error) {
      console.error("Error marking puzzle as found:", error);
    }
  };

  // Fetch and display the final puzzle when all are found
  useEffect(() => {
    if (isFinalUnlocked && !finalPuzzle) {
      async function fetchFinalPuzzle() {
        try {
          const puzzle = await getFinalPuzzle();
          setFinalPuzzle(puzzle);
        } catch (error) {
          console.error("Error fetching final puzzle:", error);
        }
      }
      fetchFinalPuzzle();
    }
  }, [isFinalUnlocked, finalPuzzle]);

  // Fetch prize when final puzzle is solved
  const handleGetPrize = async () => {
    try {
      const prizeData = await getPrize();
      setPrize(prizeData);
    } catch (error) {
      console.error("Error fetching prize:", error);
    }
  };

  return (
    <div className="App">
      <h1>Graffiti Quiz</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="puzzles-container">
            {puzzles.map((puzzle) => (
              <div
                key={puzzle.puzzle_id}
                className={`puzzle ${puzzle.is_unlocked ? 'unlocked' : ''}`}
              >
                <h2>{puzzle.is_unlocked ? puzzle.puzzle_id : "Locked"}</h2>
                <p>{puzzle.is_unlocked ? puzzle.instructions : puzzle.hint}</p>
                {!puzzle.is_unlocked && (
                  <div>
                    <input
                      type="text"
                      placeholder="Answer riddle"
                      onBlur={(e) => handleSolveRiddle(puzzle.puzzle_id, e.target.value)}
                    />
                  </div>
                )}
                {puzzle.is_unlocked && !puzzle.is_found && (
                  <button onClick={() => handleMarkAsFound(puzzle.puzzle_id)}>
                    Mark as Found
                  </button>
                )}
                {puzzle.is_found && <p>Sketch Found!</p>}
              </div>
            ))}
          </div>

          {isFinalUnlocked && finalPuzzle && (
            <div className="final-puzzle">
              <h2>Final Puzzle</h2>
              <p>{finalPuzzle.hint}</p>
              <button onClick={handleGetPrize}>Get Prize</button>
            </div>
          )}

          {prize && (
            <div className="prize">
              <h2>Congratulations!</h2>
              <p>{prize.message}</p>
              <a href={prize.url} target="_blank" rel="noopener noreferrer">
                Download Your Prize
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

}

export default App;
