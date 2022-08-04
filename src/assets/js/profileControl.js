import $ from "jquery";

const dashboardProfile = document.getElementById("dashboard__profile");

const init = () => {
  $(document).ready(() => {
    $("input.form__input").each((i, elem) => {
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
        }, 1);
      });
    });
    $("textarea.form__textarea").each((i, elem) => {
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
        }, 1);
      });
    });
    $(`input.form__option[name="targetCountry"]`).each((i, elem) => {
      if ($(`input.form__option[name="targetCountry"]:checked`).length >= 1) {
        $(elem).parents(".form__group-selectInput").addClass("active");
      }
      $(elem).change(function () {
        if ($(`input.form__option[name="targetCountry"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    $(`input.form__option[name="providableServices"]`).each((i, elem) => {
      if ($(`input.form__option[name="providableServices"]:checked`).length >= 1) {
        $(elem).parents(".form__group-selectInput").addClass("active");
      }
      $(elem).change(function () {
        if ($(`input.form__option[name="providableServices"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    $(`input.form__option[name="serviceCountry"]`).each((i, elem) => {
      if ($(`input.form__option[name="serviceCountry"]:checked`).length >= 1) {
        $(elem).parents(".form__group-selectInput").addClass("active");
      }
      $(elem).change(function () {
        if ($(`input.form__option[name="serviceCountry"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });

    $("input, textarea").each((i, elem) => {
      $(elem).on("keyup paste change", () => {
        setTimeout(() => {
          if ($(".form__required").length + $(".form__group-seleteInput").length === $(".form__required.active").length + $(".form__group-seleteInput.active").length) {
            $("button.resigterForm__submit-btn").addClass("active");
          } else {
            $("button.resigterForm__submit-btn").removeClass("active");
          }
        }, 1);
      });
    });

    // gradient 색상 클릭 시 프로필 색상 변경
    $(".item__circle").each((i, elem) => {
      $(elem).click(function () {
        const backgroundLinear = $(this).attr("data-color");
        $(".profile__circle").css("background", backgroundLinear);
        $(`input.form__input[name="gradientColor"]`).val(backgroundLinear);
      });
    });

    const checkActiveLen = () => {
      if ($(".form__required").length + $(".form__group-seleteInput").length !== $(".form__required.active").length + $(".form__group-seleteInput.active").length) {
        $("button.resigterForm__submit-btn").removeClass("active");
      } else {
        $("button.resigterForm__submit-btn").addClass("active");
      }
    };
    // 소셜 미디어 클릭 시 이벤트
    $("li.socialMedia__item .socialMedia__item-flex:first-child").each((i, elem) => {
      $(elem).click(function () {
        const activeBool = $(this).parents("li.socialMedia__item").hasClass("active");
        const thisInputSocial = $(this).parents("li.socialMedia__item").find("input.form__input.form__input-social");
        const socialInputName = $(this).parents("li.socialMedia__item").find("input.form__input.form__input-social").attr("name");
        const totalSocailInput = $(`input.form__input.form__input-social[name="${socialInputName}"]`);
        if (activeBool) {
          $(this).parents("li.socialMedia__item").removeClass("active");
          $(this).find("img.socialMedia__plus-img").attr("src", "/images/register/plus_icon@3x.png");
          $(totalSocailInput).val("");
          $(totalSocailInput).removeAttr("value");
          $(totalSocailInput).removeClass("form__required");
          checkActiveLen();
        } else {
          $(this).parents("li.socialMedia__item").addClass("active");
          $(this).find("img.socialMedia__plus-img").attr("src", "/images/register/plus_icon_active@3x.png");
          $(thisInputSocial).focus();
          $(thisInputSocial).addClass("form__required");
          checkActiveLen();
        }
      });
    });
    // 소셜 미디어 input 값 입력 시 이벤트
    $("input.form__input.form__input-social").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          const inputVal = $(this).val();
          const thisImg = $(this).parents("li.socialMedia__item").find("img.socialMedia__plus-img");
          if (inputVal.length === 0) {
            $(thisImg).attr("src", "/images/register/plus_icon_active@3x.png");
          } else {
            $(thisImg).attr("src", "/images/register/checked_icon@3x.png");
          }
        }, 1);
      });
    });

    // 회원가입 버튼 클릭 시 입력값 검증 후 Submit
    $("button.resigterForm__submit-btn").click(() => {
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

      if (requiredCheck) {
        alert("Please enter all required value");
        window.scrollTo(0, 0);
      } else if ($(".form__required").length + $(".form__group-seleteInput").length !== $(".form__required.active").length + $(".form__group-seleteInput.active").length) {
        alert("Please enter all required value");
        window.scrollTo(0, 0);
      } else {
        const name = $(`input.form__input[name="name"]`).val();
        const userID = $("button.resigterForm__submit-btn").attr("data-id");
        $.ajax({
          url: "/api/check-name-update",
          type: "POST",
          data: { name, userID },
          success: (result) => {
            if (result.msg === "success") {
              $("form#updateProfileForm").submit();
            } else {
              alert("A user with this nickname already exists.");
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

if (dashboardProfile) {
  init();
}
