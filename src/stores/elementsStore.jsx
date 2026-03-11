import {create} from "zustand";

export const elementsStore = create((set, get) => ({
    selected: [],
    elements: [],
    customizableElementId: null,

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

    updateElements: (fn) => {
        set((state) => ({elements: fn(state.elements)}))
    },

    setCustomizableElement: (id) => {
        console.log(id)
        set((state) => {
            const elementExists = state.elements.some((element) => element.props?.id === id);
            console.log(elementExists, id)
            return {
                customizableElementId: elementExists ? id : null,
            }
        });
    },

    getCustomizableElement: () => {
        const state = get()
        return state.elements.find(el => el.props?.id === state.customizableElementId);
    }

}))