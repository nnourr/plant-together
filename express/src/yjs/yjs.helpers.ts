import * as Y from "yjs";
import * as decoding from "lib0/decoding";
import * as array from "lib0/array";
import * as map from "lib0/map";
import { RedisClientType } from "redis";

export const getDoc = async (room: string, redis: RedisClientType) => {
  const docid = "index";

  const ms = extractMessagesFromStreamReply(
    await redis.xRead(redis.commandOptions({ returnBuffers: true }), {
      key: computeRedisRoomStreamName(room, docid, "y"),
      id: "0",
    }),
    "y"
  );

  const docMessages = ms.get(room)?.get(docid) || null;
  const ydoc = new Y.Doc();

  ydoc.transact(() => {
    docMessages?.messages.forEach((m: any) => {
      const decoder = decoding.createDecoder(m);
      switch (decoding.readVarUint(decoder)) {
        case 0: {
          // sync message
          if (decoding.readVarUint(decoder) === 2) {
            // update message
            Y.applyUpdate(ydoc, decoding.readVarUint8Array(decoder));
          }
          break;
        }
        case 1: {
          break;
        }
      }
    });
  });

  return ydoc;
};

const decodeRedisRoomStreamName = (
  rediskey: string,
  expectedPrefix: string
) => {
  const match = rediskey.match(/^(.*):room:(.*):(.*)$/);
  if (match == null || match[1] !== expectedPrefix) {
    throw new Error(
      `Malformed stream name! prefix="${match?.[1]}" expectedPrefix="${expectedPrefix}", rediskey="${rediskey}"`
    );
  }
  return {
    room: decodeURIComponent(match[2]),
    docid: decodeURIComponent(match[3]),
  };
};

export const computeRedisRoomStreamName = (
  room: string,
  docid: string,
  prefix: string
) => `${prefix}:room:${encodeURIComponent(room)}:${encodeURIComponent(docid)}`;

const extractMessagesFromStreamReply = (streamReply: any, prefix: any) => {
  /**
   * @type {Map<string, Map<string, { lastId: string, messages: Array<Uint8Array> }>>}
   */
  // Create a Y.Doc and insert some text into the "monaco" type.

  const messages = new Map();
  streamReply?.forEach((docStreamReply: any) => {
    const { room, docid } = decodeRedisRoomStreamName(
      docStreamReply.name.toString(),
      prefix
    );
    const docMessages = map.setIfUndefined(
      map.setIfUndefined(messages, room, map.create),
      docid,
      () => ({
        lastId: array.last(docStreamReply.messages as any[]).id,
        messages: [] as Uint8Array[],
      })
    );
    docStreamReply.messages.forEach((m: any) => {
      if (m.message.m != null) {
        docMessages.messages.push(/** @type {Uint8Array} */ m.message.m);
      }
    });
  });
  return messages;
};
