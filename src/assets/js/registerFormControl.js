import $ from "jquery";

const registerForm = document.getElementById("registerForm__page");

function init() {
  $(document).ready(() => {
    // gradient 색상 클릭 시 프로필 색상 변경
    $(".item__circle").each((i, elem) => {
      $(elem).click(function () {
        const backgroundLinear = $(this).attr("data-color");
        $(".profile__circle").css("background", backgroundLinear);
        $(`input.form__input[name="gradientColor"]`).val(backgroundLinear);
      });
    });

    // 이메일 주소 입력 시 형식 체크 후 '인증 받기' 버튼 활성화/비활성화
    $(`input.form__input[name="userID"]`).keyup(function () {
      const email = $(this).val();
      const regex = /\S+@\S+\.\S+/;
      if (regex.test(email)) {
        $("button.email__auth-btn").addClass("active");
      } else {
        $("button.email__auth-btn").removeClass("active");
      }
    });

    // 인증 받기 버튼 클릭 시 인증 번호 메일전송 [활성화된 경우만]
    $("button.email__auth-btn").click(function () {
      if ($(this).hasClass("active")) {
        const email = $(`input.form__input[name="userID"]`).val();
        // 6개 인증번호 랜덤으로 생성
        let authNum = "";
        for (let i = 0; i < 6; i += 1) {
          authNum += Math.floor(Math.random() * 10);
        }
        // 차단 되어 있는 이메일인지 && 이미 가입되어 있는 메일주소인지 체크
        $.ajax({
          url: "/api/email-duple-chk",
          type: "POST",
          data: { email },
          success: (result) => {
            if (result.msg === "blocked") {
              alert("Your email address has been blocked due to certain reasons. If you want to join us, please contact to info@chartinmusic.com");
              window.location.href = "/";
            } else if (result.users) {
              // 가입 되어 있는 메일주소라면 알람 후 입력된 값 초기화
              alert("This email address is already registered.");
              $(`input.form__input[name="userID"]`).val("").focus();
              $("button.email__auth-btn").removeClass("active");
            } else {
              // 가입 되어 있지 않다면 인증번호 전송 진행
              $.ajax({
                url: "/api/send-auth-email",
                type: "POST",
                data: { email, authNum },
                success: (result) => {
                  if (result.msg === "success") {
                    $(`input.form__input[name="authNum"]`).attr("data-email", email);
                    $(`input.form__input[name="authNum"]`).attr("data-authNum", authNum);
                    alert("Verification code has been sent.");
                    $(".form__flex#verification__code").addClass("active");
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

    // 인증 번호 입력 시 형식 체크 후 '인증 번호 확인' 버튼 활성화/비활성화
    $(`input.form__input[name="authNum"]`).on("keyup", function () {
      const authNum = $(this).val();
      if (authNum.length === 6) {
        $(`input.form__input[name="authNum"]`).addClass("active");
        $("button.email__auth2-btn").addClass("active");
      } else {
        $(`input.form__input[name="authNum"]`).removeClass("active");
        $("button.email__auth2-btn").removeClass("active");
      }
    });
    $(`input.form__input[name="authNum"]`).on("bind", {
      paste: () => {
        $(`input.form__input[name="authNum"]`).addClass("active");
        $("button.email__auth2-btn").addClass("active");
      },
    });

    // 인증 번호 확인 버튼 클릭 시 맞는지 체크
    let verifyCheck = true;
    $("button.email__auth2-btn").on("click", function () {
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
          $(`input.form__input[name="userID"]`).prop("readonly", true);
          $(`input.form__input[name="authNum"]`).prop("readonly", true);
          $("button.email__auth-btn").removeClass("active");
          $("button.email__auth2-btn").removeClass("active");
          $(`input.form__input[name="userID"]`).unbind("keyup");
          $(`input.form__input[name="authNum"]`).unbind("keyup");
          $("button.form__btn.email__auth2-btn").text("Verified!");
          $(`input.form__input[name="password"]`).focus();
          verifyCheck = false;
        }
      }
    });

    // 필수 값 입력 체크
    const checkValActiveLen = () => {
      const valLen = $(".form__validation").length;
      const valActiveLen = $(".form__validation.active").length;
      const valLenBool = valLen === valActiveLen;
      const reqLen = $(".form__required").length;
      const reqActiveLen = $(".form__required.active").length;
      const reqLenBool = reqLen === reqActiveLen;
      console.log(valLen, valActiveLen, valLenBool, reqLen, reqActiveLen, reqLenBool);
    };

    // 필수 값 모두 활성화시 버튼 활성화
    const checkFormValidation = () => {
      checkValActiveLen();
      if ($(".form__validation").length === $(".form__validation.active").length) {
        $("button.resigterForm__submit-btn").addClass("active");
      } else {
        $("button.resigterForm__submit-btn").removeClass("active");
      }
      $(".form__validation").each((i, elem) => {
        $(elem).on("keyup change paste", () => {
          checkValActiveLen();
          if ($(".form__validation").length === $(".form__validation.active").length) {
            $("button.resigterForm__submit-btn").addClass("active");
          } else {
            $("button.resigterForm__submit-btn").removeClass("active");
          }
        });
        $(elem).on("paste", () => {
          if ($(".form__validation").length === $(".form__validation.active").length) {
            $("button.resigterForm__submit-btn").addClass("active");
          }
        });
      });
      $(".form__validation").bind("input paste", function () {
        $(this).trigger("keyup");
      });
    };

    // 소셜 미디어 클릭 시 이벤트
    $("li.socialMedia__item .socialMedia__item-flex:first-child").each((i, elem) => {
      $(elem).click(function () {
        const activeBool = $(this).parents("li.socialMedia__item").hasClass("active");
        const thisInputSocial = $(this).parents("li.socialMedia__item").find("input.form__input.form__input-social");
        if (activeBool) {
          $(this).parents("li.socialMedia__item").removeClass("active");
          $(this).find("img.socialMedia__plus-img").attr("src", "/images/register/plus_icon@3x.png");
          $(thisInputSocial).val("");
          $(thisInputSocial).removeClass("form__required form__validation active");
          checkFormValidation();
        } else {
          $(this).parents("li.socialMedia__item").addClass("active");
          $(this).find("img.socialMedia__plus-img").attr("src", "/images/register/plus_icon_active@3x.png");
          $(thisInputSocial).focus();
          $(thisInputSocial).addClass("form__required form__validation");
          checkFormValidation();
        }
      });
    });
    // 소셜 미디어 input 값 입력 시 이벤트
    $("input.form__input.form__input-social").each((i, elem) => {
      $(elem).on("keyup", function () {
        const inputVal = $(this).val();
        const thisImg = $(this).parents("li.socialMedia__item").find("img.socialMedia__plus-img");
        if (inputVal.length === 0) {
          $(thisImg).attr("src", "/images/register/plus_icon_active@3x.png");
        } else {
          $(thisImg).attr("src", "/images/register/checked_icon@3x.png");
        }
      });
      $(elem).on("paste", () => {
        const thisImg = $(elem).parents("li.socialMedia__item").find("img.socialMedia__plus-img");
        $(thisImg).attr("src", "/images/register/checked_icon@3x.png");
      });
    });

    // 모든 form값 있으면 border mainColor / 없으면 remove border mainColor
    $("input").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        if ($(this).val() === "") {
          $(this).removeClass("active");
        } else {
          $(this).addClass("active");
        }
      });
    });
    $("input").bind("input paste", function () {
      $(this).trigger("keyup");
    });
    $("textarea").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        if ($(this).val() === "") {
          $(this).removeClass("active");
        } else {
          $(this).addClass("active");
        }
      });
    });
    $("textarea").bind("input paste", function () {
      $(this).trigger("keyup");
    });
    $(`input.form__option`).each((i, elem) => {
      $(elem).on("change paste", function () {
        if ($(`input.form__option:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    $(".form__required").each((i, elem) => {
      $(elem).on("keyup change paste", () => {
        checkValActiveLen();
        if ($(".form__required").length === $(".form__required.active").length) {
          $("button.resigterForm__submit-btn").addClass("active");
        } else {
          $("button.resigterForm__submit-btn").removeClass("active");
        }
      });
    });
    // 링크입력값들 검증
    $(".form__link").each((i, elem) => {
      $(elem).keyup(function () {
        const link = $(this).val();
        const linkURL =
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})/gi;

        const regex = new RegExp(linkURL);
        if (link === "") {
          $(this).removeClass("active");
          $(this).removeClass("form__error");
        } else if (link.match(regex)) {
          $(this).addClass("active");
          $(this).removeClass("form__error");
        } else {
          $(this).removeClass("active");
          $(this).addClass("form__error");
        }
      });
    });

    // 회원가입 버튼 클릭 시 입력값 검증 후 Submit
    $("button.resigterForm__submit-btn").click(() => {
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
      const pw1 = $(`input.form__input[name="password"]`).val();
      const pw2 = $(`input.form__input[name="password2"]`).val();
      const pwCheck = pw1 !== pw2;

      if (verifyCheck) {
        alert("Please verify the email address.");
        window.scrollTo(0, 0);
      } else if (requiredCheck || !$("button.resigterForm__submit-btn").hasClass("active")) {
        // FIXME: 모바일 에러 테스트를 위한 팝업 알림 띄우는 코드
        // let errorSectionNumber = 0;
        // const valLen = $(".form__validation").length;
        // const valActiveLen = $(".form__validation.active").length;
        // $(".form__validation").each((i, elem) => {
        //   if (!$(elem).hasClass("active")) {
        //     errorSectionNumber = i;
        //   }
        // });
        // const valLenBool = valLen === valActiveLen;
        // const reqLen = $(".form__required").length;
        // const reqActiveLen = $(".form__required.active").length;
        // const reqLenBool = reqLen === reqActiveLen;
        // alert(`Please enter all required value. errorIndex=${errorSectionNumber}  ${valLen},${valActiveLen},${valLenBool},${reqLen},${reqActiveLen},${reqLenBool},`);
        window.scrollTo(0, 0);
      } else if (pwCheck) {
        alert("Please confirm password.");
        window.scrollTo(0, 0);
      } else {
        const name = $(`input.form__input[name="name"]`).val();
        $.ajax({
          url: "/api/check-name",
          type: "POST",
          data: { name },
          success: (result) => {
            if (result.msg === "success") {
              $("form#registerForm").submit();
            } else {
              alert("A user with this nickname already exists.");
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      }
    });
  });
}

if (registerForm) {
  init();
}
