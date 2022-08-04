import $ from "jquery";

const newsRoomPage = document.getElementById("newsRoom__page");

const init = () => {
  $(document).ready(() => {
    // 뉴스 카테고리, 지역 값 query 생성 및 페이지 이동 함수
    const selectExec = () => {
      const newsCategoryID = $("select#newsCategory").val();
      const region = $("select#newsRegion").val();
      let categoryQuery = ``;
      if (newsCategoryID !== "All") {
        categoryQuery = `category=${newsCategoryID}&`;
      }
      window.location.href = `/news-room?${categoryQuery}region=${region}`;
    };

    // 뉴스 카테고리 선택 시
    $("select#newsCategory").change(function () {
      selectExec();
    });
    // 지역 값 선택시
    $("select#newsRegion").change(function () {
      selectExec();
    });
  });
};

if (newsRoomPage) {
  init();
}
