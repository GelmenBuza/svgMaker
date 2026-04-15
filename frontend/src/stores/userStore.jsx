import { create } from "zustand";

export const userStore = create((set, get) => ({
    user: null,
    projects: [],
    setUser: (user) => set({ user: user }),
    getUser: () => get().user,
    clearUser: () => set({ user: null }),
    isLoggedIn: () => get().user !== null,
    saveProjectsToStore: (projects) => set({ projects: projects }),
}));