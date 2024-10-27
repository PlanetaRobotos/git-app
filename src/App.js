import React, { useState, useEffect } from 'react';
import { getProgressStatus, solveRiddle, markAsFound, getFinalPuzzle, getPrizeWithPassword } from './api';
import './App.css';
import ErrorMessage from './ErrorMessage';

function App() {
  const [puzzles, setPuzzles] = useState([]);
  const [isFinalUnlocked, setIsFinalUnlocked] = useState(false);
  const [finalInstructions, setFinalInstructions] = useState(null);
  const [prize, setPrize] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message) => {
    setErrorMessage(''); // Clear temporarily to force repaint
    setTimeout(() => {
      setErrorMessage(message);
    }, 50); // Small delay to re-trigger rendering

    // Clear error message after 5 seconds
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  // Fetch current puzzle status on mount, excluding the final puzzle
  useEffect(() => {
    async function fetchProgress() {
      try {
        const data = await getProgressStatus();
        const mainPuzzles = data.filter(puzzle => puzzle.puzzle_id !== "final");
        setPuzzles(mainPuzzles);
        setIsFinalUnlocked(mainPuzzles.every(puzzle => puzzle.is_found));
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
      setErrorMessage('');
    } catch (error) {
      console.error("Error solving riddle:", error);
      showError("Incorrect answer or error occurred."); // Show error message
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

  useEffect(() => {
    if (isFinalUnlocked && !finalInstructions) {
      async function fetchFinalInstructions() {
        try {
          const instructions = await getFinalPuzzle();
          setFinalInstructions(instructions);
        } catch (error) {
          console.error("Error fetching final instructions:", error);
        }
      }
      fetchFinalInstructions();
    }
  }, [isFinalUnlocked, finalInstructions]);

  const handleGetPrize = async () => {
    try {
      const prizeData = await getPrizeWithPassword(password);
      setPrize(prizeData);
      setErrorMessage(''); // Clear any previous errors
    } catch (error) {
      showError("Incorrect password."); // Show error message
    }
  };

  const clearError = () => setErrorMessage('');

  return (
    <div className="App">
      <h1>Graffiti Quiz</h1>

      {/* Render ErrorMessage Component */}
      <ErrorMessage message={errorMessage} onClose={clearError} />

      {isLoading ? (
        <p>Loading...</p>
      ) : isFinalUnlocked ? (
        finalInstructions && (
          <div className="final-puzzle">
            <h2>Final Instructions</h2>
            <p>{finalInstructions.hint}</p>
            <input
              type="text"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleGetPrize}>Get Prize</button>
          </div>
        )
      ) : (
        <div className="puzzles-container">
          {puzzles.map((puzzle) => (
            <div key={puzzle.puzzle_id} className={`puzzle ${puzzle.is_unlocked ? 'unlocked' : ''}`}>
              <h5>{puzzle.is_unlocked ? puzzle.puzzle_id : "Locked"}</h5>
              <p className="hint-text">{puzzle.is_unlocked ? puzzle.instructions : puzzle.hint}</p>
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
  );
}

export default App;
