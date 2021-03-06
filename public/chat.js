// const socket = io("http://localhost:3000");
$(function() {
  const messages = $("#messages-container")[0];
  let nickname;

  // eslint-disable-next-line no-undef
  const socket = io();
  socket.on("connect", onConnect);
  socket.on("disconnect", () => {
    console.log("client side - disconnected");
  });
  socket.on("chat message", onChatMessage);
  socket.on("is typing", onIsTyping);
  socket.on("is not typing", onIsNotTyping);
  socket.on("update users list", (usersListArray) => {
    let usersListHtml = "";
    usersListArray.forEach((nickname) => {
      usersListHtml += `<li>${nickname}</li>`;
      // $("#users-list").append(`<li>${nickname}</li>`);
    });
    $("#users-list").html(usersListHtml);
  });

  function onConnect() {
    console.log(`socket.id: ${socket.id}`);

    nickname = sessionStorage.getItem("nickname");
    if (!nickname) {
      nickname = newNickname("Type in your nickname:", "anonymous");
    }

    socket.emit("add user", nickname);

    $("#nickname").html(nickname);
  }

  function newNickname(nicknameQuestion, currentNickname) {
    const nickname = prompt(nicknameQuestion, currentNickname) || currentNickname;
    sessionStorage.setItem("nickname", nickname);
    return nickname;
  }

  function onChatMessage(message) {
    removeIsTypingItem(message.nickname);
    $("#messages").append(
      $(`<li><strong>${message.nickname}</strong>: ${message.content}</li>`)
        .delay(50)
        .hide()
        .fadeIn()
    );
    scrollBottomMessagesWindow();
  }

  function onIsTyping(isTypingInfo) {
    console.log(`${isTypingInfo} - ${new Date().toLocaleString()}`);
    $("#is-typing").append(`<li>${isTypingInfo}</li>`);
    scrollBottomMessagesWindow();
  }

  function onIsNotTyping(nickname) {
    console.log(`is not typing ${nickname} - ${new Date().toLocaleString()}`);
    removeIsTypingItem(nickname);
  }

  function removeIsTypingItem(nickname) {
    // $("#is-typing > li:contains(" + nickname + ")").remove();
    $("#is-typing > li:contains(" + nickname + ")").fadeOut(50);
  }

  function scrollBottomMessagesWindow() {
    const isFullyScrolledToBottom =
      messages.scrollHeight - messages.offsetHeight - messages.scrollTop < 40;

    if (isFullyScrolledToBottom) {
      if (messages.scrollTop - 1 < messages.scrollHeight - messages.offsetHeight) {
        softScrollDown();
      }
      // messages.scrollTop = messages.scrollHeight;
    }
  }

  function softScrollDown() {
    if (messages.scrollTop - 2 < messages.scrollHeight - messages.offsetHeight) {
      ++messages.scrollTop;
      setTimeout(softScrollDown, 30);
    }
  }

  $("#input-message").on("keyup", (e) => {
    if (e.key === "Enter") {
      e.target.dispatchEvent(new Event("submit"));
      return;
    }
    // console.log(e.key);
    if (e.key === "ArrowUp" || e.key === "ArrowDown") return;

    socket.emit("is typing", nickname);
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
    setTimeout(() => {
      const oldNickname = nickname;
      nickname = newNickname("Type in your new nickname:", nickname) || nickname;
      socket.emit("remove user", oldNickname);
      socket.emit("add user", nickname);
      $("#nickname").html(nickname);
    }, 1);
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
