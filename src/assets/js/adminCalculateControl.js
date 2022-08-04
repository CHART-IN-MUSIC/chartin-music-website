import $ from "jquery";

const adminCalculatePage = document.getElementById("admin__calculate-page");

const init = () => {
  $(document).ready(() => {
    // 년도 + 월 기준으로 정산내역 검색
    $("input#search__month-input").change(function () {
      const page = $(this).attr("data-page");
      const value = $(this).val();
      window.location.href = `/admin/${page}?searchByMonth=${value}`;
    });

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

    // 정산 승인 클릭 시
    $("button#approve__withdrawal-btn").click(function () {
      $("input.wait__checkBox").each((i, elem) => {
        if ($("input.wait__checkBox:checked").length !== 0) {
          $(`form#calculateApproveForm`).submit();
        }
      });
    });
  });
};

if (adminCalculatePage) {
  init();
}
