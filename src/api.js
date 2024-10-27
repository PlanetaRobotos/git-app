// src/api.js
import axios from 'axios';

const API_URL = 'https://giftbackend.vercel.app/progress';

export const getProgressStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching progress status:", error);
    throw error;
  }
};

export const updateProgress = async (puzzleId, isSolved) => {
  try {
    const response = await axios.post(`${API_URL}/update`, {
      puzzle_id: puzzleId,
      is_solved: isSolved,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};
