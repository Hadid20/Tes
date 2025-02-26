const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8000 });

wss.on("connection", function connection(ws) {
  console.log("Player connected");

  ws.on("message", function incoming(message) {
    const data = message.toString(); // Konversi Buffer ke string JSON
    console.log("Received:", data);

    // Kirim ulang data ke semua pemain lain
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", function () {
    console.log("Player disconnected");
  });
});
