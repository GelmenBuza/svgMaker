import {create} from "zustand";
import { v4 as uuidv4 } from 'uuid';

export const notificationsStore = create((set, get) => ({
    
    // Стек уведомлений
    stack: [],
    addNotificationToStack: (notification, type) => set((state) => ({ stack: [...state.stack, { ...notification, id: uuidv4(), type }] })),
    removeNotificationFromStack: (id) => set((state) => ({ stack: state.stack.filter((n) => n.id !== id) })),
    clearNotificationsFromStack: () => set({ stack: [] }),
    getNotificationsFromStack: () => get().stack,
}))