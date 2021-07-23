window.onload=function(){
    const jsdURL = "https://cdn.jsdelivr.net/npm/turna_assets@1.1.3/img/xsl.sh/"
    var panelCover = document.getElementById("panel-cover");
    var rndNum = Math.floor(Math.random() * 10).toString();
    var destURL = jsdURL + rndNum + ".webp";
    panelCover.setAttribute("style" ,"background-image: url('" + destURL + "')");
  };