import { useCallback, useState, useRef } from "react";
import { io } from "socket.io-client";

function isSystemMessage(message) {
    return message.kind === "system";
}

export function useChatSocket() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const socketRef = useRef(null);
    const activeRoomRef = useRef(null);

    const [status, setStatus] = useState("disconnected");
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);

    const disconnect = useCallback(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
        }
        setStatus("disconnected");
    }, []);

    const connect = useCallback((payload) => {
        setError(null);

        disconnect();

        const socket = io(backendUrl, {
            autoConnect: false,
            transports: ["websocket"],
        });

        socketRef.current = socket;
        activeRoomRef.current = payload.room;
        setStatus("connecting");

        socket.on("connect", () => {
            const onJoinAck = (ack) => {
                if (ack.ok) {
                    setStatus("connected");
                }
                else {
                    setError(ack.error);
                }
            }

            socket.emit("chat:join", payload, onJoinAck);
        });

        socket.on("connect_error", (error) => {
            setStatus('error');
            setError(error ? error.message : "Ошибка подключения");
        })

        socket.on("disconnect", () => {
            setStatus("disconnected");
        });

        socket.on('chat:history', (history) => {
            setMessages(history);
        });

        socket.on('chat:message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.connect();
    }, [backendUrl, disconnect]);

    const sendMessage = useCallback((message) => {
        const socket = socketRef.current;
        const room = activeRoomRef.current;
        if (!socket || !room) return;

        socket.emit("chat:message", { room, content: message }, (ack) => {
            if (!ack.ok) {
                setStatus("error");
                setError(ack.error);
            }
        });
    }, [setStatus]);

    return { status, messages, error, disconnect, connect, sendMessage };
}