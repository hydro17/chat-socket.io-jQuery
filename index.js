const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let connectionsCount = 0;
let isTypingLastActivity;
let checkingUserActivity;

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(
    `a user connected - number of connections: ${++connectionsCount} at ${new Date().toLocaleString()}`
  );

  socket.on("disconnect", () => console.log("a user disconnected"));

  socket.on("chat message", (message) =>
    io.emit("chat message", `<strong>${message.nickname}</strong>: ${message.content}`)
  );

  socket.on("is typing", (nickname) => {
    isTypingLastActivity = Date.now();
    io.emit("is typing", `<em>${nickname} is typing</em>`);
    if (isTypingLastActivity) {
      checkingUserActivity = setInterval(checkUserActivity, 1000);
    }
  });
});

function checkUserActivity() {
  if (Date.now() - isTypingLastActivity > 3000) {
    io.emit("is typing", "");
    isTypingLastActivity = null;
    clearInterval(checkingUserActivity);
  }
}

http.listen(3000, () => console.log("listening on port: 3000..."));
