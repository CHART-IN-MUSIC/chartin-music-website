import $ from "jquery";

const findIDPage = document.getElementById("findID__page");

const init = () => {
  $(document).ready(() => {
    // 이메일 입력시 형식 체크 후 Done 버튼 활성화/비활성화
    $("input.form__input").on("keyup paste", function () {
      setTimeout(() => {
        const email = $(this).val();
        const regex = /\S+@\S+\.\S+/;
        if (regex.test(email)) {
          $("button.form__submit-btn").addClass("active");
          $(this).removeClass("form__error").addClass("active");
        } else {
          $("button.form__submit-btn").removeClass("active");
          $(this).removeClass("active").addClass("form__error");
        }
        if (email === "") {
          $(this).removeClass("active form__error");
        }
      }, 1);
    });

    // Done 버튼 활성화 시 이메일 존재 검증
    $("button.form__submit-btn").click(function () {
      if ($(this).hasClass("active")) {
        const userID = $("input.form__input").val();
        $.ajax({
          url: "/api/find-id",
          type: "POST",
          data: { userID },
          success: (result) => {
            if (result.msg === "fail") {
              // 존재하는 아이디 없음
              const alertText = $("h1.modal__subTitle").text(`The email address provided is not registered on our website.\nPlease proceed to sign-up.`);
              alertText.html(alertText.html().replace(/\n/g, `<br/>`));
              $("button#findID__modal-btn").click();
            } else {
              // 존재하는 아이디 있음
              const alertText = $("h1.modal__subTitle").text(`The email address provided is registered.\nTo find password, please visit our 'find your password' page.`);
              alertText.html(alertText.html().replace(/\n/g, `<br/>`));
              $("button#findID__modal-btn").click();
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      }
    });
  });
};

if (findIDPage) {
  init();
}
