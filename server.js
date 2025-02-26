const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8000 });

let rooms = {}; // Objek untuk menyimpan room dan pemain di dalamnya

wss.on("connection", function connection(ws) {
  console.log("Player Connected!");

  ws.on("message", function incoming(message) {
    try {
      // Pastikan data diterima dalam format JSON
      let data = JSON.parse(JSON.stringify(message)); // Konversi JSON ke teks

      if (data.event === "join_room") {
        let { username, room } = data;
        console.log(`Player ${username} is joining room ${room}`);

        // Jika room belum ada, buat room baru
        if (!rooms[room]) {
          rooms[room] = [];
        }

        // Tambahkan pemain ke room
        rooms[room].push(username);
        console.log(`Current players in room ${room}:`, rooms[room]);

        // Kirim daftar pemain di room ke semua pemain dalam room tersebut
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                event: "player_list",
                room: room,
                players: rooms[room],
              })
            );
          }
        });
      }
    } catch (error) {
      console.log("Invalid JSON data received:", message);
    }
  });
});
