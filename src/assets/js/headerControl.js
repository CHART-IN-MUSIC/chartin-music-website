import $ from "jquery";

const header = document.getElementById("header");

const init = () => {
  $(document).ready(() => {
    // 스크롤 시 PC 헤더 background-color 변경
    $(window).scroll(function () {
      const scrollTop = $(this).scrollTop();
      if (scrollTop === 0) {
        $("#header-flex-pc").css("backgroundColor", "transparent");
      } else {
        $("#header-flex-pc").css("backgroundColor", "rgba(22, 21, 26, 0.9)");
      }
    });

    // 모바일 햄버거 메뉴 버튼 클릭 시 토글
    $("button#header__hamburger-btn").click(function () {
      $(this).toggleClass("active");
      $("ul#header__menu-items").toggleClass("active");
      $("html").toggleClass("stopScroll");
    });

    // 메뉴명 active
    const currentUrl = window.location.pathname;
    $("ul.header__menu-items li.header__menu-item").each((i, elem) => {
      if (currentUrl === $(elem).attr("data-link") || currentUrl.includes($(elem).attr("data-link"))) $(elem).addClass("active");
    });

    // 유저 네임 클릭 시 토글
    $("a.header__menu-link.header__menu-toggle").click(function () {
      $(this).toggleClass("active");
      $(this).siblings("ul.header__myMenu-items").toggleClass("active");
    });

    // 헤더 알림 메뉴 클릭 시 토글
    $("button.header__alarm-item").each((i, elem) => {
      $(elem).click(function () {
        if ($(".alarm__flex").hasClass("active")) {
          $(".alarm__flex").removeClass("active");
        } else {
          $(".alarm__flex").addClass("active");
          const notReadArr = [];
          $("li.alarm__item.notRead__alarm").each((i, elem) => {
            notReadArr.push($(elem).attr("data-id"));
          });
          // 읽지 않은 알림 모두 읽음 처리
          if (notReadArr.length !== 0) {
            $.ajax({
              url: "/api/alarm-read",
              type: "POST",
              data: { notReadArr },
              success: (result) => {
                if (result.msg === "success") {
                  $("img.header__new-img").removeClass("active");
                }
              },
              error: (err) => {
                alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
              },
            });
          }
        }
      });
    });

    // 알림 메뉴 X 버튼 클릭 시 메뉴 닫힘
    $("button.alarm__close-btn").each((i, elem) => {
      $(elem).click(function () {
        $(".alarm__flex").removeClass("active");
      });
    });
  });
};

if (header) {
  init();
}
