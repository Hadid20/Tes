const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8000 });

let rooms = {}; // Menyimpan daftar room

wss.on("connection", function connection(ws) {
  console.log("Player Connected!");

  ws.on("message", function incoming(message) {
    try {
      let data = JSON.parse(message);

      // Jika pemain ingin bergabung atau membuat room
      if (data.event === "join_room") {
        let roomId = data.room; // Nama room
        let username = data.username; // Username pemain

        if (!rooms[roomId]) {
          rooms[roomId] = { players: [], meteors: [] };
        }

        ws.username = username;
        ws.roomId = roomId;
        rooms[roomId].players.push(ws);

        console.log(`${username} joined ${roomId}`);

        // Kirim konfirmasi ke pemain
        ws.send(JSON.stringify({ event: "room_joined", room: roomId }));

        // Kirim update daftar pemain ke semua orang di room
        rooms[roomId].players.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                event: "player_list",
                players: rooms[roomId].players.map((p) => p.username),
              })
            );
          }
        });
      }

      // Jika pemain bergerak
      if (data.event === "move") {
        let roomId = ws.roomId;
        if (rooms[roomId]) {
          rooms[roomId].players.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  event: "update_position",
                  username: ws.username,
                  x: data.x,
                })
              );
            }
          });
        }
      }
    } catch (error) {
      console.log("Invalid JSON data:", message);
    }
  });

  ws.on("close", () => {
    let roomId = ws.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter((p) => p !== ws);
      console.log(`${ws.username} left ${roomId}`);

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId]; // Hapus room jika kosong
      }
    }
  });
});
