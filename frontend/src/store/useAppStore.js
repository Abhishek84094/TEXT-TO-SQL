import { create } from 'zustand';
import { supabase } from '../services/supabase';

export const useAppStore = create((set) => ({
    user: null,
    token: null,
    schema: null,
    history: [],
    selectedHistoryItem: null,
    theme: localStorage.getItem('theme') || 'dark',
    
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({ theme });
    },
    logout: async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        set({ user: null, token: null, schema: null, history: [], selectedHistoryItem: null });
    },
    setSchema: (schema) => set({ schema }),
    setHistory: (history) => set({ history }),
    addHistoryItem: (item) => set((state) => ({ history: [item, ...state.history] })),
    setSelectedHistoryItem: (item) => set({ selectedHistoryItem: item }),
}));
