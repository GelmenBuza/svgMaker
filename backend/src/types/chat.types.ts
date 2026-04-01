export type ChatMessageKind = "user" | "system";

export type ChatRoomName = string;
export type ChatNickname = string;

export type ChatMessage = {
    kind: ChatMessageKind;
    id: string;
    room: ChatRoomName;
    nickname: ChatNickname;
    content: string;
    createdAt: Date;
}

export interface ChatJoinPayload {
    room: ChatRoomName;
    nickname: ChatNickname;
}

export interface ChatJoinAckOk {
    ok: true;
}

export interface ChatJoinAckError {
    ok: false;
    error: string;
}

export type ChatJoinAck = ChatJoinAckOk | ChatJoinAckError;

export interface ChatSendPayload {
    room: ChatRoomName;
    content: string;
}

export interface ChatSendAckOk {
    ok: true;
}

export interface ChatSendAckError {
    ok: false;
    error: string;
}

export type ChatSendAck = ChatSendAckOk | ChatSendAckError;

export interface SocketChatData {
    room?: ChatRoomName;
    nickname?: ChatNickname;
}

export const DEFAULT_ROOM = "public";