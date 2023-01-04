const net = require('net');
const rl = require('readline');
const EventEmitter = require('events');

class ChatEmitter extends EventEmitter {};
const chatEmitter = new ChatEmitter();

// Catch uncaughtException
// see https://github.com/nodejs/node/issues/42154
process.on('uncaughtException', (error, origin) => {
    console.error("Error:", error.code);
});

server = net.createServer();

server.on('connection', (sock) => {
    console.log("connected");

    const socketReader = rl.createInterface(sock, sock);

    socketReader.on('line', (line) => {
        console.log("Receive:", line);
        let message = JSON.parse(line);
        message.time = Date.now();
        chatEmitter.emit('message', JSON.stringify(message));
    });
    sock.on('end', () => {
        console.log("disconnected")
    });
    const handler = function(line) {
        sock.write(line + '\n');
    };
    sock.on('error', (err) => {
        console.log("Error:", err.code);

        if (err.code == 'ECONNRESET') {
            console.log("Disconnected")
            chatEmitter.removeListener('message', handler);
        } else {
            throw err;
        }
    });
    chatEmitter.on('message', handler)
});

server.on('error', (err) => {
    console.log(err);
});

server.listen(1234, () => {
    console.log('port bound');
});