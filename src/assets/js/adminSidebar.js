import $ from "jquery";

const adminMenu = document.getElementById("admin__menu-items");

function init() {
  $(document).ready(() => {
    const pathname = window.location.pathname.split("/");

    $("ul#admin__menu-items .menu-items li").removeClass("active");
    $(`#admin__menu-${pathname[2]}`).addClass("active");
  });
}

if (adminMenu) {
  init();
}
