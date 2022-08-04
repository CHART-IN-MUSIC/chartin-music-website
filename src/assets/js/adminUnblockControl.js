import $ from "jquery";

const adminUnblockSection = document.getElementById("admin__unblock-section");

const init = () => {
  $(() => {
    $("button#unblock-user-btn").on("click", function () {
      const confirmBool = confirm("Are you sure you want to unblock this member?");
      if (confirmBool) {
        const dataID = $(this).attr("data-id");
        $.ajax({
          url: "/api/unblock-user",
          type: "POST",
          data: { dataID },
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

if (adminUnblockSection) {
  init();
}
