[![progress-banner](https://backend.codecrafters.io/progress/kafka/98ac272c-e340-40ff-a877-b37351990bfd)](https://app.codecrafters.io/users/leontofel?r=2qF)

# Build Your Own Kafka — TypeScript

A Kafka broker written from scratch in TypeScript on [Bun](https://bun.sh), speaking
the real Kafka binary wire protocol over raw TCP. No Kafka libraries, no protocol
helpers. Just sockets, buffers, and the spec.

Built as part of the [CodeCrafters](https://codecrafters.io) **"Build Your Own Kafka"** challenge.

---

## What is CodeCrafters?

[CodeCrafters](https://codecrafters.io) is a platform for learning systems programming
by rebuilding real infrastructure from scratch: Redis, Git, SQLite, HTTP servers,
DNS servers, Kafka, and more.

Each challenge is broken into small, incremental **stages**. Every stage adds one
capability, such as binding a port, parsing a header field or handling a new API.
It comes with an automated test suite that runs against your code on CodeCrafters'
servers. You push, the tester connects to your program like a real client would, and
you get pass/fail output streamed back to your terminal.

```sh
codecrafters submit   # commits, pushes, and runs the stage's tests remotely
```

The point is not to follow a tutorial. You read the protocol spec, design the
implementation, and let the tester tell you where you're wrong.

## What is Kafka?

[Apache Kafka](https://kafka.apache.org) is a distributed event-streaming platform: a
durable, partitioned, append-only log that producers write to and consumers read
from. Clients talk to brokers over TCP using a compact, versioned **binary protocol**.
Every request and response is a length-prefixed frame with big-endian integers,
compact arrays and tagged fields.

This project implements a broker that speaks that protocol well enough for real
Kafka clients and the CodeCrafters tester to talk to it.

---

## Current status

| Capability | Status |
| --- | --- |
| TCP server bound to `127.0.0.1:9092` | ✅ |
| Parse request header (`message_size`, `api_key`, `api_version`, `correlation_id`) | ✅ |
| Echo `correlation_id` in response header | ✅ |
| Reject unsupported API versions (`UNSUPPORTED_VERSION`, error code `35`) | ✅ |
| `ApiVersions` (key `18`) response, v0–v4 | ✅ |
| Multiple requests per connection / concurrent clients | ✅ |
| `DescribeTopicPartitions` | ⏳ |
| `Fetch` | ⏳ |
| `Produce` | ⏳ |

The progress banner at the top is live and reflects stages passed on CodeCrafters.

---

## Architecture

```
app/
├── main.ts       # TCP server: accepts connections, routes each frame → Request → Response
├── Request.ts    # Decodes the fixed request header from a raw Buffer
├── Response.ts   # Encodes the ApiVersions response frame
└── Message.ts    # Header decoder (predecessor of Request.ts, slated for removal)
```

Flow per incoming frame:

```
socket "data" ──► new Request(buffer) ──► correlationId, apiVersion
                                                  │
                                                  ▼
socket.write ◄── response.getBuffer() ◄── new Response(correlationId, apiVersion)
```

### Request header (v2)

| Offset | Size | Field | Type |
| ---: | ---: | --- | --- |
| 0 | 4 | `message_size` | `INT32` |
| 4 | 2 | `request_api_key` | `INT16` |
| 6 | 2 | `request_api_version` | `INT16` |
| 8 | 4 | `correlation_id` | `INT32` |
| 12 | … | `client_id`, tagged fields, body | — |

### `ApiVersions` v4 response (23 bytes)

| Offset | Size | Field | Value |
| ---: | ---: | --- | --- |
| 0 | 4 | `message_size` | `19` |
| 4 | 4 | `correlation_id` | echoed from request |
| 8 | 2 | `error_code` | `0`, or `35` if version > 4 |
| 10 | 1 | `api_keys` (compact array, N+1) | `2` → one entry |
| 11 | 2 | `api_key` | `18` (ApiVersions) |
| 13 | 2 | `min_version` | `0` |
| 15 | 2 | `max_version` | `4` |
| 17 | 1 | tagged fields (entry) | `0` |
| 18 | 4 | `throttle_time_ms` | `0` |
| 22 | 1 | tagged fields (body) | `0` |

All integers are big-endian, per the
[Kafka protocol guide](https://kafka.apache.org/protocol.html).

---

## Running locally

**Requirements:** [Bun](https://bun.sh) `1.3+`

```sh
bun install
./your_program.sh        # starts the broker on 127.0.0.1:9092
```

Send a raw `ApiVersions` v4 request and inspect the bytes that come back:

```sh
echo -n "00000023001200046f7fc66100096b61666b612d636c69000a6b61666b612d636c6904302e3100" \
  | xxd -r -p | nc -q1 127.0.0.1 9092 | hexdump -C
```

Expected output:

```
00000000  00 00 00 13 6f 7f c6 61  00 00 02 00 12 00 00 00  |....o..a........|
00000010  04 00 00 00 00 00 00                              |.......|
```

`6f7fc661` is the correlation ID echoed back. `00 00` means no error, and `00 12`
is API key 18 with versions `0..4`.

### Submitting to CodeCrafters

```sh
codecrafters submit
```

`.codecrafters/run.sh` controls how the remote tester launches the program.
`your_program.sh` controls local runs.

---

## Known limitations & next steps

This codebase is built stage by stage. These are deliberate gaps that the
upcoming stages will close:

- **Frame assembly.** Each socket `data` event is treated as exactly one request.
  TCP is a byte stream, so a production broker must buffer and split on
  `message_size` to handle partial and coalesced frames.
- **API routing.** The response is always `ApiVersions`. A dispatcher keyed on
  `request_api_key` is needed before adding `DescribeTopicPartitions` and `Fetch`.
- **Response encoding.** `Response` writes at hard-coded offsets. A small
  `BufferWriter` with typed primitives (`int16`, `int32`, `uvarint`,
  compact arrays, tagged fields) will keep new APIs correct and readable.
- **Cleanup.** `Message.ts` duplicates `Request.ts`, and the `net` npm dependency
  is unnecessary because `node:net` ships with Bun.
- **Tests.** No local test suite yet. Encoder/decoder round-trip tests under
  `bun test` are the next addition.

---

## References

- [Kafka protocol guide](https://kafka.apache.org/protocol.html)
- [KIP-482: tagged fields / flexible versions](https://cwiki.apache.org/confluence/display/KAFKA/KIP-482%3A+The+Kafka+Protocol+should+Support+Optional+Tagged+Fields)
- [CodeCrafters Kafka challenge](https://codecrafters.io/challenges/kafka)
