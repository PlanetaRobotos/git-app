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
  const [answers, setAnswers] = useState({}); // Store answers for each puzzle

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
      const answer = answers[puzzleId] || ""; // Get the answer for the specific puzzle
      await solveRiddle(puzzleId, answer);
      setPuzzles(prevPuzzles =>
        prevPuzzles.map(puzzle =>
          puzzle.puzzle_id === puzzleId ? { ...puzzle, is_unlocked: true } : puzzle
        )
      );
      setAnswers({ ...answers, [puzzleId]: "" }); // Clear answer after submission
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

  const handleAnswerChange = (puzzleId, value) => {
    setAnswers({ ...answers, [puzzleId]: value });
  };

  return (
    <div className="App">
      <h1>Artful Riddles</h1>

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
              <h6>{puzzle.is_unlocked ? puzzle.puzzle_id.toUpperCase() : "Locked"}</h6>
              <div className="hint-box">
                {puzzle.is_unlocked ? puzzle.instructions : puzzle.hint}
              </div>
              {!puzzle.is_unlocked && (
                <div>
                  <input
                    type="text"
                    placeholder="Answer riddle"
                    value={answers[puzzle.puzzle_id] || ""}
                    onChange={(e) => handleAnswerChange(puzzle.puzzle_id, e.target.value)}
                  />
                  <button onClick={() => handleSolveRiddle(puzzle.puzzle_id)}>Submit</button>
                </div>
              )}
              {puzzle.is_unlocked && !puzzle.is_found && (
                <button onClick={() => handleMarkAsFound(puzzle.puzzle_id)}>
                  Mark as Done
                </button>
              )}
              {puzzle.is_found && <p>Сheerio!</p>}
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
