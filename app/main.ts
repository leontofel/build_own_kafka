import net from "node:net";
import { Buffer } from "node:buffer"

function encodeInt32BE(value: number): Buffer {
  const buf = Buffer.alloc(4)
  buf.writeInt32BE(value, 0)
  return buf
}

function encodeResponseHeaderV0(correlationId: number): Buffer {
  // message_size is 0 for this stage, then correlation_id
  return Buffer.concat([
    encodeInt32BE(0),
    encodeInt32BE(correlationId),
  ])
}

const server = net.createServer((connection) => {
  const response = encodeResponseHeaderV0(7)
  connection.write(response)
});

server.listen(9092, "127.0.0.1");
