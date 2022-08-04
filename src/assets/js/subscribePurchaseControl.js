import $ from "jquery";

const subscribePurchasePage = document.getElementById("subscribePurchase__page");

const init = () => {
  $(document).ready(() => {
    // 구독 버튼 Pay Now를 Subscribe Now로 변경
    $("input#fasterpay_submit").val("Subscribe Now");
  });
};

if (subscribePurchasePage) {
  init();
}
