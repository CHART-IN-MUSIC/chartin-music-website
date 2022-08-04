import $ from "jquery";

const conferenceRoomPage = document.getElementById("conferenceRoom__page");

const init = () => {
  $(document).ready(() => {
    // 모달 내용 추가 후 Add 버튼 클릭 시
    $("button.submit__btn").click(function (e) {
      let requiredCheck = true;
      $(".form__required").each((i, elem) => {
        if ($(elem).val() === "" || $(elem).val().length === 0) {
          $(elem).addClass("form__error");
          requiredCheck = false;
        } else {
          $(elem).removeClass("form__error");
        }
        $(elem).focus(() => {
          $(elem).removeClass("form__error");
        });
      });
      if (!requiredCheck) {
        alert("Please enter all required value");
      } else {
        $("form#conferenceModalForm").submit();
      }
    });

    // 카테고리별 소팅 영역 활성화
    $("button.filter__btn-name").each((i, elem) => {
      $(elem).click(function () {
        const category = $(this).attr("data-value");
        if (category === "1") {
          window.location.href = `/conference-room`;
        } else {
          window.location.href = `/conference-room?category=${category}`;
        }
      });
      const pathname = window.location.search.split("=")[1];
      if (!pathname && $(elem).attr("data-value") === "1") {
        $(elem).addClass("active");
      }
      if (pathname === $(elem).attr("data-value")) {
        $(elem).addClass("active");
      }
    });

    // 모바일 카테고리 필터 스크롤 위치
    $("li.filter__item").each((i, elem) => {
      const listChild = $(elem).children("button.filter__btn-name");
      let position;
      if (listChild.hasClass("active")) {
        position = Math.ceil($(elem).position().left);
        if (Number(listChild.attr("data-value")) > 3) {
          $("ul.filter__items").scrollLeft(position);
        }
      }
    });

    // 제목 내용 작성 완료시
    $(".form__required").each((i, elem) => {
      $(elem).on("keyup change paste", function () {
        setTimeout(() => {
          if ($(this).val() !== "") {
            $(this).addClass("active");
          } else {
            $(this).removeClass("active");
          }
          if ($(".form__required").length === $(".form__required.active").length) {
            $("button.submit__btn").addClass("active");
          } else {
            $("button.submit__btn").removeClass("active");
          }
        }, 1);
      });
    });

    // 사진 첨부시
    $(`input[name="uploadConferenceFile"]`).on("change", () => {
      const data = new FormData($(`#conferenceModalForm`)[0]);
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
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });
  });
};

if (conferenceRoomPage) {
  init();
}
