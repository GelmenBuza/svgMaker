import { create } from "zustand";

export const elementsStore = create((set, get) => ({
    selected: [],
    elements: [],
    customizableElement: null,

    toggleSelected: (id) => {
        set((state) => {
            const exists = state.selected.includes(id);
            return {
                selected: exists
                    ? state.selected.filter(item => item !== id)
                    : [...state.selected, id],
            };
        });
    },

    clearSelected: () => {
        set({selected: []});
    },

    isSelected: (id) => {
        return get().selected.includes(id);
    },

    updateElements: (fn) => set((state) => ({elements: fn(state.elements)})),

    setCustomizableElement: (id) => {

    }


}))