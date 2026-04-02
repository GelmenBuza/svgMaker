import { create } from "zustand";

export const userStore = create((set, get) => ({
    user: null,
    setUser: (user) => set({ user: user }),
    getUser: () => get().user,
    clearUser: () => set({ user: null }),
    isLoggedIn: () => get().user !== null,
}));