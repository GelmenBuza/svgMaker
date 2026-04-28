import {useCallback, useState, useRef} from "react";
import {io} from "socket.io-client";
import {userStore} from "../stores/userStore.jsx";
import {decryptMessage, encryptMessage} from "../utils/crypto.js";

function isSystemMessage(message) {
    return message.kind === "system";
}

export function useChatSocket() {
    const {private_key} = userStore()
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
                } else {
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
            const fetchHistory = async () => {
                try {
                    const decryptedHistory = await Promise.all(
                        history.map(async (msg) => {
                            const decryptedText = await decryptMessage(msg.content, private_key);
                            return {...msg, content: decryptedText}; // Заменяем объект на текст
                        })
                    );
                    setMessages(decryptedHistory);
                } catch (e) {
                    console.error("Ошибка расшифровки истории: ", e);
                }
            };
            fetchHistory();
        });

        socket.on('chat:message', async (message) => {
            try {
                // Расшифровываем контент перед сохранением
                const decryptedText = await decryptMessage(message.content, private_key);
                const processedMessage = { ...message, content: decryptedText };

                setMessages((prev) => [...prev, processedMessage]);
            } catch (e) {
                console.error("Не удалось расшифровать входящее сообщение", e);
            }
        });

        socket.connect();
    }, [backendUrl, disconnect]);

    const sendMessage = useCallback(async (message) => {
        const socket = socketRef.current;
        const room = activeRoomRef.current;
        if (!socket || !room) return;
        console.log("sendMessage", message, room);
        const encrypted = await encryptMessage(message, private_key)

        const ivArray = new Uint8Array(encrypted.iv);
        const cipherArray = new Uint8Array(encrypted.cipher);

        console.log("Длины:", ivArray.length, cipherArray.length); // Проверь, что тут не 0!

        const combinedMessage = new Uint8Array(ivArray.length + cipherArray.length);
        combinedMessage.set(ivArray, 0);
        combinedMessage.set(cipherArray, ivArray.length);
        const base64CombinedMessage = btoa(
            combinedMessage.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        socket.emit("chat:message", {room, content: base64CombinedMessage}, (ack) => {
            if (!ack.ok) {
                setStatus("error");
                setError(ack.error);
            }
        });
    }, [setStatus, private_key]);

    return {status, messages, error, disconnect, connect, sendMessage};
}