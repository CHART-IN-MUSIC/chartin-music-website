import $ from "jquery";

const adminNewsFormPage = document.getElementById("admin__newsContentsForm-page");

function init() {
  $(document).ready(() => {
    // 뉴스 이미지 삭제
    const deleteNewsImg = () => {
      $("img.item__delete-img").click(function () {
        $(this).parents(".uploaded__newsImg-items").remove();
        $("input.input__newsImg").val("");
        const customFileHTML = `
        <div class="custom-file">
          <input class="form-control custom-file-input input__newsImg" id="uploadNewsImg" type="file" name="uploadNewsImg" accept="image/*" required="">
          <label class="custom-file-label label__newsImg active" for="customFile">파일을 선택하세요</label>
        </div>
        `;
        $(".form-group-newsImg").append(customFileHTML);
        changeNewsImg();
      });
    };

    // 뉴스 이미지 change
    const changeNewsImg = () => {
      $("#uploadNewsImg").change(() => {
        const data = new FormData($(`#newsForm`)[0]);
        $.ajax({
          url: "/api/create-newsImg",
          enctype: "multipart/form-data",
          type: "POST",
          data,
          processData: false,
          contentType: false,
          success: (result) => {
            const location = result.location;
            const newsImgHTML = `
                <div class="uploaded__newsImg-items">
                  <input class="item__location" type="hidden" name="newsImg" value=${location}>
                  <div class="item__flex">
                    <img class="item__img" src=${location}>
                    <img class="item__delete-img" src="/images/admin/delete.png">
                  </div>
                </div>
                `;
            $(".form-group-newsImg").append(newsImgHTML);
            $(".custom-file").remove();

            // 뉴스 이미지 삭제 함수
            deleteNewsImg();
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      });
    };
    changeNewsImg();
    $(`textarea.form-control[name="shortDesc"]`).keydown(function () {
      const rows = $(this).val().split("\n").length;
      const maxRows = 2;
      if (rows > maxRows) {
        alert("You're only allowed to write up to two lines for summary.");
        const modifiedText = $(this).val().split("\n").slice(0, maxRows);
        $(this).val(modifiedText.join("\n"));
      }
    });

    $("button.btn.btn-primary.waves-effect.waves-float.waves-light").click((e) => {
      e.preventDefault();
      var rows = $(`textarea.form-control[name="shortDesc"]`).val().split("\n").length;
      var maxRows = 2;
      if (rows > maxRows) {
        alert("You're only allowed to write up to two lines for summary.");
        $(this).focus();
        const modifiedText = $(this).val().split("\n").slice(0, maxRows);
        $(this).val(modifiedText.join("\n"));
      } else {
        $("form#newsForm").submit();
      }
    });
  });
}

if (adminNewsFormPage) {
  init();
}
