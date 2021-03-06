(function(){
  var panelCover = document.getElementById("panel-cover");
  var backgroundImgae = document.createElement("img");
  backgroundImgae.setAttribute("class", "background-image");
  backgroundImgae.setAttribute("src", "https://cdn.jsdelivr.net/npm/turna_assets@1.1.8/img/xsl.sh/10.webp");
  // backgroundImgae.setAttribute("src", "./video/0.webp");

  if (location.pathname === "/" && !location.hash) {
    panelCover.setAttribute("style", "background-image: url('https://cdn.jsdelivr.net/npm/turna_assets@1.1.9/img/xsl.sh/ottoai.webp')");

    var videoEl = document.createElement("video");
    videoEl.setAttribute("class", "background-video");
    videoEl.setAttribute("autoplay", "autoplay");
    videoEl.setAttribute("muted", "muted");

    var source = document.createElement("source");
    source.setAttribute("src", "https://cdn.jsdelivr.net/npm/turna_assets@1.1.9/video/xsl.sh/ottoai.webm");
    source.setAttribute("type", 'video/webm;codecs="vp8, vorbis"');

    panelCover.appendChild(videoEl);
    videoEl.appendChild(source);
    videoEl.play;

    videoEl.addEventListener("canplay", function () {
      panelCover.style.backgroundImage = "none";
      videoEl.muted = true;
      videoEl.play();
    });

    videoEl.addEventListener("ended", function () {
      panelCover.style.backgroundImage = "none";
      panelCover.removeChild(videoEl);
      panelCover.insertBefore(backgroundImgae, panelCover.firstChild);
    });
    return;
  }
  panelCover.insertBefore(backgroundImgae, panelCover.firstChild);
}());

// window.onload=function(){
//     const jsdURL = "https://cdn.jsdelivr.net/npm/turna_assets@1.1.3/img/xsl.sh/"
//     var panelCover = document.getElementById("panel-cover");
//     var rndNum = Math.floor(Math.random() * 10).toString();
//     var destURL = jsdURL + rndNum + ".webp";
//     panelCover.setAttribute("style" ,"background-image: url('" + destURL + "')");
//   };