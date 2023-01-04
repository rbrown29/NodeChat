const blessed = require('blessed');
const EventEmitter = require('events');

module.exports = class ChatUI extends EventEmitter {
    constructor(connector) {
        super();
        this.buildUI();
        this.handleServer(connector);
        this.handleNameInput();
        this.handleInput();

        this.nameInput.focus();
        this.screen.render();
    }

    static formatDate(time) {
        const date = new Date(time);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()},`
            + ` ${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
    }

    handleNameInput() {
        this.nameInput.key(['escape', 'C-c'], (ch, key) => {
            process.exit(0);
        });

        this.nameInput.key('enter', (ch, key) => {
            this.username = this.nameInput.value;
            this.nameBox.hide();
            this.chatBox.show();
            this.input.focus();

            this.emit('name', this.username);
        });
    }

    handleInput() {
        this.input.key(['escape', 'C-c'], (ch, key) => {
            this.emit('end');
        });

        this.input.key(['up', 'down', 'pageup', 'pagedown'], (ch, key) => {
            let current = this.output.getScroll();
            let next = current;

            switch (key.name) {
                case "up":
                    next = current - 1;
                    break;
                case "down":
                    next = current + 1;
                    break;
                case "pageup":
                    next = current - Math.floor(this.output.height / 2);
                    break;
                case "pagedown":
                    next = current + Math.floor(this.output.height / 2);
                    break;
            }
            this.output.scrollTo(next, true);
            this.screen.render();
        });

        this.input.key('enter', (ch, key) => {
            var val = this.input.value;

            this.emit("post", val);
            this.input.setValue('');
            this.input.focus();
            // screen.render();
        });
    }

    handleServer(connector) {
        connector.on("join", (time, name) => {
            const dateString = ChatUI.formatDate(time);
            const color = "red";
            this.addLine(`{bold}{${color}-fg}${dateString} - System:{/}\n### ${name} has joined the chat.`);
        });
        connector.on("post", (time, name, post) => {
            const dateString = ChatUI.formatDate(time);
            const color = (name == this.username) ? "green" : "yellow";
            this.addLine(`{bold}{${color}-fg}${dateString} - ${name}:{/}\n${post}`);
        });
        connector.on("leave", (time, name) => {
            const dateString = ChatUI.formatDate(time);
            const color = "red";
            this.addLine(`{bold}{${color}-fg}${dateString} - System:{/}\n### ${name} has left the chat.`);
        });
    }

    addLine(line) {
        this.output.setValue(this.output.value + "\n\n" + line);
        this.screen.render();
    }

    buildUI() {
        this.screen = blessed.screen({
            autoPadding: true,
            smartCSR: false,
            fastCSR: false,
            dockBorders: true,
            fg: 'white',
            bg: 'black',
            cursor: {
                artificial: true,
                shape: 'line',
                blink: true,
                color: null
            }
        });

        this.chatBox = blessed.box({
            parent: this.screen,
            height: '100%',
            width: '100%',
            hidden: true
        });

        this.output = blessed.textarea({
            parent: this.chatBox,
            tags: true,
            border: {
                type: 'line'
            },
            input: false,
            // keys: false,
            top: 0,
            left: 0,
            height: '100%-2',
            width: '100%',
            scrollbar: {
                style: {
                    bg: 'blue'
                },
                track: {
                    bg: 'cyan'
                }
            }
        });

        this.input = blessed.textbox({
            parent: this.chatBox,
            name: 'input',
            input: true,
            keys: true,
            top: '100%-3',
            left: 0,
            height: 3,
            width: '100%',
            // autoNext: false,
            inputOnFocus: true,
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                focus: {
                    bg: 'black',
                    fg: 'white'
                }
            }
        });

        this.nameBox = blessed.box({
            parent: this.screen,
            name: 'nameBox',
            top: 'center',
            left: 'center',
            tags: true,
            width: 35,
            height: 13,
            content: '\n{center}{bold}{green-fg}Welcome to Node Chat!{/green-fg}{/bold}\n'
                + '{bold}{yellow-fg}Press <escape> to exit.{/yellow-fg}{/bold}\n\n'
                + 'Type your nickname in\n'
                + 'the box below, and press\n'
                + '<return> to continue:{/center}',
            border: {
                type: 'line'
            }
        });

        this.nameInput = blessed.textbox({
            parent: this.nameBox,
            name: 'nameInput',
            input: true,
            keys: true,
            top: '100%-5',
            left: 'center',
            height: 3,
            width: '100%-4',
            inputOnFocus: true,
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                focus: {
                    bg: 'black',
                    fg: 'white'
                }
            }
        });
    }
}