const WebSocket = require("ws");
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });

let players = {};

server.on("connection", (socket) => {
  console.log("Pemain baru terhubung!");

  socket.on("message", (message) => {
    let data = JSON.parse(message);
    players[data.id] = { x: data.x, y: data.y };

    // Kirim posisi semua pemain ke semua klien
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(players));
      }
    });
  });

  socket.on("close", () => {
    console.log("Pemain terputus");
  });
});

console.log("Server berjalan di port " + (process.env.PORT || 8080));
