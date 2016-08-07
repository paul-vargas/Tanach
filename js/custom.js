
/* global P, tanachXSL */

$(function() {
    $("body").css({
        margin: "2px"
    });
});

function setBookMark() {
    // Crude deblanker added 11 Feb 2016
    var bookAbbrev = "";
    for (k = 0; k < P.bookabbrev.length; k++) {
        if (P.bookabbrev.charAt(k) != ' ') {
            bookAbbrev = bookAbbrev + P.bookabbrev.charAt(k);
        }
    }

    var location = "Tanach.xml?"
            + bookAbbrev + P.chapter + ":" + P.verse
            + "-" + P.lastchapter + ":" + P.lastverse;
    window.prompt("BookMark", "http://www.tanach.us/" + location);
}

function setShowVerse() {
    document.excerptinput.textfield.value = getXSLParam(tanachXSL, "clickbook")
            + " " + getXSLParam(tanachXSL, "clickchapter");
    testAndLaunchBookPage(document.excerptinput.textfield.value);
}

function init() {
    baseURL = getBaseURL("Tanach.xml");
    loadHomePageFiles();  // Always needed. Sets Server variable.
    
    var theme = localStorage.getItem("theme");
    if (theme == "night") {
        $("#linktheme").attr("href", "css/night.css");
    } else {
        $("#linktheme").attr("href", "css/day.css");
    }

    var queryString = window.location.search.substring(1);
    if (queryString.length == 0) {
        setXSLParam(tanachXSL, "queryURL", "false");
        setHomePage();
    } else {
        setXSLParam(tanachXSL, "queryURL", "true");
        testAndLaunchBookPage(queryString);
    }
}