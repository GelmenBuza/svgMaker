// import { notificationsStore } from "../../stores/notificationsStore.jsx";

// const Notification = ({ notification }) => {
//     return (
//         <div>
//             <h1>{notification.message}</h1>
//         </div>
//     )
// }

// const Alert = ({ alert }) => {
//     return (
//         <div>
//             <h1>{alert.message}</h1>
//         </div>
//     )
// }
// export default function CustomNotifications() {
//     const { stack, removeNotificationFromStack } = notificationsStore();
//     return (
//         <div>
//             {stack.map(notification => (
//                 notification.type === 'notification'
//                     ? <Notification key={notification.id} notification={notification} /> : <Alert key={notification.id} alert={notification} />
//             ))}
//         </div>
//     )
// }

import { useEffect, useRef } from "react";
import { notificationsStore } from "../../stores/notificationsStore.jsx";

const containerStyle = {
    position: "fixed",
    top: "16px",
    right: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 9999,
    pointerEvents: "none",
};

const getItemStyle = (type) => ({
    minWidth: "260px",
    maxWidth: "360px",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#ffffff",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
    background: type === "alert" ? "#d9534f" : "#2d7ff9",
    border: type === "alert" ? "1px solid #b13c38" : "1px solid #1d5cb8",
    fontSize: "14px",
    lineHeight: "1.35",
    fontWeight: 500,
    pointerEvents: "auto",
});

export default function CustomNotifications() {
    const { stack, removeNotificationFromStack } = notificationsStore();
    const timersRef = useRef({});

    useEffect(() => {
        stack.forEach((notification) => {
            if (timersRef.current[notification.id]) return;

            timersRef.current[notification.id] = setTimeout(() => {
                removeNotificationFromStack(notification.id);
                delete timersRef.current[notification.id];
            }, 3000);
        });

        Object.keys(timersRef.current).forEach((id) => {
            const existsInStack = stack.some((notification) => notification.id === id);
            if (!existsInStack) {
                clearTimeout(timersRef.current[id]);
                delete timersRef.current[id];
            }
        });
    }, [stack, removeNotificationFromStack]);

    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
            timersRef.current = {};
        };
    }, []);

    return (
        <div style={containerStyle}>
            {stack.map((notification) => (
                <div key={notification.id} style={getItemStyle(notification.type)}>
                    {notification.message}
                </div>
            ))}
        </div>
    );
}