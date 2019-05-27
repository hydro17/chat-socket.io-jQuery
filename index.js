const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let connectionsCount = 0;
let isTypingLastActivity = new Map();
let checkingUserActivity;

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(
    `a user connected - number of connections: ${++connectionsCount} at ${new Date().toLocaleString()}`
  );

  socket.on("disconnect", () => console.log("a user disconnected"));

  socket.on("chat message", (message) => {
    io.emit("chat message", message);
    isTypingLastActivity.delete(message.nickname);
  });

  socket.on("is typing", (nickname) => {
    // console.log("from is typing ", isTypingLastActivity);
    if (!isTypingLastActivity.has(nickname)) {
      io.emit("is typing", `${nickname} is typing`);
    }

    isTypingLastActivity.set(nickname, Date.now());

    if (!checkingUserActivity) {
      checkingUserActivity = setInterval(checkUserActivity, 1000);
    }
  });
});

function checkUserActivity() {
  // console.log("from checkUserActivity ", isTypingLastActivity);
  if (isTypingLastActivity.size === 0) {
    clearInterval(checkingUserActivity);
    checkingUserActivity = null;
    return;
  }

  isTypingLastActivity.forEach((lastActivity, nickname) => {
    if (Date.now() - lastActivity > 5000) {
      io.emit("is not typing", nickname);
      isTypingLastActivity.delete(nickname);
    }
  });
}

http.listen(3000, () => console.log("listening on port: 3000..."));
