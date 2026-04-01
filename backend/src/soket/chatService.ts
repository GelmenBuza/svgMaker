import type { ChatMessage, ChatRoomName, ChatNickname } from "../types/chat.types";
import {v4 as uuidv4} from "uuid";

type MessageByRoom = Map<ChatRoomName, ChatMessage[]>;

// Тут позже будет БД
const messagesByRoom: MessageByRoom = new Map();

const MAX_MESSAGES_PER_ROOM = 100;
const MAX_TEXT_LENGTH = 1000;

export function getRoomHistory(room: ChatRoomName): ChatMessage[] {
    return messagesByRoom.get(room) || [];
}

export function addMessage(params: {
    room: ChatRoomName;
    nickname: ChatNickname;
    content: string;
}): ChatMessage {
    const text = normalizeText(params.content);
    if (!text) {
        throw new Error("Text cannot be empty");
    }
    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Text cannot be longer than ${MAX_TEXT_LENGTH} characters`);
    }

    const message: ChatMessage = {
        kind: "user",
        id: uuidv4(),
        room: params.room,
        nickname: params.nickname,
        content: text,
        createdAt: new Date(),
    }
    
    storeMessage(message);
    return message;
}

export function addSystemMessage(params: {
    room: ChatRoomName;
    content: string;
}): ChatMessage {
    const text = normalizeText(params.content);
    const message: ChatMessage = {
        kind: "system",
        id: uuidv4(),
        room: params.room,
        nickname: "System",
        content: text,
        createdAt: new Date(),
    }

    storeMessage(message);
    return message;
}

function normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
}

function storeMessage(message: ChatMessage) {
    const current = messagesByRoom.get(message.room) || [];
    current.push(message);
    if (current.length > MAX_MESSAGES_PER_ROOM) {
        current.splice(0, current.length - MAX_MESSAGES_PER_ROOM);
    }
    messagesByRoom.set(message.room, current);
}