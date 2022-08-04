import $ from "jquery";
import moment from "moment";

const getHigherPage = document.getElementById("getHigher__page");

const init = () => {
  $(document).ready(() => {
    // 타이머 카운트다운 함수
    const timerCountdown = () => {
      const timerTime = $("p#timer__time").text();
      let timerTimeMinutes = moment.duration(timerTime).asSeconds();

      const MinusMinuteTimerTime = timerTimeMinutes - 1;
      function minutes_to_hhmm(numberOfMinutes) {
        //create duration object from moment.duration
        var duration = moment.duration(numberOfMinutes, "seconds");

        //calculate hours
        const hours = duration.years() * (365 * 24) + duration.months() * (30 * 24) + duration.days() * 24 + duration.hours();
        var hh = hours < 10 ? `0${hours}` : hours;

        //get minutes
        const minutes = duration.minutes();
        var mm = minutes < 10 ? `0${minutes}` : minutes;

        // get seconds
        const seconds = duration.seconds();
        var ss = seconds < 10 ? `0${seconds}` : seconds;

        //return total time in hh:mm format
        return hh + ":" + mm + ":" + ss;
      }
      $("p#timer__time").text(minutes_to_hhmm(MinusMinuteTimerTime));
    };
    // 타이머 status가 running일 경우에만 타이머 실행 [1분마다]
    const timerStatus = $("p#timer__time").attr("data-status");
    if (timerStatus === "running") {
      setInterval(timerCountdown, 1000);
    }

    // 미션 Start 버튼 클릭 시 이벤트
    $("button#mission__start-btn").click(function () {
      const missionID = $(this).parents(".swiper-slide").attr("data-id");
      $.ajax({
        url: "/api/mission-start",
        type: "POST",
        data: { missionID },
        success: (result) => {
          if (result.msg === "success") {
            window.location.reload();
          }
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });

    // 미션 Complete 버튼 클릭 시 이벤트
    $("button#mission__complete-btn").click(function () {
      const missionID = $(this).parents(".swiper-slide").attr("data-id");
      $.ajax({
        url: "/api/mission-complete",
        type: "POST",
        data: { missionID },
        success: (result) => {
          if (result.msg === "success") {
            window.location.reload();
          }
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });

    // 미션 Restart 버튼 클릭 시 이벤트
    $("button#mission__restart-btn").click(function () {
      const missionID = $(this).parents(".swiper-slide").attr("data-id");
      $.ajax({
        url: "/api/mission-restart",
        type: "POST",
        data: { missionID },
        success: (result) => {
          if (result.msg === "success") {
            window.location.reload();
          }
        },
        error: (err) => {
          alert(`An error has occurred.:\r\n${JSON.stringify(err)}`);
        },
      });
    });
  });
};

if (getHigherPage) {
  init();
}
