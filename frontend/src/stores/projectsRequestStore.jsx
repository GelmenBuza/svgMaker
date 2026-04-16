import {create} from "zustand";

export const projectsRequestStore = create((set, get) => ({
    requestQueue: [],
    addRequest: (projectId, projectName, snapshot) => set((state) => {
        const request = {projectId, projectName, snapshot};
        console.log('addRequest', request);
        return {requestQueue: [...state.requestQueue, request]};
    }),
    removeRequest: (request) => set((state) => ({requestQueue: state.requestQueue.filter((r) => r !== request)})),
    clearRequestQueue: () => set({requestQueue: []}),
    getRequestQueue: () => get().requestQueue,
    getFirstRequest: () => get().requestQueue[0],
    isRequestQueueEmpty: () => get().requestQueue.length === 0,
    isRequestQueueNotEmpty: () => get().requestQueue.length > 0,
}));