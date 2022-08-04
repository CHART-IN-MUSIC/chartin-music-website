import $ from "jquery";

const withdrawalPage = document.getElementById("dashboard__withdrawal");

const init = () => {
  $(document).ready(() => {
    // input 값 입력 시 border maincolor
    $("input.form__input").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() !== "") {
            $(this).addClass("active");

            // 이메일인 경우
            if ($(this).attr("type") === "email") {
              const regex = /\S+@\S+\.\S+/;
              if (!regex.test($(this).val())) {
                $(this).removeClass("active");
              }
            }
          } else {
            $(this).removeClass("active");
          }

          if ($("input.form__required").length === $("input.form__required.active").length) {
            $("button.withdrawal__btn").addClass("active");
          } else {
            $("button.withdrawal__btn").removeClass("active");
          }

          if ($(this).attr("type") === "number" && $(this).attr("name") !== "amount") {
            $(this).val(
              $(this)
                .val()
                .replace(/[^0-9]/gi, "")
            );
          }
        }, 1);
      });
    });

    // 인출요청 금액 입력값 소수 둘째자리 까지만 입력 가능하게
    $(`input.form__input[name="amount"]`)
      .off("keypress")
      .on("keypress", function (e) {
        var num = $(this).val();
        var _pattern1 = /^\d*[.]\d{2}$/;
        if (_pattern1.test(num)) {
          return false; // 현재 value 값이 소수점 둘째자리 숫자라면 더 이상 입력 X
        }
      });

    // 버튼 클릭 시 입력 인출요청 금액 보유금액보다 넘었는지 체크
    $("button.withdrawal__btn").click(function (e) {
      e.preventDefault();
      const amount = $(`input.form__input[name="amount"]`).val();
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
      if (requiredCheck) {
        alert("Please enter all required value");
      } else {
        $.ajax({
          url: "/api/check-withdrawal-amount",
          type: "POST",
          data: { amount },
          success: (result) => {
            if (result.msg === "fail") {
              alert(`Your requested amount is higher than what you have.`);
            } else {
              $("form#withdrawalForm").submit();
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

if (withdrawalPage) {
  init();
}
