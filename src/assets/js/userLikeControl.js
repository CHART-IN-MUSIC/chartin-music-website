import $ from "jquery";

const changeUserLike = document.getElementById("changeUserLike");

function init() {
  $(document).ready(() => {
    // 뮤지션, 전문가 좋아요 생성

    $(".user__like-flex#changeUserLike button.user__like-btn")
      .off("click")
      .on("click", function () {
        $(this).attr("disabled", "disabled");
        const type = $(this).attr("id");
        const likeID = $(this).attr("data-likeID");
        const toUser = $(this).attr("data-toUser");
        // createUserLike
        $.ajax({
          url: "/api/change-userLike",
          type: "POST",
          data: { toUser, type, likeID },
          success: (result) => {
            if (result.msg === "success") {
              if (type === "createUserLike") {
                $(this).attr("id", "deleteUserLike");
                $(this).attr("data-likeID", result.likeID._id);
                $(this).find("img.like__btn-img").attr("src", "/images/conference/like__active.png");
                $(this).find("h1.like__title").addClass("active").text(`${result.user.likeID.length} Like /`);
                setTimeout(function () {
                  $(".user__like-flex#changeUserLike button.user__like-btn").removeAttr("disabled");
                }, 500);
              } else {
                $(this).attr("id", "createUserLike");
                $(this).removeAttr("data-likeID");
                $(this).find("img.like__btn-img").attr("src", "/images/conference/like.svg");
                $(this).find("h1.like__title").removeClass("active").text(`${result.user.likeID.length} Like /`);
                setTimeout(function () {
                  $(".user__like-flex#changeUserLike button.user__like-btn").removeAttr("disabled");
                }, 500);
              }
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      });
  });
}

if (changeUserLike) {
  init();
}
