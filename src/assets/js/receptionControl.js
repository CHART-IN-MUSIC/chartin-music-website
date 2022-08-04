import $ from "jquery";

const dashboardReception = document.getElementById("dashboard__reception");

const init = () => {
  $(document).ready(() => {
    // Choose 버튼 클릭 시 이벤트
    $("a.feedback__choose-btn").each((i, elem) => {
      $(elem).click(function () {
        const totalOfferID = [];
        $("a.feedback__choose-btn").each((i2, elem2) => {
          totalOfferID.push($(elem2).attr("data-id"));
        });
        const confirmBool = confirm("Are you sure you want to choose this feedback?");
        if (confirmBool) {
          const feedbackID = $(this).attr("data-feedback");
          const selectedOfferID = $(this).attr("data-id");
          $.ajax({
            url: "/api/choose-feedback",
            type: "POST",
            data: { feedbackID, totalOfferID, selectedOfferID },
            success: (result) => {
              if (result.msg === "success") {
                window.location.href = "/user-musician/my-request";
              }
            },
            error: (err) => {
              alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
            },
          });
        }
      });
    });
  });
};

if (dashboardReception) {
  init();
}
