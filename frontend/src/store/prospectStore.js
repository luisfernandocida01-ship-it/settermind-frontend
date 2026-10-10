// frontend/src/store/prospectStore.js
import { create } from 'zustand';

export const useProspectStore = create((set) => ({
  // Estado inicial
  foundPosts: [],
  error: null,
  isLoading: false,

  // Acciones para modificar el estado
  setFoundPosts: (posts) => set({ foundPosts: posts, error: null }),
  setError: (errorMessage) => set({ error: errorMessage, foundPosts: [] }),
  setIsLoading: (loadingState) => set({ isLoading: loadingState }),
  clearResults: () => set({ foundPosts: [], error: null, isLoading: false }),
}));