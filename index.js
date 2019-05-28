const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let connectionsCount = 0;
let isTypingLastActivity = new Map();
let checkingUserActivity;
let usersList = new Map();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(
    `a user connected - number of connections: ${++connectionsCount} at ${new Date().toLocaleString()}`
  );

  // usersList.push();

  socket.on("disconnect", onDisconnect);
  socket.on("chat message", onChatMessage);
  socket.on("is typing", onIsTyping);

  socket.on("add user", onAddUser);
  socket.on("remove user", onRemoveUser);
});

function onAddUser(nickname) {
  usersList.set(this, nickname);
  console.log(`on add user: `, logMap(usersList), ` - ${new Date().toLocaleString()}`);
  io.emit("update users list", Array.from(usersList.values()));
}

function onRemoveUser() {
  usersList.delete(this);
  console.log(`on remove user: ${logMap(usersList)} - ${new Date().toLocaleString()}`);
  io.emit("update users list", Array.from(usersList.values()));
}

function onDisconnect() {
  usersList.delete(this);
  console.log(`a user disconnected: ${logMap(usersList)} - ${new Date().toLocaleString()}`);
}

function logMap(map) {
  // map.forEach((nickname) => console.log(nickname));
  return Array.from(map.values());
}

function onChatMessage(message) {
  io.emit("chat message", message);
  isTypingLastActivity.delete(message.nickname);
}

function onIsTyping(nickname) {
  // console.log("from is typing ", isTypingLastActivity);
  if (!isTypingLastActivity.has(nickname)) {
    io.emit("is typing", `${nickname} is typing`);
  }

  isTypingLastActivity.set(nickname, Date.now());

  if (!checkingUserActivity) {
    checkingUserActivity = setInterval(checkUserActivity, 1000);
  }
}

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
