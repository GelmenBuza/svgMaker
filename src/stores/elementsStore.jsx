import {create} from "zustand";
import parsePathData from "../utils/parsePathData.js";
import pointsArrToString from "../utils/pointsArrToString.js";

export const elementsStore = create((set, get) => ({
    selected: [],
    elements: [], // { id, type, points: [...], fill, stroke, strokeWidth, rotate }
    areaWidth: 500,
    areaHeight: 500,
    customizableElementId: null,
    elementRotation: {},

    setElementRotation: (id, angle) => {
        set((state) => ({
            elementRotation: {
                ...state.elementRotation,
                [id]: angle
            }
        }));
    },

    getElementRotation: (id) => {
        return get().elementRotation[id] || 0;
    },

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

    clearSelected: () => set({selected: []}),

    isSelected: (id) => get().selected.includes(id),

    updateElements: (arg1, arg2) => set((state) => {
        if (typeof arg1 === 'function') {
            return {elements: arg1(state.elements)};
        }

        const id = arg1;
        const data = arg2;
        const newElements = state.elements.map(el => {
            if (el.id !== id) return el;

            const updatedEl = {...el}
            if (data.points) {
                updatedEl.points = data.points;
                updatedEl.d = pointsArrToString(data.points);
            }

            if (data.d && !data.points) {
                updatedEl.d = data.d;
                updatedEl.points = parsePathData(data.d);
            }

            if (data.rotate !== undefined) updatedEl.rotate = data.rotate;
            if (data.fill !== undefined && data.fill !== updatedEl.fill) {
                updatedEl.fill = data.fill;
            }
            if (data.stroke !== undefined && data.stroke !== updatedEl.stroke) {
                updatedEl.stroke = data.stroke;
            }
            if (data.strokeWidth !== undefined && data.strokeWidth !== updatedEl.strokeWidth) {
                updatedEl.strokeWidth = data.strokeWidth;
            }

            return updatedEl;
        });
        return {elements: newElements};
    }),

    updateElementPoints: (id, points) => {
        set((state) => ({
            elements: state.elements.map(el =>
                el.id === id
                    ? {...el, points, d: pointsArrToString(points)}
                    : el
            )
        }));
    },

    addPoint: (elementId, point, index) => {
        set((state) => ({
            elements: state.elements.map(el => {
                if (el.id !== elementId || !el.points) return el;

                const newPoints = [...el.points];
                if (index !== undefined && index >= 0 && index <= newPoints.length) {
                    newPoints.splice(index, 0, point);
                } else {
                    newPoints.push(point);
                }

                return {
                    ...el,
                    points: newPoints,
                    d: pointsArrToString(newPoints)
                };
            })
        }));
    },

    updatePoint: (elementId, pointIndex, updates) => {
        set((state) => ({
            elements: state.elements.map(el => {
                if (el.id !== elementId || !el.points?.[pointIndex]) return el;

                const newPoints = [...el.points];
                newPoints[pointIndex] = {...newPoints[pointIndex], ...updates};

                return {
                    ...el,
                    points: newPoints,
                    d: pointsArrToString(newPoints)
                };
            })
        }));
    },

    removePoint: (elementId, pointIndex) => {
        set((state) => ({
            elements: state.elements.map(el => {
                if (el.id !== elementId || !el.points?.[pointIndex]) return el;

                const newPoints = el.points.filter((_, i) => i !== pointIndex);

                return {
                    ...el,
                    points: newPoints,
                    d: pointsArrToString(newPoints)
                };
            })
        }));
    },

    setCustomizableElement: (id) => {
        set((state) => {
            const elementExists = state.elements.some(el => el.id === id);
            console.log(elementExists)
            return {customizableElementId: elementExists ? id : null};
        });
    },

    getCustomizableElement: () => {
        const state = get();
        return state.elements.find(el => el.id === state.customizableElementId);
    }
}));