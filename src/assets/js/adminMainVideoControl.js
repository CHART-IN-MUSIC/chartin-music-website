import $ from "jquery";

const adminMainVideoFormPage = document.getElementById("admin__mainVideoForm-page");

function init() {
  $(document).ready(() => {
    // 유형 선택별 이미지 규격 변경
    $("select#type").change(function () {
      const selectedVal = $("option:selected", this).val();
      $("span.form-label-emphasis").removeClass("active");
      if (selectedVal === "TikTok") {
        $("span.form-label-tiktok").addClass("active");
      } else {
        $("span.form-label-youtube").addClass("active");
      }
    });
    // 썸네일 이미지 삭제
    const deleteThumbnailImg = () => {
      $("img.item__delete-img").click(function () {
        $("ul.uploaded__items").remove();
        $("input#thumbnail").val("");
        $("label.custom-file-label").text("");
      });
    };

    // 썸네일 이미지 등록
    $("input#thumbnail").change(function () {
      const data = new FormData($(`#thumbNailForm`)[0]);
      $.ajax({
        url: "/api/create-thumbnailImg",
        enctype: "multipart/form-data",
        type: "POST",
        data,
        processData: false,
        contentType: false,
        success: (result) => {
          const location = result.location;
          const thumbnailHTML = `
              <ul class="uploaded__items">
                <li class="uploaded__item">
                  <input type="hidden" name="thumbnail" value=${location} />
                  <div class="item__flex">
                    <img class="item__img" src=${location} />
                    <img class="item__delete-img" src="/images/admin/delete.png" />
                  </div>
                </li>
              </ul>
              `;
          $(".form-group-thumbnail").prepend(thumbnailHTML);

          // 파트너 로고 이미지 삭제 함수
          deleteThumbnailImg();
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });
  });
}

if (adminMainVideoFormPage) {
  init();
}
