// const socket = io("http://localhost:3000");
$(function() {
  const messages = $("#messages-container")[0];
  let nickname;

  // eslint-disable-next-line no-undef
  const socket = io();
  socket.on("connect", onConnect);
  socket.on("disconnect", () => console.log(`disconnected`));
  socket.on("chat message", onChatMessage);

  function onConnect() {
    console.log(`socket.id: ${socket.id}`);
    nickname = sessionStorage.getItem("nickname");
    if (!nickname) {
      nickname = prompt("Type in your nickname:", "anonymous") || "anonymous";
      sessionStorage.setItem("nickname", nickname);
    }
    $("#nickname").html(nickname);
  }

  function onChatMessage(message) {
    $("#messages").append(`<li>${message}</li>`);

    const isFullyScrolledToBottom =
      messages.scrollHeight - (messages.offsetHeight + messages.scrollTop) < 40;

    if (isFullyScrolledToBottom) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  $("#newMessage").on("keyup", (e) => {
    if (e.key === "Enter") {
      e.target.dispatchEvent(new Event("submit"));
    }
  });

  // newMessage[0].onkeyup = (e) => {
  //   if (e.key === 'Enter') $(e.target).submit();
  // };

  $("form").submit((e) => {
    e.preventDefault();

    socket.emit("chat message", {
      nickname,
      content: $("#newMessage").val(),
    });

    $("#newMessage").val("");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") messages.scrollTop -= 10;
    if (e.key === "ArrowDown") messages.scrollTop += 10;
  });
});
