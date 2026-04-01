import { Server, Socket } from "socket.io";
import {DEFAULT_ROOM} from "../types/chat.types";
import type {
    ChatJoinAck,
    ChatSendAck,
    ChatJoinPayload,
    ChatSendPayload,
    SocketChatData,
    ChatMessage,
} from "../types/chat.types";
import {addMessage, addSystemMessage, getRoomHistory} from "./chatService";

function isValidRoom(room: string): boolean {
    return room.trim().length > 0 && room.trim().length <= 100;
}

function isValidNickname(nickname: string): boolean {
    return nickname.trim().length > 0 && nickname.trim().length <= 100;
}

export function registerChatHandlers(server: Server) {
    server.on("connection", (socket: Socket) => {
        const socketData = socket.data as SocketChatData;
        if (!socketData.room) socketData.room = DEFAULT_ROOM;

        socket.on("chat:join", (payload: ChatJoinPayload, callback: (ack: ChatJoinAck) => void) => {
            try {
                const room = payload?.room?.toString() || '';
                const nickname = payload?.nickname?.toString() || '';

                if (!isValidRoom(room)) {
                    callback({ok: false, error: "Invalid room name"});
                    return;
                }
                if (!isValidNickname(nickname)) {
                    callback({ok: false, error: "Invalid nickname"});
                    return;
                }
                
                if (socketData.room && socketData.room !== room) {
                    socket.leave(socketData.room);
                }

                socketData.room = room;
                socketData.nickname = nickname;

                socket.join(room);

                const history = getRoomHistory(room);
                socket.emit("chat:history", history);

                const systemMessage = addSystemMessage({
                    room,
                    content: `User ${nickname} joined the chat`,
                });
                server.to(room).emit("chat:message", systemMessage satisfies ChatMessage);

                callback({ok: true});
            } catch (error) {
                console.error("Error in chat:join", error);
                callback({ok: false, error: "Internal server error"});
            }
        })

        socket.on("chat:message", (payload: ChatSendPayload, callback: (ack: ChatSendAck) => void) => {
            try {
                const room = payload?.room?.toString() || '';
                const content = payload?.content?.toString() || '';
    
                if (!socketData.room || socketData.room !== room) {
                    callback({ok: false, error: "Access denied"});
                    return;
                }
    
                if (!socketData.nickname) {
                    callback({ok: false, error: "Not joined the chat"});
                    return;
                }
    
                const message = addMessage({
                    room,
                    nickname: socketData.nickname,
                    content,
                });
    
                server.to(room).emit("chat:message", message satisfies ChatMessage);
                callback({ok: true});
            } catch (error) {
                console.error("Error in chat:message", error);
                callback({ok: false, error: "Internal server error"});
            }
        })

        socket.on('disconnect', () => {
            const room = socketData.room;
            const nickname = socketData.nickname;
            if (!room || !nickname) return;

            const systemMessage = addSystemMessage({
                room,
                content: `User ${nickname} left the chat`,
            })
            server.to(room).emit("chat:message", systemMessage satisfies ChatMessage);
        })
    })
}