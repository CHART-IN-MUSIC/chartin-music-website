import $ from "jquery";

const serviceDiagnosisPage = document.getElementById("serviceDiagnosis__page");

const init = () => {
  $(document).ready(() => {
    // input 값 입력완료시 테두리 변경
    $("input.form__input").each((i, elem) => {
      $(elem).on("keyup paste", () => {
        setTimeout(() => {
          if ($(elem).val() !== "") {
            $(elem).addClass("active");
          } else {
            $(elem).removeClass("active");
          }
        }, 1);
      });
    });

    $(`input.form__option[name="goal"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="goal"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });

    $(`input.form__option[name="markets"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="markets"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });

    $(".form__validation, input.form__option").each((i, elem) => {
      $(elem).on("keyup paste change", () => {
        setTimeout(() => {
          if ($(".form__validation").length === $(".form__validation.active").length) {
            $("button#serviceDiagnosisSubmit").addClass("active");
          } else {
            $("button#serviceDiagnosisSubmit").removeClass("active");
          }
        }, 1);
      });
    });

    const validationChk = () => {
      if ($(".form__validation").length === $(".form__validation.active").length) {
        $("button#serviceDiagnosisSubmit").addClass("active");
      } else {
        $("button#serviceDiagnosisSubmit").removeClass("active");
      }
    };

    const inputValChk = () => {
      $("input.form__input").each((i, elem) => {
        if ($(elem).val() !== "") {
          $(elem).addClass("active");
        } else {
          $(elem).removeClass("active");
        }
      });
    };

    const multipleInputOptionChk = () => {
      if ($(`input.form__option[name="markets"]:checked`).length >= 1) {
        $(`input.form__option[name="markets"]`).parents(".form__group-selectInput").addClass("active");
      }
      if ($(`input.form__option[name="goal"]:checked`).length >= 1) {
        $(`input.form__option[name="goal"]`).parents(".form__group-selectInput").addClass("active");
      }
    };

    // feedback mix&master promotion 선택 시 추가 select창 active
    $(`select[name="service"]`).change(function () {
      const selectedVal = $("option:selected", this).val();
      $(".form__group").removeClass("active");

      $(".form__group-service").each((i, elem) => {
        if (selectedVal === $(elem).attr("data-name")) {
          if (selectedVal === "Feedback") {
            $(".form__group-service").removeClass("active").find("select.form__select").attr("disabled", "disabled").removeClass("form__validation");
            $(".form__group-service").find(".form__group-selectInput").removeClass("form__validation");
            $(elem).addClass("active").find("select.form__select").removeAttr("disabled").addClass("form__validation");
            validationChk();
            inputValChk();
            multipleInputOptionChk();
          } else if (selectedVal === "Mix/Master") {
            $(".form__group-service").removeClass("active").find("select.form__select").attr("disabled", "disabled").removeClass("form__validation");
            $(".form__group-service").find(".form__group-selectInput").removeClass("form__validation");
            $(elem).addClass("active").find("select.form__select").removeAttr("disabled").addClass("form__validation");
            validationChk();
            inputValChk();
            multipleInputOptionChk();
          } else {
            $(".form__group-service").removeClass("active").find("select.form__select").attr("disabled", "disabled").removeClass("form__validation");
            $(elem).addClass("active").find(".form__group-selectInput").addClass("form__validation");
            validationChk();
            inputValChk();
            multipleInputOptionChk();
          }
        }
      });
    });
    // promotion 선택 후  Others 선택 시 주관식 입력
    $(`input.form__option-others[name="goal"]`).change(function () {
      if ($(this).is(":checked")) {
        $("input.form__input-goal").addClass("pop-up form__required form__validation").removeAttr("disabled").attr("required", "required");
      } else {
        $("input.form__input-goal").removeClass("pop-up form__required form__validation").attr("disabled", "disabled").removeAttr("required");
      }
    });
    // Submit btn click
    $("button#serviceDiagnosisSubmit").click((e) => {
      e.preventDefault();
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
      const type = $(`select[name="service"] option:selected`).val();

      if (type === "Feedback" || type === "Mix/Master") {
        $(`input.form__option[name="markets"]`).each((i, elem) => {
          if ($(elem).is(":checked")) {
            checkedLen += 1;
          }
        });
        if (checkedLen === 0) {
          alert("Choose at least one.");
          $(".form__group-selectInput").addClass("form__error");
        } else if (requiredCheck) {
          alert("Please enter all required value");
        } else {
          $("form#serviceDiagnosisForm").submit();
        }
      } else if (type === "Promotion") {
        $(`input.form__option[name="goal"]`).each((i, elem) => {
          if ($(elem).is(":checked")) {
            checkedLen += 1;
          }
        });
        if (checkedLen === 0) {
          alert("Choose at least one.");
        } else if (requiredCheck) {
          alert("Please enter all required value");
          $(".form__group-selectInput").addClass("form__error");
        } else {
          $("form#serviceDiagnosisForm").submit();
        }
      }
    });
  });
};

if (serviceDiagnosisPage) {
  init();
}
