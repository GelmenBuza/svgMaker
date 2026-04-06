import { useState, useRef, useEffect } from 'react';
import style from './style.module.css';
import { userStore } from '../../stores/userStore';
import { useChatSocket } from '../../api/chatApi';

export default function Chat() {
    const { user } = userStore();
    const [isOpen, setIsOpen] = useState(false);
    const room = "general";
    const [text, setText] = useState('');
    const [uiError, setUiError] = useState(null);
    
    const { status, messages, error, disconnect, connect, sendMessage } = useChatSocket();
    
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length]);

    const handleConnect = () => {
        if (isOpen) return;
        if (!user) setUiError("Для использования чата необходимо авторизоваться");
        else {
            console.log("connect");
            connect({ room, nickname: user.username });
            setIsOpen(true);
        }
    }
    
    const handleSend = (e) => {
        e.preventDefault();
        const payload = text.trim();
        if (!payload || status !== "connected") return;
        setUiError(null);
        sendMessage(payload);
        setText('');
    };

    const handleDisconnect = () => {
        disconnect();
        setIsOpen(false);
    };


    return (
        <div className={style["chat-widget-container"]}>
            {isOpen && user && (
                <div className={style["chat-window"]}>
                    <div className={style["chat-header"]}>
                        <h3>Общий чат</h3>
                        <button onClick={() => handleDisconnect()} className={style["close-btn"]}>
                            &times;
                        </button>
                    </div>

                    <div className={style["chat-body"]}>
                        {messages.map((message, index) => {
                            const isSystem = message.kind === "system";
                            return (
                                <div
                                    key={index}
                                    className={`${message.nickname === user.username ? style["chat-message-user"] : style["chat-message"]} ${isSystem ? style["chat-message-system"] : ""}`}
                                >
                                    {!isSystem && message.nickname !== user.username && (
                                        <span className={style["message-nickname"]}>{message.nickname}</span>
                                    )}
                                    <span className={style["message-text"]}>{message.content}</span>
                                </div>
                            );
                        })}

                        <div ref={endRef}/>
                    </div>


                    <form className={style["chat-footer"]} onSubmit={(e) => handleSend(e)}>
                        <input
                            type="text"
                            placeholder="Введите сообщение..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button type="submit">➤</button>
                    </form>
                </div>
            )}


            <button
                className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => handleConnect()}
            >
                <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </button>
        </div>
    );
}