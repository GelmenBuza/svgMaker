import { prisma } from "../prismaClient";
import type { ChatMessage, ChatRoomName, ChatNickname } from "../types/chat.types";

const MAX_TEXT_LENGTH = 1000;
const SYSTEM_SENDER_ID = -1;

function mapRowToChatMessage(row: Messages): ChatMessage {
    return {
        kind: row.sender_id === SYSTEM_SENDER_ID ? "system" : "user",
        id: row.id,
        sender_id: row.sender_id,
        ...(row.nickname != null && row.nickname !== "" ? { nickname: row.nickname } : {}),
        content: row.content,
        createdAt: row.createdAt,
    };
}

export async function getRoomHistory(room: ChatRoomName): Promise<ChatMessage[]> {
    const messages = await prisma.messages.findMany({
        where: { room },
        orderBy: { createdAt: "asc" },
    });
    return messages.map(mapRowToChatMessage);
}

export async function addMessage(params: {
    room: ChatRoomName;
    nickname: ChatNickname;
    content: string;
}): Promise<ChatMessage> {
    const text = normalizeText(params.content);
    if (!text) {
        throw new Error("Text cannot be empty");
    }
    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Text cannot be longer than ${MAX_TEXT_LENGTH} characters`);
    }

    const user = await prisma.user.findFirst({
        where: { username: params.nickname },
    });
    const sender_id = user?.id ?? 0;

    const message = await prisma.messages.create({
        data: {
            room: params.room,
            sender_id,
            nickname: params.nickname,
            content: text,
        },
    });

    return mapRowToChatMessage(message);
}

export async function addSystemMessage(params: {
    room: ChatRoomName;
    content: string;
}): Promise<ChatMessage> {
    const text = normalizeText(params.content);
    const message = await prisma.messages.create({
        data: {
            room: params.room,
            sender_id: SYSTEM_SENDER_ID,
            nickname: null,
            content: text,
        },
    });

    return mapRowToChatMessage(message);
}

function normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
}
