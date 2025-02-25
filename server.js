const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("Pemain terhubung");

  ws.on("message", function incoming(data) {
    try {
      let message = JSON.parse(data); // Ubah teks jadi JSON
      console.log("Data diterima:", message);

      let event = message.event; // Mengambil event
      let player = message.player; // Mengambil player
      let x = message.x; // Mengambil posisi X
      let y = message.y; // Mengambil posisi Y

      console.log(`Event: ${event}, Player: ${player}, Posisi: (${x}, ${y})`);

      // Kirim data ke semua pemain lain
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error("Pesan bukan JSON valid:", data);
    }
  });
});

console.log("Server WebSocket berjalan di ws://localhost:8080");
