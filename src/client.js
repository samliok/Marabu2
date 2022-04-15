const canonicalize = require("canonicalize");
const hello_message = {
  type: "hello",
  version: "0.8.2",
  agent: "Marabu-Core Client 0.8",
};
const hello_formatted = canonicalize(hello_message);

const ihaveobject_message = {
  type: "ihaveobject",
  objectid: "0024839ec9632d382486ba7aac7e0bda3b4bda1d4bd79be9ae78e7e1e813ddd8",
};
const have_formatted = canonicalize(ihaveobject_message);

// Include Nodejs' net module.
const Net = require("net");
// The port number and hostname of the server.
const port = 18018;
const host = "149.28.219.230";

// Create a new TCP client.

const client = new Net.Socket();
obj = {
  type: "ihaveobject",
  objectid: "i819029012hxb1",
};
obj1 = {
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

const message = canonicalize(obj);

// Send a connection request to the server.
client.connect({ port: port, host: host }, function () {
  // If there is no error, the server has accepted the request and created a new
  // socket dedicated to us.
  console.log("TCP connection established with the server.");

  // The client can now send data to the server by writing to its socket.
  //   client.write(hello_formatted);
  //   setTimeout(function(){
  //         console.log("I am the third log after 5 seconds");
  //     },5000);
  //   client.write(have_formatted);
  client.write(`${message}\n`);
});

// The client can also receive data from the server by reading from its socket.
client.on("data", function (chunk) {
  console.log(`Data received from the server: ${chunk.toString()}`);
  // Request an end to the connection after the data has been received.
  client.end();
});

client.on("end", function () {
  console.log("Requested an end to the TCP connection");
});
