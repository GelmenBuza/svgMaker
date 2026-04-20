import {create} from "zustand";
import { v4 as uuidv4 } from 'uuid';

export const notificationsStore = create((set, get) => ({
    // Сброс всех значений
    clearNotificationsFromStack: () => set({ stack: [] }),

    // Стек уведомлений
    stack: [],
    addNotificationToStack: (notification, type) => set((state) => ({ stack: [...state.stack, { ...notification, id: uuidv4(), type }] })),
    removeNotificationFromStack: (id) => set((state) => ({ stack: state.stack.filter((n) => n.id !== id) })),
    getNotificationsFromStack: () => get().stack,
}))