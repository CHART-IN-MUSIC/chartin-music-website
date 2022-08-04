import $ from "jquery";

const conferenceRoomDetailPage = document.getElementById("conferenceRoom__detail-page");

const init = () => {
  $(document).ready(() => {
    // desc 높이가 300px 넘어가라 경우 more btn 활성화
    if ($("h1.conference__desc").height() >= 320) {
      const This = $("h1.conference__desc");
      This.addClass("active");
      $("button.more__btn-flex").addClass("active");
    }

    // more btn click
    $("button.more__btn-flex").on("click", function () {
      $(this).removeClass("active");
      $("h1.conference__desc").removeClass("active");
    });

    // textarea keyup btn active
    $("textarea.comment__textarea").on("keyup paste", function () {
      setTimeout(() => {
        const submitBtn = $("button.comment__submit-btn");
        $(this).removeClass("form__error");
        if ($(this).val() !== "") {
          submitBtn.addClass("active");
        } else {
          submitBtn.removeClass("active");
        }
      }, 1);
    });

    // submit btn click
    $("button.comment__submit-btn").on("click", () => {
      let requiredCheck = true;
      if ($("textarea.comment__textarea").val() === "") {
        $("textarea.comment__textarea").addClass("form__error");
        requiredCheck = false;
      }
      if (requiredCheck) {
        $("form#commentForm").submit();
      }
    });

    // change like click
    $("button.user__like-flex")
      .off("click")
      .on("click", function () {
        $(this).attr("disabled", "disabled");
        const type = $(this).attr("id");
        const fromUser = $(this).attr("data-fromUser");
        const conferenceID = $(this).attr("data-conferenceID");
        const userID = $(this).attr("data-userID");
        // create conference Like
        $.ajax({
          url: "/api/change-conferenceLike",
          type: "POST",
          data: { fromUser, conferenceID, userID, type },
          success: (result) => {
            if (result.msg === "success") {
              if (result.type === "createConferenceLike") {
                $(this).attr("id", "deleteConferenceLike");
                $(this).find("img.user__like-img").attr("src", "/images/conference/like__active.png");
                $(this).find("h1.user__like-count").addClass("active").text(`${result.conference.conferenceLikeID.length} Like`);
                setTimeout(function () {
                  $("button.user__like-flex").removeAttr("disabled");
                }, 500);
              } else {
                $(this).attr("id", "createConferenceLike");
                $(this).find("img.user__like-img").attr("src", "/images/conference/like.svg");
                $(this).find("h1.user__like-count").removeClass("active").text(`${result.conference.conferenceLikeID.length} Like`);
                setTimeout(() => {
                  $("button.user__like-flex").removeAttr("disabled");
                }, 500);
              }
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      });

    // 값 유무에 따라 form 테두리 및 버튼 색상 변경
    $(".form__section").each((i, elem) => {
      if ($(elem).val() !== "") {
        $(elem).addClass("active");
      }
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() === "") {
            $(this).removeClass("active");
          } else {
            $(this).addClass("active");
          }

          if ($(".form__required.active").length === $(".form__required").length) {
            $("button.submit__btn").addClass("active");
          } else {
            $("button.submit__btn").removeClass("active");
          }
        }, 1);
      });
    });

    // 사진 첨부시
    $(`input[name="uploadConferenceFile"]`).on("change", () => {
      const data = new FormData($(`#conferenceModalFormUpdate`)[0]);
      $.ajax({
        url: "/api/upload-conferenceFile",
        enctype: "multipart/form-data",
        type: "POST",
        data,
        processData: false,
        contentType: false,
        success: (result) => {
          const location = result.location;
          $(`input[name="conferenceFile"]`).val("");
          $(`input[name="conferenceFile"]`).val(location);
          $(`input[name="uploadConferenceFile"]`).addClass("active");
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });

    // 업데이트 버튼 클릭시
    $("button.update__form-btn").click(function () {
      // 필수값 체크
      let requiredCheck = false;
      $(".form__required").each((i, elem) => {
        if ($(elem).val() === "" || $(elem).val().length === 0) {
          $(elem).addClass("form__error");
          requiredCheck = true;
        } else {
          $(elem).removeClass("form__error");
        }
        $(elem).focus(() => {
          $(elem).removeClass("form__error");
        });
      });
      if (requiredCheck && !$(this).hasClass("active")) {
        alert("Please enter all required value");
      } else {
        $("form#conferenceModalFormUpdate").submit();
      }
    });

    // Recomment
    // Reply 클릭시
    $(".recomment__flex").each((i, elem) => {
      $(elem).click(function () {
        $(this).parents("li.comment__item").find(".item__recomment-form").toggleClass("active");
      });
    });
    // 대댓글 작성시(textarea border main color, submit button bgColor main color)
    $("textarea.recomment__textarea").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() !== "") {
            $(this).addClass("active");
            $(this).siblings("button.recomment__submit-btn").addClass("active");
          } else {
            $(this).removeClass("active");
            $(this).siblings("button.recomment__submit-btn").removeClass("active");
          }
        }, 1);
      });
    });
    // 대댓글 submit 버튼 클릭 시
    $("button.recomment__submit-btn").each((i, elem) => {
      $(elem).click(function () {
        const desc = $(this).siblings("textarea.recomment__textarea").val();
        const userID = $(this).siblings(`input[name="userID"]`).val();
        const commentID = $(this).siblings(`input[name="commentID"]`).val();
        const index = $(this).attr("data-index");

        $.ajax({
          url: "/api/create-recomment",
          type: "POST",
          data: { desc, userID, commentID },
          success: (result) => {
            console.log(result.gradientColor);
            if (result.msg === "success") {
              const recommentHTML = `
              <li class="recomment__item">
                <img class="item__recomment-descImg" src="/images/conference/recomment__form-img.png">
                <div class="item__flex">
                  <div class="item__user-flex">
                    <div class="user__profile">
                      <div class="user__profile-img" style="background:${result.gradientColor};"></div>
                    </div>
                    <div class="user__info-flex">
                      <h1 class="user__name">${result.name}</h1>
                      <h1 class="user__total-likes">${result.userInfo1} / ${result.userInfo2}</h1>
                    </div>
                  </div>
                  <div class="item__desc">${desc}</div>
                </div>
              </li>
              `;

              $(`ul#recomment__items${index}`).append(recommentHTML);
              $(this).parents(".item__recomment-form").removeClass("active");
              $(this).siblings("textarea.recomment__textarea").val("").removeClass("active");
              $(this).removeClass("active");
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      });
    });
  });
};

if (conferenceRoomDetailPage) {
  init();
}
