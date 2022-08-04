import $ from "jquery";

const musicianMyStudio = document.getElementById("dashboard__musician-myStudio");

const musiciaMyStudioInit = () => {
  $(document).ready(() => {
    // Goal 수정 버튼 클릭 시
    $("button.goal__update-btn").each((i, elem) => {
      $(elem).click(function () {
        $(this).removeClass("active");
        $(this).siblings("button.goal__done-btn").addClass("active");
        $(this).siblings("textarea.goal__desc-textarea").prop("readonly", false);
        $(this).siblings("textarea.goal__desc-textarea").focus();
      });
    });

    // 수정 상태에서 Done 버튼 클릭 시
    $("button.goal__done-btn").each((i, elem) => {
      $(elem).click(function () {
        const goalID = $(this).attr("data-id");
        const desc = $(this).siblings("textarea.goal__desc-textarea").val();
        $.ajax({
          url: "/api/myStudio-goal",
          type: "POST",
          data: { goalID, desc },
          success: (result) => {
            if (result.msg === "success") {
              // do it your code.
              $(this).removeClass("active");
              $(this).siblings("button.goal__update-btn").addClass("active");
              $(this).siblings("textarea.goal__desc-textarea").prop("readonly", true);
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      });
    });

    // Customized Payment 입력값 소수 둘째자리 까지만 입력 가능하게
    $(`input.price__input[name="amount"]`)
      .off("keypress")
      .on("keypress", function (e) {
        var num = $(this).val();
        var _pattern1 = /^\d*[.]\d{2}$/;
        if (_pattern1.test(num)) {
          return false; // 현재 value 값이 소수점 둘째자리 숫자라면 더 이상 입력 X
        }
      });

    // Customized Payment 결제 버튼 클릭 시
    $("button.customPay__purchase-btn").click(function () {
      const amount = parseFloat($(`input.price__input[name="amount"]`).val());
      if (!amount) {
        alert("Enter payment amount.");
        $(`input.price__input[name="amount"]`).val("");
        $(`input.price__input[name="amount"]`).focus();
      } else {
        $.ajax({
          url: "/api/myStudio-purchase-form",
          type: "POST",
          data: { amount },
          success: (result) => {
            if (result.msg === "success") {
              // do it your code.
              $("#created__purchase-form").append(result.purchaseForm);
              $("form#fasterpay_payment_form").submit();
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

if (musicianMyStudio) {
  musiciaMyStudioInit();
}
