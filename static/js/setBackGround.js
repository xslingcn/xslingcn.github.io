(function(){
  var panelCover = document.getElementById("panel-cover");

  if (location.pathname === "/" && !location.hash) {
    // panelCover.setAttribute("style", "background-image: none");

    var backgroundImgEl = document.createElement("img");
    backgroundImgEl.setAttribute("class", "background-image");
    backgroundImgEl.setAttribute("src", "https://cdn.jsdelivr.net/npm/turna_assets@1.1.9/img/xsl.sh/1.webp");

    var videoEl = document.createElement("video");
    videoEl.setAttribute("class", "background-video");
    videoEl.setAttribute("autoplay", "autoplay");
    videoEl.setAttribute("muted", "muted");
    videoEl.setAttribute("src", "https://cdn.jsdelivr.net/npm/turna_assets@1.1.9/video/xsl.sh/ottoai.webm");

    panelCover.insertBefore(backgroundImgEl, panelCover.firstChild);

    panelCover.appendChild(videoEl);

    videoEl.addEventListener("canplay", function () {
      videoEl.muted = true;
      videoEl.play();
      panelCover.removeChild(backgroundImgEl);
    });

    videoEl.addEventListener("ended", function () {
      backgroundImgEl.setAttribute("src", "https://cdn.jsdelivr.net/npm/turna_assets@1.1.9/img/xsl.sh/10.webp");
      panelCover.insertBefore(backgroundImgEl, panelCover.firstChild);
      panelCover.removeChild(videoEl);
    });
  } else {
    var backgroundImgEl = document.createElement("img");
    backgroundImgEl.setAttribute("class", "background-image");
    backgroundImgEl.setAttribute("src", "https://cdn.jsdelivr.net/npm/turna_assets@1.1.9/img/xsl.sh/10.webp");
    panelCover.insertBefore(backgroundImgEl, panelCover.firstChild);
  }
  panelCover.removeChild(document.getElementById("background-animator"));

}());

// window.onload=function(){
//     const jsdURL = "https://cdn.jsdelivr.net/npm/turna_assets@1.1.3/img/xsl.sh/"
//     var panelCover = document.getElementById("panel-cover");
//     var rndNum = Math.floor(Math.random() * 10).toString();
//     var destURL = jsdURL + rndNum + ".webp";
//     panelCover.setAttribute("style" ,"background-image: url('" + destURL + "')");
//   };