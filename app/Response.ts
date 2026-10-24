
export class Response {
    
    private buffer: Buffer = Buffer.alloc(16)

    constructor(correlationId: number, requestApiVersion: number) {
        this.buffer.writeUInt32BE(4, 0)
        this.buffer.writeUInt16BE(requestApiVersion > 4 ? 35 : 0, 4)
        this.buffer.writeUInt32BE(correlationId, 4)

        
    }

    getBuffer() {
        return this.buffer
    }
}