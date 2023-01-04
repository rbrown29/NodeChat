const ChatUI = require('./ChatUI.js');
const ChatServer = require('./ChatServer.js');
const EventEmitter = require('events');

module.exports = class ChatConnector extends EventEmitter {
    constructor() {
        super();

        let ui = new ChatUI(this);

        ui.on('name', (name) => {
            let connection = new ChatServer(name);
            this.connection = connection;
            connection.on("join", (time, name) => {
                this.emit("join", time, name);
            });
            connection.on("post", (time, name, post) => {
                this.emit("post", time, name, post);
            });
            connection.on("leave", (time, name) => {
                this.emit("leave", time, name);
            });
            connection.on("end", () => {
                process.exit(0);
            });
        });

        ui.on('post', (line) =>
        {
            this.connection.post(line);
        })

        ui.on('end', () => {
            this.connection.close();
        });
    }
}