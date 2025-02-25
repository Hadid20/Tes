const WebSocket = require("ws");
const server = new WebSocket.Server({ port: process.env.PORT || 3000 });

let players = {};

server.on("connection", (socket) => {
  console.log("Pemain terhubung!");

  socket.on("message", (data) => {
    let msg = JSON.parse(data);
    players[msg.id] = { x: msg.x, y: msg.y };
    socket.send(JSON.stringify(players));
  });

  socket.on("close", () => {
    console.log("Pemain keluar!");
  });
});
