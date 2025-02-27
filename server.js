const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });
let rooms = {}; // Menyimpan data room (tiap room berisi objek { username: ws })

server.on("connection", (ws) => {
  console.log("Player Connected!");

  ws.on("message", (message) => {
    try {
      // Parsing pesan dari client
      let data = JSON.parse(message);
      console.log("Received:", data);

      // Pastikan data mengandung 'action'
      if (!data.action) {
        console.log("No 'action' found in data. Ignoring...");
        return;
      }

      // -----------------------------
      // 1. Membuat Room
      // -----------------------------
      if (data.action === "create_room") {
        if (!data.room || !data.username) {
          console.log("Missing room or username in create_room action!");
          return;
        }

        // Jika room belum ada, buat baru
        if (!rooms[data.room]) {
          rooms[data.room] = {};
          console.log(`Room "${data.room}" created.`);
        } else {
          console.log(`Room "${data.room}" already exists. Continuing...`);
        }

        // Simpan koneksi di room
        rooms[data.room][data.username] = ws;
        ws.room = data.room;
        ws.username = data.username;

        console.log(`${ws.username} created and joined room: ${ws.room}`);
      }

      // -----------------------------
      // 2. Bergabung ke Room
      // -----------------------------
      else if (data.action === "join_room") {
        if (!data.room || !data.username) {
          console.log("Missing room or username in join_room action!");
          return;
        }

        if (!rooms[data.room]) {
          console.log(`Room "${data.room}" does not exist!`);
          // Kirim pesan error ke client
          ws.send(JSON.stringify({ error: "Room does not exist" }));
          return;
        }

        rooms[data.room][data.username] = ws;
        ws.room = data.room;
        ws.username = data.username;

        console.log(`${ws.username} joined room: ${ws.room}`);
      }

      // -----------------------------
      // 3. Pergerakan Pemain (Move)
      // -----------------------------
      else if (data.action === "move") {
        // Pastikan player sudah ada di room
        if (!ws.room || !rooms[ws.room]) {
          console.log("Player not in a valid room to move!");
          return;
        }

        // Log pergerakan
        console.log(
          `Player ${ws.username} moved to x: ${data.x} in room: ${ws.room}`
        );

        // Buat payload yang akan dikirim ke pemain lain
        let payload = {
          action: "update_position",
          username: ws.username,
          x: data.x,
        };

        // Kirim ke semua pemain di room (kecuali pengirim)
        Object.values(rooms[ws.room]).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
          }
        });
      }

      // -----------------------------
      // 4. Spawn Meteor (Sinkronisasi Rintangan)
      // -----------------------------
      else if (data.action === "spawn_meteor") {
        if (!ws.room || !rooms[ws.room]) {
          console.log("Player not in a valid room to spawn meteor!");
          return;
        }

        let meteorX = data.x || 0;
        let meteorSpeed = data.speed || 5;
        console.log(
          `Meteor spawned at x: ${meteorX}, speed: ${meteorSpeed} in room: ${ws.room}`
        );

        // Kirim meteor ke semua pemain di room
        let meteorPayload = {
          action: "spawn_meteor",
          x: meteorX,
          speed: meteorSpeed,
        };

        Object.values(rooms[ws.room]).forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(meteorPayload));
          }
        });
      }
    } catch (error) {
      console.log("Error parsing JSON:", error);
    }
  });

  // -----------------------------
  // Jika Pemain Disconnect
  // -----------------------------
  ws.on("close", () => {
    console.log(`Player ${ws.username || "Unknown"} disconnected`);

    // Hapus player dari room
    if (ws.room && rooms[ws.room] && ws.username) {
      delete rooms[ws.room][ws.username];
      console.log(`${ws.username} removed from room: ${ws.room}`);

      // Jika room kosong, hapus room
      if (Object.keys(rooms[ws.room]).length === 0) {
        delete rooms[ws.room];
        console.log(`Room "${ws.room}" is now empty and deleted.`);
      }
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");
