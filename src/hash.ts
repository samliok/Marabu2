import sha256, { Hash, HMAC } from "fast-sha256";
import { canonicalize } from "json-canonicalize";

const obj: object = {
  type: "object",
  object: {
    type: "block",
    txids: ["740bcfb434c89abe57bb2bc80290cd5495e87ebf8cd0dadb076bc50453590104"],
    nonce: "a26d92800cf58e88a5ecf37156c031a4147c2128beeaf1cca2785c93242a4c8b",
    previd: "0024839ec9632d382486ba7aac7e0bda3b4bda1d4bd79be9ae78e7e1e813ddd8",
    created: "1622825642",
    T: "003a000000000000000000000000000000000000000000000000000000000000",
  },
};
const message: string = canonicalize(obj);
console.log(message);

const enc = new TextEncoder();
const encoded = enc.encode(message);
const objectid = sha256(encoded);
console.log(objectid);

const decodedOBJ = new TextDecoder().decode(objectid);
console.log("decodedOBJ");

console.log(decodedOBJ);
