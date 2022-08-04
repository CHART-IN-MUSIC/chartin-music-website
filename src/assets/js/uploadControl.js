import $ from "jquery";

const dashboardUpload = document.getElementById("dashboard__upload");

const init = () => {
  $(document).ready(() => {
    // 각 input, textarea 값 있으면 border maincolor
    $("input.form__input").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() === "") {
            $(this).removeClass("active");
          } else {
            $(this).addClass("active");
          }
        }, 1);
      });
    });
    $("textarea.form__textarea").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() === "") {
            $(this).removeClass("active");
          } else {
            $(this).addClass("active");
          }
        }, 1);
      });
    });

    // 각 input:checkbox 값 1개 이상시 border maincolor
    $(`input.form__option[name="channels"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="channels"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
          $(this).parents(".form__group-selectInput").removeClass("form__error");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    $(`input.form__option[name="promotionResultType"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="promotionResultType"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
          $(this).parents(".form__group-selectInput").removeClass("form__error");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });

    $(`input.form__option[name="mixmasterResultType"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="mixmasterResultType"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
          $(this).parents(".form__group-selectInput").removeClass("form__error");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });

    $("input, textarea").each((i, elem) => {
      $(elem).on("keyup paste", () => {
        setTimeout(() => {
          if ($(".form__group").length === $(".form__required.active").length + $(".form__group-selectInput.active").length) {
            $("button.upload__form-btn").addClass("active");
          } else {
            $("button.upload__form-btn").removeClass("active");
          }
        }, 1);
      });
    });

    // Upload btn click => create Uplod Result
    $("button.upload__form-btn").click(function (e) {
      e.preventDefault();
      const type = $(this).attr("data-type");
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

      let checkedLen = 0;
      let checkedLenDuration = 0;
      if (type === "promotion") {
        $(`input.form__option[name="promotionResultType"]`).each((i, elem) => {
          if ($(elem).is(":checked")) {
            checkedLen += 1;
          }
        });
        $(`input.form__option[name="channels"]`).each((i, elem) => {
          if ($(elem).is(":checked")) {
            checkedLenDuration += 1;
          }
        });
        if (checkedLen === 0 && checkedLenDuration === 0 && requiredCheck) {
          alert("Please enter all required value");
          $(`input.form__option[name="promotionResultType"]`).parents(".form__group-selectInput").addClass("form__error");
          $(`input.form__option[name="channels"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (checkedLen === 0 && requiredCheck) {
          alert("Please enter all required value");
          $(`input.form__option[name="promotionResultType"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (checkedLenDuration === 0 && requiredCheck) {
          alert("Please enter all required value");
          $(`input.form__option[name="channels"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (checkedLenDuration === 0 && checkedLen === 0) {
          alert("Choose at least one.");
          $(`input.form__option[name="channels"]`).parents(".form__group-selectInput").addClass("form__error");
          $(`input.form__option[name="promotionResultType"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (checkedLen === 0) {
          alert("Choose at least one.");
          $(`input.form__option[name="promotionResultType"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (checkedLenDuration === 0) {
          alert("Choose at least one.");
          $(`input.form__option[name="channels"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (requiredCheck) {
          alert("Please enter all required value");
        } else {
          $("form#uploadForm").submit();
        }
      } else {
        if (requiredCheck) {
          alert("Please enter all required value");
        } else {
          $("form#uploadForm").submit();
        }
      }
    });
  });
};

if (dashboardUpload) {
  init();
}
