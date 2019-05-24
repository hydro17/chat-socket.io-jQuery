// const socket = io("http://localhost:3000");
$(function() {
  const newMessage = $("#newMessage");
  const messages = $("#messages")[0];

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

    const isFullyScrolledToBottom = messages.scrollHeight - (messages.offsetHeight + messages.scrollTop) < 40; 
    if (isFullyScrolledToBottom) { messages.scrollTop = messages.scrollHeight };

    socket.emit('chat message', message);
    newMessage.val('');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') messages.scrollTop -= 10;
    if (e.key === 'ArrowDown') messages.scrollTop += 10;
  });
});
