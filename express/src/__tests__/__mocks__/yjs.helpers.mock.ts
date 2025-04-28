import { jest } from '@jest/globals'
import * as Y from 'yjs'

export default {
    getDoc: jest.fn<() => Promise<Y.Doc>>(),
    computeRedisRoomStreamName: jest.fn<() => string>(),
}
