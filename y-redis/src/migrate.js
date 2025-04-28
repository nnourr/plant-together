import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import postgres from 'postgres'
import Websocket from 'ws'
import * as env from 'lib0/environment'

if (typeof global !== 'undefined' && !global.WebSocket) {
    global.WebSocket = Websocket
}

const postgresUrl = env.ensureConf('postgres')
const sql = postgres(postgresUrl)

const rooms = await sql`
SELECT document.room_id, document.id FROM room
JOIN document ON document.room_id = room.id;
`
console.log(`Fetched ${rooms.length} rooms.`)

const docs = []
const og_providers = []
const persisted_providers = []

process.setMaxListeners(0)

async function connectProviders() {
    for (const room of rooms) {
        console.log(`Connecting to ${room.room_id}${room.id}`)
        const recent_doc = new Y.Doc()
        docs.push(recent_doc)

        const og_provider = new WebsocketProvider(
            'ws://localhost:4023',
            `${room.room_id}${room.id}`,
            recent_doc,
        )
        const persisted_provider = new WebsocketProvider(
            'ws://localhost:3002',
            `${room.room_id}${room.id}`,
            recent_doc,
        )
        og_provider.on('status', ({ status }) => {
            console.log(
                `Original provider for ${room.room_id}${room.id} status: ${status}`,
            )
        })

        persisted_provider.on('status', ({ status }) => {
            console.log(
                `Persisted provider for ${room.room_id}${room.id} status: ${status}`,
            )
        })
        og_providers.push(og_provider)
        persisted_providers.push(persisted_provider)

        og_provider.on('sync', isSynced => {
            if (isSynced) {
                const update = Y.encodeStateAsUpdate(recent_doc)
                Y.applyUpdate(recent_doc, update) // Sync to persisted provider
                console.log(`Migrated document ${room.room_id}${room.id}`)
            }
        })

        await new Promise(resolve => setTimeout(resolve, 500)) // Throttle connections
    }

    console.log('All providers connected.')
}

function destroyConnections() {
    console.log('Destroying connections...')
    docs.forEach(doc => doc.destroy())
    og_providers.forEach(provider => provider.destroy())
    persisted_providers.forEach(provider => provider.destroy())
}

await connectProviders()

setTimeout(destroyConnections, 10000)
