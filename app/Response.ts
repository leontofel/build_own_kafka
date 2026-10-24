const UNSUPPORTED_VERSION = 35
const MAX_SUPPORTED_API_VERSION = 4

export class Response {

    // message_size (4) + correlation_id (4) + error_code (2)
    private buffer: Buffer = Buffer.alloc(10)

    constructor(correlationId: number, requestApiVersion: number) {
        const errorCode = requestApiVersion > MAX_SUPPORTED_API_VERSION ? UNSUPPORTED_VERSION : 0

        this.buffer.writeUInt32BE(this.buffer.length - 4, 0)
        this.buffer.writeUInt32BE(correlationId, 4)
        this.buffer.writeUInt16BE(errorCode, 8)
    }

    getBuffer() {
        return this.buffer
    }
}
