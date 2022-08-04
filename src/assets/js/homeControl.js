import $ from "jquery";

const homePage = document.getElementById("home__page");

const init = () => {
  $(document).ready(() => {
    // 페이지 로드되면 PC용 팝업 오픈
    const windowWidth = $(window).width();
    if (windowWidth >= 1440) {
      $("button#home__modal-btn").trigger("click");
    }

    // 하단 쿠키 정책 팝업 Accept, Reject 버튼 클릭 시 쿠키 저장
    $("button#cookie__accept-btn, button#cookie__reject-btn").click(() => {
      $.ajax({
        url: "/api/set-privacy-cookie",
        type: "POST",
        success: (result) => {
          if (result.msg === "success") {
            $("section.bottom__cookie-section").removeClass("active");
          }
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });
  });
};

if (homePage) {
  init();
}
