import {ExtendedError} from "socket.io";


export type MiddlewareNext = (err?: ExtendedError) => void;
