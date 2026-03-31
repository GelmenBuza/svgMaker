import { useState } from 'react';
import style from './style.module.css';

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    // Заглушка для отправки сообщения
    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim()) {
            console.log('Отправлено:', message);
            setMessage('');
        }
    };

    return (
        <div className={style["chat-widget-container"]}>
            {isOpen && (
                <div className={style["chat-window"]}>
                    <div className={style["chat-header"]}>
                        <h3>Поддержка</h3>
                        <button onClick={() => setIsOpen(false)} className={style["close-btn"]}>
                            &times;
                        </button>
                    </div>

                    <div className={style["chat-body"]}>
                        <div className={style["message bot"]}>
                            Привет! Чем я могу помочь вам сегодня?
                        </div>
                        <div className={style["message user"]}>
                            У меня вопрос по тарифам.
                        </div>
                    </div>

                    <form className={style["chat-footer"]} onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Введите сообщение..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit">➤</button>
                    </form>
                </div>
            )}

            {/* Плавающая кнопка (триггер) */}
            <button
                className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
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