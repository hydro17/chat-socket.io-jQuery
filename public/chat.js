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
      nickname = newNickname("Type in your nickname:", "anonymous");
    }
    $("#nickname").html(nickname);
  }

  function newNickname(nicknameQuestion, currentNickname) {
    const nickname = prompt(nicknameQuestion, currentNickname) || currentNickname;
    sessionStorage.setItem("nickname", nickname);
    return nickname;
  }

  function onChatMessage(message) {
    $("#messages").append(`<li>${message}</li>`);

    const isFullyScrolledToBottom =
      messages.scrollHeight - (messages.offsetHeight + messages.scrollTop) < 40;

    if (isFullyScrolledToBottom) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  $("#input-message").on("keyup", (e) => {
    if (e.key === "Enter") {
      e.target.dispatchEvent(new Event("submit"));
    }
  });

  // newMessage[0].onkeyup = (e) => {
  //   if (e.key === 'Enter') $(e.target).submit();
  // };

  $("form").submit((e) => {
    e.preventDefault();

    if ($("#input-message").val() === "") return;

    socket.emit("chat message", {
      nickname,
      content: $("#input-message").val(),
    });

    $("#input-message").val("");
  });

  $("#nickname").contextmenu((e) => {
    e.preventDefault();

    $("#context-menu")
      .css({ left: e.pageX, top: e.pageY })
      .removeClass("hidden");

    $(window).on("keyup", (e) => {
      if (e.key === "Escape") {
        $("#context-menu").addClass("hidden");
      }
    });
  });

  $("#context-menu").on("click", (e) => {
    $(e.target).addClass("hidden");
    nickname = newNickname("Type in your new nickname:", nickname) || nickname;
    setTimeout(() => $("#nickname").html(nickname), 1);
  });

  $(window).on("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      messages.scrollTop -= 10;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      messages.scrollTop += 10;
    }
  });
});
