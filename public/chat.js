// const socket = io("http://localhost:3000");
const socket = io();
socket.on('connect', () => console.log(`socket.id: ${socket.id}`));