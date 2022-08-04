import $ from "jquery";

const dashboarExpertDetailPage = document.getElementById("dashboard__expertDetail");

const init = () => {
  $(document).ready(() => {
    // 리뷰 별점 hover
    $("ul.rate__img-items li.toggle__star-item").each((j, elem) => {
      $(elem).mouseover(function () {
        $(`input[name="rate"]`).val($(this).index() + 1);
        if ($(this).hasClass("active")) {
          for (let i = 0; i < 5; i += 1) {
            if (i > $(this).index()) {
              $("ul.rate__img-items")
                .children(`li.toggle__star-item:nth-child(${i + 1})`)
                .children("img.item__star")
                .attr("src", `/images/expertDetail/full_star.png`);
              $("ul.rate__img-items")
                .children(`li.toggle__star-item:nth-child(${i + 1})`)
                .removeClass("active");
            }
          }
        } else {
          for (let i = 0; i < 5; i += 1) {
            if (i <= $(this).index()) {
              $("ul.rate__img-items")
                .children(`li.toggle__star-item:nth-child(${i + 1})`)
                .children("img.item__star")
                .attr("src", `/images/expertDetail/full_star_active.png`);
              $("ul.rate__img-items")
                .children(`li.toggle__star-item:nth-child(${i + 1})`)
                .addClass("active");
            }
          }
        }
      });
    });

    // 리뷰 등록
    $("button#createReviewBtn").click(function () {
      const desc = $(`textarea.form__textarea[name="desc"]`).val();
      // const rate = $(`input[name="rate"]`).val();
      const expertID = $(`input[name="expertID"]`).val();
      if (desc === "" || expertID === "") {
        alert("Please enter all required value");
      } else {
        $("form#reviewForm").submit();
      }
    });

    // 직접요청 버튼 클릭시 헤당전문가에게 서비스 요청
    $("button.request__btn").click(function () {
      const expertID = $(this).attr("data-expertID");
      // const musicianID = $(this).attr("data-musicianID");
      window.location.href = `/user/service-request/${expertID}`;
      // $.ajax({
      //   url: "/api/check-in-progress-service",
      //   type: "POST",
      //   data: { expertID, musicianID },
      //   success: (result) => {
      //     if (result.msg === "success") {

      //     } else {
      //       alert("The service is already in progress with the expert.");
      //     }
      //   },
      //   error: (err) => {
      //     alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
      //   },
      // });
    });
  });
};

if (dashboarExpertDetailPage) {
  init();
}
