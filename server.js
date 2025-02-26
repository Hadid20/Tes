const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let rooms = {}; // Menyimpan daftar room dan pemain di dalamnya

wss.on("connection", function connection(ws) {
  console.log("Player Connected!");

  ws.on("message", function incoming(message) {
    console.log("Received:", message.toString());

    try {
      let data = JSON.parse(message.toString());

      // Cek event
      if (data.event === "join_room") {
        let username = data.username;
        let room = data.room;

        if (!rooms[room]) {
          rooms[room] = {}; // Buat room jika belum ada
        }
        rooms[room][username] = ws; // Simpan koneksi pemain di room

        console.log(`${username} joined room ${room}`);

        // Kirim konfirmasi ke pemain yang bergabung
        ws.send(
          JSON.stringify({
            event: "joined_room",
            username: username,
            room: room,
          })
        );
      }

      // Handle movement
      else if (data.event === "move") {
        let room = data.room;
        let username = data.username;
        let x = data.x;

        if (rooms[room]) {
          console.log(`${username} moved to x=${x} in room ${room}`);

          // Kirim update ke semua pemain di room
          for (let player in rooms[room]) {
            if (rooms[room][player] !== ws) {
              // Jangan kirim ke pengirim
              rooms[room][player].send(
                JSON.stringify({
                  event: "update_position",
                  username: username,
                  x: x,
                })
              );
            }
          }
        }
      }

      // Sinkronisasi meteor di semua pemain di room
      else if (data.event === "spawn_meteor") {
        let room = data.room;
        let meteorData = data.meteor; // Data meteor

        if (rooms[room]) {
          console.log(`Meteor spawned in room ${room}`);

          // Kirim meteor ke semua pemain di room
          for (let player in rooms[room]) {
            rooms[room][player].send(
              JSON.stringify({
                event: "meteor_spawned",
                meteor: meteorData,
              })
            );
          }
        }
      }
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  });

  ws.on("close", () => {
    console.log("Player Disconnected!");

    // Hapus pemain dari room saat disconnect
    for (let room in rooms) {
      for (let player in rooms[room]) {
        if (rooms[room][player] === ws) {
          console.log(`${player} left room ${room}`);
          delete rooms[room][player];

          // Hapus room jika kosong
          if (Object.keys(rooms[room]).length === 0) {
            delete rooms[room];
          }
          break;
        }
      }
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");
