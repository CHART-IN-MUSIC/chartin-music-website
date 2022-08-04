import $ from "jquery";

const getHigherPage = document.getElementById("getHigher__page");

// 메인페이지 썸네일 스와이퍼
const thumbnamil = new Swiper(".swiper.mySwiper.thumbnailSwiper", {
  slidesPerView: "auto",
  spaceBetween: 20,
  // centeredSlides: true,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

// 메인페이지 파트너 스와이퍼
const partnerLogo = new Swiper(".swiper.mySwiper.partnerSwiper", {
  loop: true,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
  },
  allowTouchMove: false,
  slidesPerView: "auto",
  speed: 4000,
});

if (getHigherPage) {
  const activeIndex = $(".swiper.mission__swiper#mission__swiper").attr("data-index");
  // Get Higher 미션 스와이퍼
  const missionSwiper = new Swiper(".swiper.mission__swiper#mission__swiper", {
    slidesPerView: "auto",
    spaceBetween: 20,
    breakpoints: {
      1440: {
        slidesPerView: 3,
      },
      1920: {
        slidesPerView: 4,
      },
    },
  });
  missionSwiper.slideTo(activeIndex);
}

// reception page choose card swiper
const reception = new Swiper(".swiper.mySwiper.receptionSwiper", {
  // slidesPerView: 1,
  slidesPerView: "auto",
  direction: "vertical",
  breakpoints: {
    1440: {
      slidesPerView: "auto",
      spaceBetween: 40,
      direction: "horizontal",
      navigation: {
        nextEl: "#dashboard__reception .swiper__navigation-next",
        prevEl: "#dashboard__reception .swiper__navigation-prev",
      },
    },
  },
});

// video detail page
const videoDetail = new Swiper(".swiper.mySwiper.videoDetailSwiper", {
  slidesPerView: "auto",
});

// Review mobile
const review = new Swiper(".swiper.mySwiper.reviewSwiper", {
  slidesPerView: "auto",
});
