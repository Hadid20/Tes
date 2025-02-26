const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8000 });

wss.on("connection", function connection(ws) {
  console.log("Player Connected!");

  ws.on("message", function incoming(message) {
    try {
      let data = JSON.parse(message);

      if (data.event === "move") {
        console.log(
          `Player ${data.player} moved to X: ${data.x} with message: ${data.message}`
        );

        // Kirim posisi X, pesan, dan ID player ke semua pemain lain
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                event: "update_position",
                player: data.player,
                x: data.x,
                message: data.message,
              })
            );
          }
        });
      }
    } catch (error) {
      console.log("Invalid JSON data:", message.toString());
    }
  });
});
