const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8000 });

let rooms = {}; // Menyimpan daftar room dan pemainnya

server.on("connection", (ws) => {
  console.log("Player Connected!");

  ws.on("message", (message) => {
    try {
      let data = JSON.parse(message);
      let username = data.username;
      let room = data.room;

      // Jika pemain ingin membuat room
      if (data.action === "create_room") {
        if (rooms[room]) {
          ws.send(JSON.stringify({ error: "Room sudah ada!" }));
        } else {
          rooms[room] = { players: {}, meteors: [] };
          ws.send(JSON.stringify({ success: "Room berhasil dibuat!" }));
        }
        return;
      }

      // Jika pemain ingin join room
      if (data.action === "join_room") {
        if (!rooms[room]) {
          ws.send(JSON.stringify({ error: "Room tidak ditemukan!" }));
          return;
        }

        rooms[room].players[username] = { x: 0 };
        ws.send(JSON.stringify({ success: `Bergabung ke room ${room}` }));
        return;
      }

      // Jika pemain mengirim data posisi X
      if (data.x !== undefined) {
        if (!rooms[room] || !rooms[room].players[username]) return;

        rooms[room].players[username].x = data.x;

        let updateData = JSON.stringify({
          username: username,
          x: data.x,
        });

        broadcast(room, updateData);
      }

      // Jika pemain ingin spawn meteor
      if (data.meteor === "spawn") {
        if (!rooms[room]) return;

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
