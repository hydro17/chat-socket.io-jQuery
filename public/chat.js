// const socket = io("http://localhost:3000");
$(function() {
  const newMessage = $("#newMessage");

  const socket = io();
  socket.on('connect', () => console.log(`socket.id: ${socket.id}`));
  socket.on('chat message', (message) => $('#messages').append(`<li>${message}</li>`));

  newMessage[0].onkeyup = (e) => {
    if (e.key === 'Enter') e.target.dispatchEvent(new Event('submit'))
  };

  // newMessage[0].onkeyup = (e) => {
  //   if (e.key === 'Enter') $(e.target).submit();
  // };

  $('form').submit((e) => {
    e.preventDefault();
    const message = newMessage.val();
    $('#messages').append(`<li>${message}</li>`);
    socket.emit('chat message', message);
    newMessage.val('');
  });
});
