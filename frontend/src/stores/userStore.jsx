import { create } from "zustand";

export const userStore = create((set, get) => ({

    // Сброс всех значений
    clearUser: () => set({ user: null }),
    clearProjects: () => set({ projects: [] }),

    user: null,
    private_key: "zdes_ochen_slozhni_parol",
    projects: [],
    setUser: (user) => set({ user: user }),
    getUser: () => get().user,
    isLoggedIn: () => get().user !== null,
    saveProjectsToStore: (projects) => set({ projects: projects }),
}));