import $ from "jquery";

const changePW = document.getElementById("dashboard__changePW");

function init() {
  $(document).ready(() => {
    // input 값 입력 시
    $("input.form__input").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() !== "") {
            $(this).addClass("active");
          } else {
            $(this).removeClass("active");
          }
          // input 모두 active 일때 버튼 활성화
          if ($("input.form__input").length === $("input.form__input.active").length) {
            $("button.change__password-submit").addClass("active");
          } else {
            $("button.change__password-submit").removeClass("active");
          }
        }, 1);
      });
    });

    // 비밀번호 입력 후 버튼 클릭 시
    $("button.change__password-submit").on("click", (e) => {
      e.preventDefault();
      // 필수값 체크
      let requiredCheck = false;
      $(".form__required").each((i, elem) => {
        if ($(elem).val() === "" || $(elem).val().length === 0) {
          $(elem).addClass("form__error");
          requiredCheck = true;
        } else {
          $(elem).removeClass("form__error");
        }
        $(elem).focus(() => {
          $(elem).removeClass("form__error");
        });
      });
      // 비밀번호 일치 여부 체크

      const newPW = $(`input.form__input[name="newPW"]`).val();
      const confirmPW = $(`input.form__input[name="confirmPW"]`).val();
      let pwCheck = newPW !== confirmPW;
      if (requiredCheck) {
        alert("Please enter all required value");
        window.scrollTo(0, 0);
      } else if (pwCheck) {
        alert("Your New Password and Confirm Password do not match.");
        window.scrollTo(0, 0);
      } else {
        $("form#changePWForm").submit();
      }
    });
  });
}

if (changePW) {
  init();
}
