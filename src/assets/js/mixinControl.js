import $ from "jquery";

const mixinSection = document.getElementById("mixin__section");

const init = () => {
  $(document).ready(() => {
    // Request 시 input 값 입력완료 => border maincolor 유지
    $("input.form__input").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() !== "") {
            $(this).addClass("active");
          } else {
            $(this).removeClass("active");
          }
        }, 1);
      });
    });
    // Request 시 textarea 값 입력완료 => border maincolor 유지
    $("textarea.form__textarea").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val() !== "") {
            $(this).addClass("active");
          } else {
            $(this).removeClass("active");
          }
        }, 1);
      });
    });
    // 피드백 오퍼 제공시 최소 50글자 이상
    $("textarea.form__textarea.form__minLength").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          if ($(this).val().length >= 50) {
            $(this).addClass("active");
          } else {
            $(this).removeClass("active");
          }
        }, 1);
      });
    });
    // Request 시 promotions select multiple 값 선택 1개 이상 했을 때  => border maincolor 유지
    $(`input.form__option[name="markets"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="markets"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
          $(this).parents(".form__group-selectInput").removeClass("form__error");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    // 피드백 멀티옵션 중 하나 선택시 active
    $(`input.form__option[name="goal"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="goal"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
          $(this).parents(".form__group-selectInput").removeClass("form__error");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    $(`input.form__input-goal[name="goal"]`).on("keyup paste", () => {
      setTimeout(() => {
        if ($("#feedback__modal .form__validation.active").length === $("#feedback__modal .form__validation").length) {
          $("#feedback__modal section.contents__first-step button.contents__btn").css("background-color", "#10eb73");
        } else {
          $("#feedback__modal section.contents__first-step button.contents__btn").css("background-color", "#3e3e3e");
        }
      }, 1);
    });

    // 팝업 닫기 버튼 클릭 시 첫번째 단계 active
    $("img.modal-close-img").each((i, elem) => {
      $(elem).click(() => {
        $("section.contents__step").removeClass("active");
        $("section.contents__step.contents__first-step").addClass("active");
        $("button.close").css("display", "block");
      });
    });

    // Feedback 팝업의 버튼 Pay Now를 Pay로 변경
    $("input#fasterpay_submit").val("Pay");

    // 결제가 완료된 Feedback일 경우 팝업 열림
    const purchase = $(".request__popup#feedback__popup").attr("data-purchase");
    if (purchase) {
      $("#feedback__modal").attr({
        "data-backdrop": "static",
        "data-keyboard": "false",
      });
      $("button#request__feedback-btn").click();
    }

    // Feedback 첫번째 단계 타입 버튼 선택 시
    $("#feedback__modal section.contents__first-step button.contents__btn").each((i, elem) => {
      $(elem).click(function () {
        if ($(this).hasClass("active")) {
          const purchaseID = $("#pre__purchase-id").attr("data-id");
          const feedbackType = $(`select.form__select[name="type"] option:selected`).val();

          // 결제전 피드백 생성
          const type = $(`select.form__select[name="type"] option:selected`).val();
          const concept = $(`select.form__select[name="concept"] option:selected`).val();
          const country = $(`select.form__select[name="country"] option:selected`).val();
          const genre = $(`select.form__select[name="genre"] option:selected`).val();
          const budget = $(`select.form__select[name="budget"] option:selected`).val();
          const ownVideo = $(`select.form__select[name="ownVideo"] option:selected`).val();
          const link = $(`input.form__input[name="link"]`).val();
          const markets = [];
          $(`input.form__option[name="markets"]`).each((i, elem) => {
            if ($(elem).is(":checked")) {
              markets.push($(elem).val());
            }
          });
          const goal = [];
          $(`input.form__option[name="goal"]`).each((i, elem) => {
            if ($(elem).is(":checked")) {
              if ($(elem).val() !== "Others") {
                goal.push($(elem).val());
              } else {
                goal.push($("input.form__input-goal").val());
              }
            }
          });
          $.ajax({
            url: "/api/create-feedback-before-purchase",
            type: "POST",
            data: { purchaseID, type, concept, country, genre, budget, ownVideo, link, markets, goal },
            success: (result) => {
              if (result.msg === "success") {
                $.ajax({
                  url: "/api/feedback-purchase/save-type",
                  type: "POST",
                  data: { purchaseID, feedbackType },
                  success: (result) => {
                    if (result.msg === "success") {
                      $("#feedback__modal section.contents__first-step").removeClass("active");
                      $("#feedback__modal section.contents__second-step").addClass("active");
                    }
                  },
                  error: (err) => {
                    alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
                  },
                });
              }
            },
            error: (err) => {
              alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
            },
          });
        }
      });
    });

    // feedback 모두 입력시 버튼 request 활성화
    $("#feedback__modal .form__required, #feedback__modal .form__validation").each((i, elem) => {
      $(elem).on("keyup paste change", () => {
        setTimeout(() => {
          if ($("#feedback__modal .form__validation.active").length === $("#feedback__modal .form__validation").length) {
            $("#feedback__modal section.contents__first-step button.contents__btn").css("background-color", "#10eb73").addClass("active");
          } else {
            $("#feedback__modal section.contents__first-step button.contents__btn").css("background-color", "#3e3e3e").removeClass("active");
          }
        }, 1);
      });
    });

    // promotion 모두 입력시 버튼 request 활성화
    $("#promotion__modal .form__required, #promotion__modal .form__validation").each((i, elem) => {
      $(elem).on("keyup paste", () => {
        setTimeout(() => {
          if ($("#promotion__modal .form__validation.active").length === $("#promotion__modal .form__validation").length) {
            $("#promotion__modal section.contents__first-step button#requestPromotionSubmit").css("background-color", "#10eb73");
          } else {
            $("#promotion__modal section.contents__first-step button#requestPromotionSubmit").css("background-color", "#3e3e3e");
          }
        }, 1);
      });
    });

    // Promotion 첫번째 단계 Request 버튼 클릭 시
    $("#promotion__modal section.contents__first-step button#requestPromotionSubmit").click(function () {
      if ($("#promotion__modal .form__validation.active").length !== $("#promotion__modal .form__validation").length) {
        alert("Please enter all required value");
        window.scrollTo(0, 0);
      } else {
        const name = $("#promotion__modal").find(`input[name="name"]`).val();
        const genre = $("#promotion__modal").find(`select[name="genre"] option:selected`).val();
        const link = $("#promotion__modal").find(`input[ name="link"]`).val();
        const link2 = $("#promotion__modal").find(`input[ name="link2"]`).val();
        const markets = [];
        $(`input.form__option[name="markets"]:checked`).each((i, elem) => {
          markets.push($(elem).val());
        });
        const country = $("#promotion__modal").find(`select[name="country"] option:selected`).val();
        const budget = $("#promotion__modal").find(`select[name="budget"] option:selected`).val();
        const video = $("#promotion__modal").find(`select[name="video" ] option:selected`).val();
        const expertID = $(this).attr("data-expertID");
        const serviceType = $(this).attr("data-serviceType");
        // 필수값 체크
        let requiredCheck = false;
        $("#promotion__modal .form__required").each((i, elem) => {
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

        if (requiredCheck && markets.length === 0) {
          alert("Please enter all required value");
          window.scrollTo(0, 0);
          $(`input.form__option[name="markets"]`).parents(".form__group-selectInput").addClass("form__error");
        } else if (requiredCheck) {
          alert("Please enter all required value");
          window.scrollTo(0, 0);
        } else if (markets.length === 0) {
          alert("Choose at least one.");
          $(`input.form__option[name="markets"]`).parents(".form__group-selectInput").addClass("form__error");
        } else {
          // ajax 실행
          $.ajax({
            url: "/api/create-requested-promotion",
            type: "POST",
            data: { name, genre, link, link2, markets, country, budget, video, expertID, serviceType },
            success: (result) => {
              $("#promotion__modal section.contents__step").removeClass("active");
              $("#promotion__modal section.contents__complete-step").addClass("active");
              $("#promotion__modal").find("button.close").css("display", "none");
              $("#promotion__modal").css("pointer-events", "none");
            },
            error: (err) => {
              alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
            },
          });
        }
      }
    });

    // 믹스마스터 input 값 입력시 버튼 활성화
    $("#mixMaster__modal .form__required").each((i, elem) => {
      $(elem).on("keyup paste change", () => {
        setTimeout(() => {
          if ($("#mixMaster__modal .form__required.active").length === $("#mixMaster__modal .form__required").length) {
            $("#mixMaster__modal section.contents__first-step button#requestMixMasterSubmit").css("background-color", "#10eb73");
          } else {
            $("#mixMaster__modal section.contents__first-step button#requestMixMasterSubmit").css("background-color", "#3e3e3e");
          }
        }, 1);
      });
    });

    // MixMaster 첫번째 단계 Request 버튼 클릭 시
    $("#mixMaster__modal section.contents__first-step button#requestMixMasterSubmit").click(function () {
      if ($("#mixMaster__modal .form__required.active").length !== $("#mixMaster__modal .form__required").length) {
        alert("Please enter all required value");
        window.scrollTo(0, 0);
      } else {
        const name = $("#mixMaster__modal").find(`input[name="name"]`).val();
        const genre = $("#mixMaster__modal").find(`select[name="genre"] option:selected`).val();
        const link = $("#mixMaster__modal").find(`input[ name="link"]`).val();
        const budget = $("#mixMaster__modal").find(`select[name="budget"] option:selected`).val();
        const detail = $("#mixMaster__modal").find(`textarea[name="detail"]`).val();
        const expertID = $(this).attr("data-expertID");
        const serviceType = $(this).attr("data-serviceType");
        // 필수값 체크
        let requiredCheck = false;
        $("#mixMaster__modal .form__required").each((i, elem) => {
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
        } else {
          // ajax 실행
          $.ajax({
            url: "/api/create-requested-mixMaster",
            type: "POST",
            data: { name, genre, link, budget, detail, expertID, serviceType },
            success: (result) => {
              $("#mixMaster__modal section.contents__step").removeClass("active");
              $("#mixMaster__modal section.contents__complete-step").addClass("active");
              $("#mixMaster__modal").find("button.close").css("display", "none");
              $("#mixMaster__modal").css("pointer-events", "none");
            },
            error: (err) => {
              alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
            },
          });
        }
      }
    });

    // Proposal
    // 믹스마스터 제안중 날짜 선택 시 boder maincolor
    $("input.form__date").change(function () {
      if ($(this).val() === 0) {
        $(this).removeClass("active");
      } else {
        $(this).addClass("active");
      }
    });
    //  프로모션 다중 선택 중 others클릭 후 others input 값 입력시 border maincolor
    $("input.form__input-specialize").on("keyup paste", function () {
      setTimeout(() => {
        if ($(this).val() === "") {
          $(this).removeClass("border__active");
        } else {
          $(this).addClass("border__active");
        }
      }, 1);
    });
    $("input.form__input-bestFits").on("keyup paste", function () {
      setTimeout(() => {
        if ($(this).val() === "") {
          $(this).removeClass("border__active");
        } else {
          $(this).addClass("border__active");
        }
      }, 1);
    });
    // Request 시 promotions select multiple 값 선택 1개 이상 했을 때  => border maincolor 유지
    $(`input.form__option[name="bestFits"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="bestFits"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
          $(this).parents(".form__group-selectInput").removeClass("form__error");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    //  제안시 input checkbox 1개 이상 선택시 border maincolor
    $(`input.form__option[name="duration"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="duration"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    $(`input.form__option[name="specialize"]`).each((i, elem) => {
      $(elem).change(function () {
        if ($(`input.form__option[name="specialize"]:checked`).length >= 1) {
          $(this).parents(".form__group-selectInput").addClass("active");
        } else {
          $(this).parents(".form__group-selectInput").removeClass("active");
        }
      });
    });
    // 파일업로드시  border maincolor
    $(`input.form__input[name="uploadPromotionFile"]`).change(function () {
      if ($(this).val() !== 0) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
    });
    // 모두 active이면 버튼 활서화
    const chkActive = () => {
      $(".form__section").each((i, elem) => {
        $(elem).on("keyup paste change", () => {
          setTimeout(() => {
            if ($(".form__section").length === $(".form__section.active").length) {
              $("button.form__proposal-submit").addClass("active");
            } else {
              $("button.form__proposal-submit").removeClass("active");
            }
          }, 1);
        });
      });
    };
    chkActive();

    // Others 선택 시 주관식 입력 가능하게 input 생성(구글 시트 기준)
    $(`#proposal__popup input[name=specialize], #proposal__popup input[name=bestFits], input.form__option[name="goal"]`).on("change", () => {
      if ($("input.form__option-others").is(":checked")) {
        $("input.form__input-specialize").addClass("border__active form__required form__section").removeAttr("disabled").attr("required", "required");
        $("input.form__input-bestFits").addClass("border__active form__required form__section").removeAttr("disabled").attr("required", "required");
        $("input.form__input-goal").addClass("border__active form__required form__section form__validation").removeAttr("disabled").attr("required", "required");
        chkActive();
      } else {
        $("input.form__input-specialize").removeClass("border__active form__required form__section").attr("disabled", "disabled").removeAttr("required");
        $("input.form__input-bestFits").removeClass("border__active form__required form__section").attr("disabled", "disabled").removeAttr("required");
        $("input.form__input-goal").removeClass("border__active form__required form__section form__validation").attr("disabled", "disabled").removeAttr("required");
        chkActive();
      }
    });
    //  others check => 주관식입력 활성화
    $(`input.form__option[name="specialize"]`).each((i, elem) => {
      $(elem).click(function () {
        if ($(this).val() === "Others") {
          if ($(this).is(":checked")) {
            $(`input.form__input-specialize[name="specialize"]`).addClass("pop-up").removeAttr("disabled").attr("required", "required");
          } else {
            $(`input.form__input-specialize[name="specialize"]`).removeClass("pop-up").attr("disabled", "disabled").removeAttr("required");
          }
        }
      });
    });

    //  others check => 주관식입력 활성화
    $(`input.form__option[name="bestFits"]`).each((i, elem) => {
      $(elem).click(function () {
        if ($(this).val() === "Others") {
          if ($(this).is(":checked")) {
            $(`input.form__input-bestFits[name="bestFits"]`).addClass("pop-up").removeAttr("disabled").attr("required", "required");
          } else {
            $(`input.form__input-bestFits[name="bestFits"]`).removeClass("pop-up").attr("disabled", "disabled").removeAttr("required");
          }
        }
      });
    });

    $(`input.form__option[name="specialize"]`).click(() => {
      $(".form__group-selectInput").removeClass("form__error");
    });
    // 피드백 others check => 주관식입력 활성화
    $(`input.form__option[name="goal"]`).each((i, elem) => {
      $(elem).click(function () {
        if ($(this).val() === "Others") {
          if ($(this).is(":checked")) {
            $(`input.form__input-goal[name="goal"]`).addClass("pop-up").removeAttr("disabled").attr("required", "required");
          } else {
            $(`input.form__input-goal[name="goal"]`).removeClass("pop-up").attr("disabled", "disabled").removeAttr("required");
          }
        }
      });
    });

    $(`input[name="date"]`).on("keyup paste", function () {
      setTimeout(() => {
        $(this).val(
          $(this)
            .val()
            .replace(/[^0-9]/gi, "")
        );
      }, 1);
    });

    const doubleClickPrevent = () => {
      $("button#proposalSubmit").attr("disabled", false);
    };
    // proposalSubmit btn click
    $("button#proposalSubmit")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        $(this).attr("disabled", "disabled");
        if ($(this).hasClass("active")) {
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

          let feedbackLen = 0;
          let checkedLen = 0;
          let checkedLenDuration = 0;
          let link;
          let linkURL =
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})/gi;
          let regex = new RegExp(linkURL);
          if (type === "feedback") {
            $(`input.form__option[name="bestFits"]`).each((i, elem) => {
              if ($(elem).is(":checked")) {
                checkedLen += 1;
              }
            });
            $("textarea.form__minLength").each((i, elem) => {
              if ($(elem).val().length < 50) {
                feedbackLen += 1;
              }
            });
            if (checkedLen === 0) {
              alert("Choose at least one.");
              $(".form__group-selectInput").addClass("form__error");
            } else if (requiredCheck) {
              alert("Please enter all required value");
            } else if (feedbackLen !== 0) {
              alert("Please enter more than 50 characters. (Approximately 2-3 sentences)");
            } else {
              $(`form#${type}Form`).submit();
            }
          } else if (type === "promotion") {
            $(`input.form__option[name="specialize"]`).each((i, elem) => {
              if ($(elem).is(":checked")) {
                checkedLen += 1;
              }
            });
            link = $("form#promotionForm").find("input.form__link").val();
            if (checkedLen === 0) {
              alert("Choose at least one.");
              $(`input.form__option[name="specialize"]`).parents(".form__group-selectInput").addClass("form__error");
            } else if (requiredCheck) {
              alert("Please enter all required value");
            } else if (link !== "" && !link.match(regex)) {
              alert("Please check the link");
              $("form#promotionForm").find("input.form__link").addClass("form__error");
            } else {
              $(`form#${type}Form`).trigger("submit");
            }
          } else {
            link = $("form#mixmasterForm").find("textarea.form__link").val();
            if (requiredCheck) {
              alert("Please enter all required value");
              $(".form__group-selectInput").addClass("form__error");
            } else if (link !== "" && !link.match(regex)) {
              alert("Please check the link");
              $("form#mixmasterForm").find("textarea.form__link").addClass("form__error");
            } else {
              $(`form#${type}Form`).submit();
            }
          }
          setTimeout(function () {
            doubleClickPrevent();
          }, 1000);
        }
      });

    // Dash Board sidebar
    $("ul#sideBarItems h1.item__title").each((i, elem) => {
      const pathName = window.location.pathname.split("/")[2];
      const link = $(elem).attr("data-link");
      if (pathName === link) {
        $(elem).addClass("active");
      }
      if ($(elem).hasClass("active")) {
        const position = Math.ceil($(elem).position().left);
        let exceptWidth = 0;
        if (document.body.clientWidth < 500) {
          exceptWidth = document.body.clientWidth * 0.05;
        } else if (document.body.clientWidth >= 500 && document.body.clientWidth < 1439) {
          exceptWidth = (document.body.clientWidth - 500) * 0.5;
        }
        $("ul#sideBarItems").scrollLeft(position - exceptWidth);
      }
    });

    // budget 입력시 숫자만
    $(`input.form__input[name="budget"]`).on("keyup paste", function () {
      setTimeout(() => {
        $(this).val(
          $(this)
            .val()
            .replace(/[^0-9]/gi, "")
        );
      }, 1);
    });

    // Reception Choose 모달 팝업 Purchase 버튼 클릭 시
    $("button.proposal__purchase-btn").each((i, elem) => {
      $(elem).click(function () {
        const proposalID = $(this).attr("data-proposal");
        const receptionID = $(this).attr("data-reception");
        const type = $(this).attr("data-type");
        const amount = $(this).attr("data-budget");
        $.ajax({
          url: "/api/choose-purchase-form",
          type: "POST",
          data: { proposalID, receptionID, type, amount },
          success: (result) => {
            if (result.msg === "success") {
              // do it your code.
              $("#created__purchase-form").append(result.purchaseForm);
              $("form#fasterpay_payment_form").submit();
            }
          },
          error: (err) => {
            alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
          },
        });
      });
    });

    // 링크입력값들 검증
    $(".form__link").each((i, elem) => {
      $(elem).on("keyup paste", function () {
        setTimeout(() => {
          const link = $(this).val();
          const linkURL =
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})/gi;
          const regex = new RegExp(linkURL);
          chkActive();
          if (link === "") {
            $(this).removeClass("active");
            $(this).removeClass("form__error");
          } else if (link.match(regex)) {
            $(this).addClass("active");
            $(this).removeClass("form__error");
          } else {
            $(this).removeClass("active");
            $(this).addClass("form__error");
          }
        }, 1);
      });
    });
  });
};

if (mixinSection) {
  init();
}
