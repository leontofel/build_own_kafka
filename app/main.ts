import net from "node:net";
import { Buffer } from "node:buffer"
import { Request } from "./Request"
import { Response } from "./Response"


const server = net.createServer((connection) => {
  connection.on("data", (data: Buffer) => {
    const request = new Request(data)

    const correlationId = request.getCorrelationId()

    const response = new Response(correlationId, request.getApiVersion())
    
    connection.write(response.getBuffer())
  })
});

server.listen(9092, "127.0.0.1");
