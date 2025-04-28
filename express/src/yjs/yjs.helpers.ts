import * as Y from 'yjs'
import * as decoding from 'lib0/decoding'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as array from 'lib0/array'
import * as map from 'lib0/map'
import { RedisClientType } from 'redis'
import * as encoding from 'lib0/encoding'
import { Sql } from 'postgres'

const retrieveDoc = async (room: string, docname: string, sql: Sql) => {
    /**
     * @type {Array<{ room: string, doc: string, r: number, update: Buffer }>}
     */
    const rows =
        await sql`SELECT update,r from yredis_docs_v1 WHERE room = ${room} AND doc = ${docname}`
    if (rows.length === 0) {
        return null
    }
    const doc = Y.mergeUpdatesV2(rows.map((row: any) => row.update))
    const references = rows.map((row: any) => row.r)
    return { doc, references }
}

const getDoc = async (room: string, redis: RedisClientType, sql: Sql) => {
    const docid = 'index'
    const ms = extractMessagesFromStreamReply(
        await redis.xRead(redis.commandOptions({ returnBuffers: true }), {
            key: computeRedisRoomStreamName(room, docid, 'y'),
            id: '0',
        }),
        'y',
    )

    const docMessages = ms.get(room)?.get(docid) || null
    const docstate = await retrieveDoc(room, docid, sql)
    const ydoc = new Y.Doc()
    const awareness = new awarenessProtocol.Awareness(ydoc)
    awareness.setLocalState(null) // we don't want to propagate awareness state
    if (docstate) {
        Y.applyUpdateV2(ydoc, docstate.doc)
    }

    ydoc.transact(() => {
        docMessages?.messages.forEach((m: any) => {
            const decoder = decoding.createDecoder(m)
            switch (decoding.readVarUint(decoder)) {
                case 0: {
                    // sync message
                    if (decoding.readVarUint(decoder) === 2) {
                        // update message
                        Y.applyUpdate(ydoc, decoding.readVarUint8Array(decoder))
                    }
                    break
                }
                case 1: {
                    // awareness message
                    awarenessProtocol.applyAwarenessUpdate(
                        awareness,
                        decoding.readVarUint8Array(decoder),
                        null,
                    )
                    break
                }
            }
        })
    })

    return ydoc
}

const decodeRedisRoomStreamName = (
    rediskey: string,
    expectedPrefix: string,
) => {
    const match = rediskey.match(/^(.*):room:(.*):(.*)$/)
    if (match == null || match[1] !== expectedPrefix) {
        throw new Error(
            `Malformed stream name! prefix="${match?.[1]}" expectedPrefix="${expectedPrefix}", rediskey="${rediskey}"`,
        )
    }
    return {
        room: decodeURIComponent(match[2]),
        docid: decodeURIComponent(match[3]),
    }
}

const computeRedisRoomStreamName = (
    room: string,
    docid: string,
    prefix: string,
) => `${prefix}:room:${encodeURIComponent(room)}:${encodeURIComponent(docid)}`

const extractMessagesFromStreamReply = (streamReply: any, prefix: any) => {
    /**
     * @type {Map<string, Map<string, { lastId: string, messages: Array<Uint8Array> }>>}
     */
    // Create a Y.Doc and insert some text into the "monaco" type.

    const messages = new Map()
    streamReply?.forEach((docStreamReply: any) => {
        const { room, docid } = decodeRedisRoomStreamName(
            docStreamReply.name.toString(),
            prefix,
        )
        const docMessages = map.setIfUndefined(
            map.setIfUndefined(messages, room, map.create),
            docid,
            () => ({
                lastId: array.last(docStreamReply.messages as any[]).id,
                messages: [] as Uint8Array[],
            }),
        )
        docStreamReply.messages.forEach((m: any) => {
            if (m.message.m != null) {
                docMessages.messages.push(/** @type {Uint8Array} */ m.message.m)
            }
        })
    })
    return messages
}

export default { getDoc, computeRedisRoomStreamName }
