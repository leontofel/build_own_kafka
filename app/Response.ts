const UNSUPPORTED_VERSION = 35
const MAX_SUPPORTED_API_VERSION = 4

export class Response {

    private buffer: Buffer = Buffer.alloc(23)

    constructor(correlationId: number, requestApiVersion: number) {
        const errorCode = requestApiVersion > MAX_SUPPORTED_API_VERSION ? UNSUPPORTED_VERSION : 0

        this.buffer.writeUInt32BE(this.buffer.length - 4, 0)
        this.buffer.writeUInt32BE(correlationId, 4)
        this.buffer.writeUInt16BE(errorCode, 8)
        this.buffer.writeUInt8(2, 10)
        this.buffer.writeUInt16BE(18, 11)
        this.buffer.writeUInt16BE(MAX_SUPPORTED_API_VERSION, 15)
    }

    getBuffer() {
        return this.buffer
    }
}
