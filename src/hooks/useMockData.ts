import { initialLabor, initialMaterials, initialTasks, initialInvoices } from '../data/mockData';

// In a real application, this would be controlled by environment variables
// (e.g., import.meta.env.DEV in Vite or process.env.NODE_ENV in Webpack/CRA).
// For this environment, we simulate it based on hostname to enable local development.
const USE_MOCK_DATA = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');

export const useMockData = () => {
  if (USE_MOCK_DATA) {
    // In development, return the mock data.
    return { initialLabor, initialMaterials, initialTasks, initialInvoices };
  }
  
  // In production, return empty arrays. The app should be connected to a real backend.
  return {
    initialLabor: [],
    initialMaterials: [],
    initialTasks: [],
    initialInvoices: [],
  };
};
