const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8000 });

let rooms = {}; // Menyimpan data room dan pemain

wss.on("connection", function connection(ws) {
  console.log("Player Connected!");

  ws.on("message", function incoming(message) {
    try {
      let data = JSON.parse(message);
      console.log("Received Data:", data); // Log semua data yang diterima

      if (data.action === "join_room") {
        let roomName = data.room;
        let username = data.username;

        if (!rooms[roomName]) {
          rooms[roomName] = {};
        }

        rooms[roomName][username] = ws;
        ws.room = roomName;
        ws.username = username;

        console.log(`User ${username} joined room: ${roomName}`);
        console.log("Current Rooms State:", rooms);
      }

      if (data.action === "move") {
        let roomName = ws.room;
        let username = ws.username;

        if (roomName && rooms[roomName]) {
          console.log(
            `Player ${username} moved to x: ${data.x} in room: ${roomName}`
          );

          let payload = JSON.stringify({
            action: "update_position",
            username: username,
            x: data.x,
          });

          // Kirim posisi ke semua pemain dalam room yang sama
          Object.keys(rooms[roomName]).forEach((player) => {
            if (rooms[roomName][player] !== ws) {
              rooms[roomName][player].send(payload);
            }
          });
        }
      }
    } catch (error) {
      console.log("Error parsing message:", error);
    }
  });

  ws.on("close", function close() {
    if (ws.room && rooms[ws.room]) {
      console.log(`Player ${ws.username} disconnected from room: ${ws.room}`);
      delete rooms[ws.room][ws.username];

      if (Object.keys(rooms[ws.room]).length === 0) {
        delete rooms[ws.room];
        console.log(`Room ${ws.room} is now empty and deleted.`);
      }
    }
  });
});

console.log("WebSocket server running on ws://localhost:8000");
