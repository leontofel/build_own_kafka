
export class RequestHeader {
    private messageSize: number;
    private apiKey: number;
    private apiVersion: number;
    private correlationId: number;

    constructor(
        data: Buffer
    ) {
        this.messageSize = data.readUInt32BE(0);
        this.apiKey = data.readUInt16BE(4);
        this.apiVersion = data.readUInt16BE(6);
        this.correlationId = data.readUInt32BE(8);
    }

    getMessageSize() {
        return this.messageSize;
    }

    getApiKey() {
        return this.apiKey;
    }

    getApiVersion() {
        return this.apiVersion;
    }

    getCorrelationId() {
        return this.correlationId;
    }



}