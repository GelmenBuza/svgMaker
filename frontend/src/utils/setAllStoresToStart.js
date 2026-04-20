import { elementsStore } from "../stores/elementsStore.jsx";
import { notificationsStore } from "../stores/notificationsStore.jsx";
import { projectsRequestStore } from "../stores/projectsRequestStore.jsx";
import { userStore } from "../stores/userStore.jsx";

const setAllStoresToStart = () => {
    // elementsStore
    elementsStore.clearSelected;
    elementsStore.clearElements;
    elementsStore.clearElementRotation;
    elementsStore.clearAreaWidth;
    elementsStore.clearAreaHeight;
    elementsStore.clearCustomizableElementId;

    // notificationsStore
    notificationsStore.clearNotificationsFromStack;

    // projectsRequestStore
    projectsRequestStore.clearRequestQueue;

    // userStore
    userStore.clearUser;
    userStore.clearProjects;
}

export default setAllStoresToStart;