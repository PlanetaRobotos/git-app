// src/api.js
import axios from 'axios';

// Define the base API URL. Replace with your actual backend URL
const API_URL = 'https://giftbackend.vercel.app/progress';

// Fetch current status of all puzzles
export const getProgressStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/puzzles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching progress status:", error);
    throw error;
  }
};

// Solve a riddle to unlock a puzzle
export const solveRiddle = async (puzzleId, answer) => {
  try {
    const response = await axios.post(`${API_URL}/puzzles/solve-riddle`, {
      puzzle_id: puzzleId,
      answer: answer,
    });
    return response.data;
  } catch (error) {
    console.error("Error solving riddle:", error);
    throw error;
  }
};

// Mark a puzzle as found
export const markAsFound = async (puzzleId) => {
  try {
    const response = await axios.post(`${API_URL}/puzzles/mark-found`, {
      puzzle_id: puzzleId,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking puzzle as found:", error);
    throw error;
  }
};

// Fetch the final puzzle (accessible after all puzzles are marked as found)
export const getFinalPuzzle = async () => {
  try {
    const response = await axios.get(`${API_URL}/puzzles/final`);
    return response.data;
  } catch (error) {
    console.error("Error fetching final puzzle:", error);
    throw error;
  }
};

// Access the final prize (accessible after solving the final puzzle)
export const getPrize = async () => {
  try {
    const response = await axios.get(`${API_URL}/prize`);
    return response.data;
  } catch (error) {
    console.error("Error fetching prize:", error);
    throw error;
  }
};
