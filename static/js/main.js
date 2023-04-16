$(document).ready(function () {
  $(".panel-cover").on("click", "a.route-push", function (e) {
    e.preventDefault();
    destroyObjects();
    const realPath = $(this).attr("href").substring(2) == "/blog" ? "" : $(this).attr("href").substring(2);

    loadContentAndCollapsePanel(realPath);
  });

  $(".content-wrapper__inner").on("click", "a.route-push", function (e) {
    e.preventDefault();
    destroyObjects();
    const realPath = $(this).attr("href").substring(2);

    if (realPath.startsWith("tags")) {
      loadContentAndCollapsePanel(realPath);
    } else {
      $("html, body").animate({ scrollTop: 0 }, "fast", function () {
        loadContentAndCollapsePanel(realPath);
      });
    }
  });

  function loadContentAndCollapsePanel(realPath) {
    $(".content-wrapper__inner").load(realPath + "/index.html .content-wrapper__main, .footer", function () {
      $(".main-post-list").removeClass("hidden");
      collapsePanel();
      activateScripts(realPath);
      updateState(realPath);
    });
  }

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

  function updateState(realPath) {
    $.get(realPath + "/index.html", function (data) {
      const head = $("<head>").html(data);

      const titleAndMetaTags = head.find("title, meta");
      $("head title, head meta").remove();
      $("head").append(titleAndMetaTags);

      history.pushState(null, document.title, "/#" + (realPath == "" ? "/blog" : realPath));
    });
  }

  function activateScripts(realPath) {
    if (typeof MathJax !== "undefined") MathJax.typeset();
    $.get(realPath + "/index.html", function (data) {
      const content = $(data).find("#gitalk-container");
      const scripts = content.filter("script");

      $(".post-comments").html(content);

      scripts.each(function () {
        eval($(this).text());
      });
    });
  }

  function destroyObjects() {
    if (typeof gitalk != "undefined") gitalk = undefined;
  }

  if (location.hash) {
    const realPath = location.hash.substring(1);
    loadContentAndCollapsePanel(realPath);
  }

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
