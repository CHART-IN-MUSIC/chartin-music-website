import $ from "jquery";

const dashboardMyRequest = document.getElementById("dashboard__myRequest");

const init = () => {
  $(document).ready(() => {
    // Each Approve btn click
    $("button.item__approve-btn").each((i, elem) => {
      $(elem).click(function () {
        const requestedID = $(this).attr("data-id");
        const type = $(this).attr("data-type");
        const expertID = $(this).attr("data-expertID");
        const confirmBool = confirm("Do you really want to approve this service?");
        if (confirmBool) {
          $.ajax({
            url: "/api/change-requested-status",
            type: "POST",
            data: { requestedID, type, expertID },
            success: (result) => {
              if (result.msg === "success") {
                // do it your code.
                if ($(this).parents("li.myRequest__item").attr("data-id") === requestedID) {
                  $(this).parents("li.myRequest__item").find("h1.item__title.item__status").text("DONE");
                  $(this).parents("li.myRequest__item").find("h1.item__title.item__status").removeClass("item__status-RESULT");
                  $(this).parents("li.myRequest__item").find("h1.item__title.item__status").addClass("item__status-DONE");
                  $(this).remove();
                }
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

if (dashboardMyRequest) {
  init();
}
