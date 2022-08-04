import $ from "jquery";

const adminBlockSection = document.getElementById("admin__block-section");

const init = () => {
  $(() => {
    $("button#block-user-btn").on("click", function () {
      const confirmBool = confirm("Are you sure you want to block this member?");
      if (confirmBool) {
        const userID = $(this).attr("data-id");
        $.ajax({
          url: "/api/block-user",
          type: "POST",
          data: { userID },
          success: (result) => {
            if (result.msg === "success") {
              window.location.reload();
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      }
    });
  });
};

if (adminBlockSection) {
  init();
}
