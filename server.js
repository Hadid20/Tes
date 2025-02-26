const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8000 });

wss.on("connection", function connection(ws) {
  console.log("Player connected");

  ws.on("message", function incoming(message) {
    console.log("Received:", message);

    // Kirim ulang pesan ke semua pemain lain
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", function () {
    console.log("Player disconnected");
  });
});
