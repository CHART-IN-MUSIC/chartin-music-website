import $ from "jquery";

const findPWPage = document.getElementById("findPW__page");

const init = () => {
  $(document).ready(() => {
    // 이메일 입력시 형식 체크 후 Done 버튼 활성화/비활성화
    $(`input.form__input[name="userID"]`).on("keyup paste", function () {
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
        // 6개 인증번호 랜덤으로 생성
        let authNum = "";
        for (let i = 0; i < 6; i += 1) {
          authNum += Math.floor(Math.random() * 10);
        }
        const email = $(`input.form__input[name="userID"]`).val();
        const userID = $(`input.form__input[name="userID"]`).val();
        $.ajax({
          url: "/api/find-id",
          type: "POST",
          data: { userID },
          success: (result) => {
            if (result.msg === "fail") {
              // 존재하는 아이디 없음
              $("button#findPW__modal-btn").click();
            } else {
              // 존재하는 아이디 있음 => 이메일 전송(인증코드)
              $.ajax({
                url: "/api/send-auth-password",
                type: "POST",
                data: { email, authNum },
                success: (result) => {
                  if (result.msg === "success") {
                    alert("Verification code has been sent.");
                    $(`input.form__input[name="authNum"]`).attr("data-email", email);
                    $(`input.form__input[name="authNum"]`).attr("data-authNum", authNum);
                    $(".form__password").addClass("active");
                    $(".findPW__subTitle-two").text(`A password reset email was just sent to ${email}.\r\n
                    Please follow the instructions on the email to reset your password.\r\n
                    You have 3 minutes to complete the whole process due to security reasons.`);
                    $(`input.form__input[name="userID"]`).attr("readonly", true);
                    $(this).addClass("none").removeClass("active");
                    $("button.form__pwCheck-btn").removeClass("none");
                  }
                },
                error: (err) => {
                  alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
                },
              });
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      }
    });

    // 인증번호 입력시 Check verification code 버튼 활성화/비활성화
    $(`input.form__input[name="authNum"]`).on("keyup paste", function () {
      setTimeout(() => {
        const authNum = $(this).val();
        if (authNum.length === 6) {
          $("button.form__pwCheck-btn").addClass("active");
          $(this).removeClass("form__error").addClass("active");
        } else {
          $("button.form__pwCheck-btn").removeClass("active");
          $(this).removeClass("active");
        }
      }, 1);
    });

    // 인증 번호 확인 버튼 클릭 시 맞는지 체크
    let verifyCheck = false;
    $("button.form__pwCheck-btn").click(function () {
      if ($(this).hasClass("active")) {
        const email = $(`input.form__input[name="userID"]`).val();
        const checkEmail = $(`input.form__input[name="authNum"]`).attr("data-email");
        const authNum = $(`input.form__input[name="authNum"]`).val();
        const checkAuthNum = $(`input.form__input[name="authNum"]`).attr("data-authNum");
        if (email !== checkEmail) {
          alert("Your email address is different to one you've just verified.");
          window.location.reload();
        } else if (authNum !== checkAuthNum) {
          alert("Verification code is incorrect.");
          $(`input.form__input[name="authNum"]`).val("").focus();
        } else {
          alert("Verfication has been completed.");

          $(`input.form__input[name="authNum"]`).prop("readonly", true);
          $("button.form__pwCheck-btn").removeClass("active").addClass("none");
          $(`input.form__input[name="userID"]`).on("unbind", "keyup");
          $(`input.form__input[name="authNum"]`).on("unbind", "keyup");
          $("button.form__changePW-btn").removeClass("none").addClass("active");
          verifyCheck = true;
        }
      }
    });

    // change password 클릭 시
    $("button.form__changePW-btn").click(function (e) {
      if ($(this).hasClass("active") && verifyCheck) {
        $("form#findPWForm").submit();
      } else {
        e.preventDefault();
      }
    });

    // 새비밀번호들 입력 시
    $(`input.resetPW__input`).each((i, elem) => {
      $(elem).keyup(function () {
        const pw = $(this).val();
        if (pw !== "") {
          $(this).addClass("active").removeClass("form__error");
        } else {
          $(this).removeClass("active");
        }
        if ($(`input.resetPW__input`).length === $(`input.resetPW__input.active`).length) {
          $("button.resetPW__submit-btn").addClass("active");
        } else {
          $("button.resetPW__submit-btn").removeClass("active");
        }
      });
    });
    // 새비밀번호 전송버튼 클릭 시
    $("button.resetPW__submit-btn").click(function () {
      const pw = $(`input.form__input[name="password"]`).val();
      const pw2 = $(`input.form__input[name="confirmPassword"]`).val();

      const pwCheck = pw === pw2;

      if ($(this).hasClass("active")) {
        if (!pwCheck) {
          alert("Your New Password and Confirm Password do not match.");
          $(`input.form__input[name="password"]`).addClass("form__error").removeClass("active");
          $(`input.form__input[name="confirmPassword"]`).addClass("form__error").removeClass("active");
          $(this).removeClass("active");
        } else {
          $("form#resetPWForm").submit();
        }
      }
    });
  });
};

if (findPWPage) {
  init();
}
