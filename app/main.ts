import net from "node:net";
import { Buffer } from "node:buffer"
import { RequestHeader } from "./RequestHeader"


const server = net.createServer((connection) => {
  connection.on("data", (data: Buffer) => {
    const requestHeader = new RequestHeader(data)

    const correlationId = requestHeader.getCorrelationId()

    const response = Buffer.alloc(8)
    response.writeUInt32BE(4, 0)
    response.writeUInt32BE(correlationId, 4)
    connection.write(response)
  })
});

server.listen(9092, "127.0.0.1");
