import $ from "jquery";

const adminPartnerLogoPage = document.getElementById("admin__partnerForm-page");

function init() {
  $(document).ready(() => {
    // 파트너 로고 이미지 삭제
    const deletePartnerLogoImg = () => {
      $("img.item__delete-img").click(function () {
        $("ul.uploaded__items").remove();
        $("input#partnerLogoImg").val("");
        $("label.custom-file-label").text("");
      });
    };
    // 파트너 로고 이미지 등록
    $("input#partnerLogoImg").change(function () {
      const data = new FormData($(`#partnerLogoForm`)[0]);
      $.ajax({
        url: "/api/create-partnerLogoImg",
        enctype: "multipart/form-data",
        type: "POST",
        data,
        processData: false,
        contentType: false,
        success: (result) => {
          const location = result.location;
          const partnerLogoImgHTML = `
              <ul class="uploaded__items">
                <li class="uploaded__item">
                  <input type="hidden" name="img" value=${location} />
                  <div class="item__flex">
                    <img class="item__img" src=${location} />
                    <img class="item__delete-img" src="/images/admin/delete.png" />
                  </div>
                </li>
              </ul>
              `;
          $(".form__group-img").prepend(partnerLogoImgHTML);

          // 파트너 로고 이미지 삭제 함수
          deletePartnerLogoImg();
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });
  });
}

if (adminPartnerLogoPage) {
  init();
}
