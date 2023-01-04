const net = require('net');
const rl = require('readline');
const EventEmitter = require('events');

module.exports = class ChatServer extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.sock = new net.Socket();
        this.reader = rl.createInterface(this.sock, this.sock);
        this.reader.on('line', (line) => {
            const message = JSON.parse(line);
            switch (message.type) {
                case 'join':
                    this.emit('join', message.time, message.name);
                    break;
                case 'post':
                    this.emit('post', message.time, message.name, message.post);
                    break;
                case 'leave':
                    this.emit('leave', message.time, message.name);
                    break;
            }
        });

        this.sock.connect(1234, 'localhost');
        this.sock.on('end', () => {
            console.log("disconnected");
            this.emit('end');
        });

        this.sock.on('error', () => {
            this.emit('end');
        });

        this.sock.write(JSON.stringify({
            type: 'join',
            name: this.name
        }) + "\n");
    }

    post(message) {
        this.sock.write(JSON.stringify({
            type: 'post',
            name: this.name,
            post: message
        }) + "\n");
    }

    close() {
        this.sock.write(JSON.stringify({
            type: 'leave',
            name: this.name
        }) + "\n");
        this.emit('end');
    }
}