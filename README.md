# NodeChat
A terminal-based chat client and server in Node.js. Uses the blessed npm module.

## Usage
Install blessed:

`npm install blessed`

Start server in one terminal or cmd shell:

`node server.js`

Start one or more clients in separate terminals or cmd shells:

`node client.js`

\<esc\> or \<ctrl-C\> to exit the chat client.

localhost and port 1234 are hardcoded in server.js and ChatServer.js, but 
the code should work correctly across the network on other ports if these 
two files are adjusted.
