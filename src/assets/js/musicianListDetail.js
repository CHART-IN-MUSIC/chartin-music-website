import $ from "jquery";

const musicianListDetailPage = document.getElementById("musicianList__detail-page");

const init = () => {
  $(document).ready(() => {
    // 이미 제안한 요청의 경우 팝업 미오픈
    $("button.request__btn").click(function () {
      $(this).siblings("button.request__modal-btn").click();
    });
  });
};

if (musicianListDetailPage) {
  init();
}
