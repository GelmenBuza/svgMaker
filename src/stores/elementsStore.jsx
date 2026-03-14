import {create} from "zustand";

export const elementsStore = create((set, get) => ({
    selected: [],
    elements: [],
    areaWidth: 500,
    areaHeight: 500,
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

    updateElements: (arg1, arg2) => set((state) => {
        if (typeof arg1 === 'function') {
            return {
                elements: arg1(state.elements),
            }
        }
        const id = arg1
        const data = arg2

        const newElements = state.elements.map(el => {
            if (el.id === id) {
                const updatedEl = {...el}
                if (data.d) {
                    updatedEl.d = data.d;
                }
                if (data.rotate !== undefined) {
                    updatedEl.rotate = data.rotate;
                }
                return updatedEl;
            }
            return el;
        })
        return {elements: newElements};
    }),


    setCustomizableElement: (id) => {
        set((state) => {
            const elementExists = state.elements.some((element) => element.id === id);
            return {
                customizableElementId: elementExists ? id : null,
            }
        });
    },

    getCustomizableElement: () => {
        const state = get()
        return state.elements.find(el => el.id === state.customizableElementId);
    }

}))