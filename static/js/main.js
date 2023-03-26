$(document).ready(function () {
  $(".panel-cover").on("click", "a.route-push", function () {
    const realPath = $(this).attr("href").substring(2) == "blog" ? "" : $(this).attr("href").substring(2);

    $(".content-wrapper__inner").load(realPath + "/index.html .content-wrapper__main, .footer", function () {
      $(".main-post-list").removeClass("hidden");
      collapsePanel();
      activateScripts();
    });
  });

  function collapsePanel() {
    if (!$(".panel-cover").hasClass("panel-cover--collapsed")) {
      currentWidth = $(".panel-cover").width();
      if (currentWidth < 960) {
        $(".panel-cover").addClass("panel-cover--collapsed");
      } else {
        $(".panel-cover").css("max-width", currentWidth);
        $(".panel-cover").animate({ "max-width": "700px", width: "30%" }, 400, (swing = "swing"), function () {});
      }
    }
  }

  function activateScripts() {  
    if (typeof MathJax !== "undefined") MathJax.typeset();
    if (typeof gitalk != "undefined") gitalk.render("gitalk-container");
  }

  $(".content-wrapper__inner").on("click", "a.route-push", function () {
    const realPath = $(this).attr("href").substring(2);

    if (realPath.startsWith("tags")) {
      $(".content-wrapper__main").load(realPath + "/index.html", function () {
        $(".main-post-list").removeClass("hidden");
      });
    } else
      $("html, body").animate({ scrollTop: 0 }, "slow", function () {
        $(".content-wrapper__main").load(realPath + "/index.html", function () { 
          activateScripts();
        });
      });
  });

  $(".btn-mobile-menu__icon").click(function () {
    if ($(".navigation-wrapper").css("display") == "block") {
      $(".navigation-wrapper").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
        $(".navigation-wrapper").toggleClass("visible animated bounceOutUp");
        $(".navigation-wrapper").off("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
      });
      $(".navigation-wrapper").toggleClass("animated bounceInDown animated bounceOutUp");
    } else {
      $(".navigation-wrapper").toggleClass("visible animated bounceInDown");
    }
    $(".btn-mobile-menu__icon").toggleClass("fa fa-list fa fa-angle-up animated fadeIn");
  });

  $(".navigation-wrapper .blog-button").click(function () {
    if ($(".navigation-wrapper").css("display") == "block" && window.location.pathname == "/" && !window.location.hash) {
      $(".navigation-wrapper").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
        $(".navigation-wrapper").toggleClass("visible animated bounceOutUp");
        $(".navigation-wrapper").off("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
      });

      $(".navigation-wrapper").toggleClass("animated bounceInDown animated bounceOutUp");
    }

    $(".btn-mobile-menu__icon").toggleClass("fa fa-list fa fa-angle-up animated fadeIn");
  });
});
