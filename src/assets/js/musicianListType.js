import $ from "jquery";

const musicianListTypePage = document.getElementById("musicianList__type-page");

const init = () => {
  $(document).ready(() => {
    // select option change
    const selectExec = () => {
      const type = $(".header__select-flex").attr("data-type");
      const country = $("select#musicianCountry").val();
      const genre = $("select#musicianGenre").val();
      let query = ``;
      if (country === "" && genre === "") {
        query = ``;
      } else if (country === "" && genre !== "") {
        query = `&genre=${genre}`;
      } else if (country !== "" && genre === "") {
        query = `&country=${country}`;
      } else {
        query = `&country=${country}&genre=${genre}`;
      }
      window.location.href = `/musician-list/type?type=${type}${query}`;
    };

    // 지역 선택 시
    $("select#musicianCountry").change(function () {
      selectExec();
    });
    // 장르 선택시
    $("select#musicianGenre").change(function () {
      selectExec();
    });
  });
};

if (musicianListTypePage) {
  init();
}
