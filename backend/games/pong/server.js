const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8180 });

let players = [];

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "full" }));
    ws.close();
    return;
  }

  const playerId = players.length;
  players.push(ws);
  ws.send(JSON.stringify({ type: "init", id: playerId }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Répondre aux pings
    if (data.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
      return;
    }

    // Relay (si pas un ping)
    players.forEach((p) => {
      if (p !== ws && p.readyState === WebSocket.OPEN) {
        p.send(message);
      }
    });
  });


  ws.on("close", () => {
    players = players.filter(p => p !== ws);
  });
});
