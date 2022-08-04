import $ from "jquery";

const adminExpertPage = document.getElementById("admin__expert-page");

const init = () => {
  $(document).ready(() => {
    // All 체크박스 클릭시 회원별 체크박스 토글기능
    $(`input.all__checkBox`).change(function () {
      const allChk = $(this).is(":checked");
      $("input.wait__checkBox").each((i, elem) => {
        if (allChk) {
          $(elem).prop("checked", true);
        } else {
          $(elem).prop("checked", false);
        }
      });
    });

    // 승인버튼 클릭 시 체크되어있는 회원 체크
    $("button#expert__approve-btn").click(function () {
      if ($(".wait__checkBox:checked").length !== 0) {
        $(`form#expertApprove`).submit();
      }
    });
  });
};

if (adminExpertPage) {
  init();
}
