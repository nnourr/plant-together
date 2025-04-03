/** Data Imports */
import sql from "./database/database.js";
import redisClient from "./redis/redis.js";
import yjsHelpers from "./yjs/yjs.helpers.js";
import { RedisClientType } from "redis";

/** Data Access Layer */
import { RoomRepo } from "./room/room.repo.js";
import { DocumentRepo } from "./document/document.repo.js";
import { DocumentService } from "./document/document.service.js";
import { RoomParticipantRepo } from "./room/participant.repo.js";
import { FireauthRepo } from "./firebase/fireauth.repo.js";
import { UserRepo } from "./user/user.repo.js";

/** Service Imports */
import { RoomService } from "./room/room.service.js";
import { AuthService } from "./user/auth.service.js";

/** Helpers */
import signed from 'signed';

export interface Dependecies {
    roomService: RoomService;
    documentService: DocumentService;
    authService: AuthService;
    fireauthRepo: FireauthRepo;
    userRepo: UserRepo;
    roomParticipantRepo: RoomParticipantRepo;
    roomRepo: RoomRepo;
    documentRepo: DocumentRepo;
};

export default function loadDependencies() : Dependecies {
    const fireauthRepo = FireauthRepo.instance();
    const userRepo = new UserRepo();
    const roomParticipantRepo = new RoomParticipantRepo(sql);
    const authService = new AuthService(fireauthRepo, userRepo);

    // ----- Setup Document & Room Services -----
    const documentRepo = new DocumentRepo(
        sql,
        redisClient as RedisClientType,
        yjsHelpers
    );

    const documentService = new DocumentService(documentRepo);
    const roomRepo = new RoomRepo();
    const roomService = new RoomService(documentRepo, authService, roomRepo, roomParticipantRepo, signed.default);

    return { roomService, documentService, authService, fireauthRepo, userRepo, roomParticipantRepo, roomRepo, documentRepo };
};