const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8000 });

let rooms = {}; // Menyimpan data pemain dalam room

server.on("connection", (ws) => {
  console.log("Player Connected!");

  ws.on("message", (message) => {
    try {
      let data = JSON.parse(message);

      let username = data.username;
      let room = data.room;

      // Jika room belum ada, buat room baru
      if (!rooms[room]) {
        rooms[room] = {
          players: {},
          meteors: [],
        };
      }

      // Simpan posisi pemain dalam room
      if (!rooms[room].players[username]) {
        rooms[room].players[username] = { x: 0 };
      }

      // Jika data memiliki posisi X, update posisi pemain
      if (data.x !== undefined) {
        rooms[room].players[username].x = data.x;

        // Kirim update ke semua pemain dalam room
        let updateData = JSON.stringify({
          username: username,
          x: data.x,
        });

        broadcast(room, updateData);
      }

      // Jika data meminta meteor baru
      if (data.meteor === "spawn") {
        let meteorX = Math.floor(Math.random() * 400) - 200;
        rooms[room].meteors.push(meteorX);

        let meteorData = JSON.stringify({ meteorX: meteorX });
        broadcast(room, meteorData);
      }
    } catch (error) {
      console.log("Error parsing JSON:", error);
    }
  });

  ws.on("close", () => {
    console.log("Player Disconnected!");
  });
});

// Fungsi broadcast ke semua pemain dalam room
function broadcast(room, data) {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

console.log("Server running on ws://localhost:8000");
