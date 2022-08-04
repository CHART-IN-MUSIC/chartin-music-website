import $ from "jquery";

const dashboardChat = document.getElementById("dashboard__chat");
const dashboardChatDetail = document.getElementById("dashboard__chatDetail");

const init = () => {
  $(document).ready(() => {
    // 채팅방 나가기 버튼 클릭 시
    $("button.chat__leave-btn").each((i, elem) => {
      $(elem).click(function () {
        const confirmBool = confirm("Are you sure?\r\nThis chat will disppear out of your chat rooms.");
        if (confirmBool) {
          const chatID = $(this).attr("data-id");
          const userRole = $(this).attr("data-role");
          $.ajax({
            url: "/api/leave-chat",
            type: "POST",
            data: { chatID },
            success: (result) => {
              if (result.msg === "success") {
                window.location.href = `/user-${userRole}/chat`;
              }
            },
            error: (err) => {
              alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
            },
          });
        }
      });
    });

    // 채팅창 엔터키 입력 시 전송, 시프트 + 엔터키 입력 시 줄바꿈
    $("#chat__textarea").keydown((e) => {
      const keyCode = e.which || e.keyCode;
      if (keyCode === 13 && !e.shiftKey) {
        // Don't generate a new line
        e.preventDefault();

        // Do something else such as send the message to back-end
        $("#chat__form-submit").click();
      }
    });

    // 채팅내용 입력 시 send button 활성화
    $("textarea#chat__textarea").on("keyup paste", function () {
      setTimeout(() => {
        const desc = $(this).val();
        if (desc === "") {
          $("button#chat__form-submit").removeClass("active");
        } else {
          $("button#chat__form-submit").addClass("active");
        }
      }, 1);
    });

    // 특수기호 치환
    $("p.user__unread-message").each((i, elem) => {
      const encodedString = $(elem).text();
      $(elem).html(encodedString).text();
    });
  });
};

if (dashboardChat || dashboardChatDetail) {
  init();
}
