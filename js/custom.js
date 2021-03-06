
/* global P, tanachXSL */

$(function () {
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

/* Overwritings for cookie functions */
function askForCookie(name, defaultvalue) {
    var thisCookie = readCookie(name);
    if (!thisCookie) {
        return defaultvalue;
    }
    return thisCookie;
}

function clearCookies() {
    localStorage.clear();
}

function createCookie(name, value, days) {
    localStorage.setItem(name, value);
}

function readCookie(name) {
    return localStorage.getItem(name);
}

/* Other overwritings */

function init() {
    baseURL = getBaseURL("Tanach.xml");
    loadHomePageFiles();  // Always needed. Sets Server variable.

    var theme = localStorage.theme || "day";
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

function setShowVerse() {
    document.excerptinput.textfield.value = getXSLParam(tanachXSL, "clickbook")
            + " " + getXSLParam(tanachXSL, "clickchapter");
    testAndLaunchBookPage(document.excerptinput.textfield.value);
}

function setLastVerseClick(lastVerse) {
    testAndLaunchBookPage(document.excerptinput.textfield.value + " - " + lastVerse);
}

function enterBookCitation() {
    if (window.location.search.substring(1).length == 0) {
        if (document.excerptinput.textfield.value.length == 0) {
            setHomePage()
        } else {
            testAndLaunchBookPage(document.excerptinput.textfield.value);
        }
    }
    // Previous page had a query parameter, load the Home page.
    else {
        createCookie("Citation", document.excerptinput.textfield.value, 3650);
        window.location = "Tanach.xml";
    }
}

function setHomePage() {

    //  Place the Home template in the body element.
    FontFamily = askForCookie("FontFamily", "SBL Hebrew");
    setXSLParam(tanachXSL, "fontfamily", FontFamily);
    setTemplateToNode(tanachIndexXML, tanachXSL, "Home", document.body);

    var Citation = askForCookie('Citation', "");
    document.excerptinput.textfield.value = Citation;
    //  Place the BookTable into the Text area.
    setBookTable();

    var theme = askForCookie("theme", "day");
    if (theme == "night") {
        $("#linkDay").show();
        $("#linkNight").hide();
    } else {
        $("#linkDay").hide();
        $("#linkNight").show();
    }
    $("a[href='Pages/CitationSyntax.html']").attr("href", "Pages/CitationSyntaxApp.html?theme=" + theme);
    $("a[href='Pages/About.html']").attr("href", "Pages/AboutApp.html?theme=" + theme);
    $("a[href='Pages/Instructions.html']").attr("href", "Pages/InstructionsApp.html?theme=" + theme);
}

function changeLayout() {
    var layout = getSelectedValue('LayoutPD');
    if (layout != 'Verses' && layout != 'Chapter') {
        createCookie("Layout", layout, 3650);
        setXSLParam(textXSL, "format", layout);
        setSelectedValue("LayoutPD", layout);
        setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text"));
    }
}

function changeLayout2() {
    var layout = getSelectedValue('LayoutPD2');
    if (layout == 'Verses' || layout == 'Chapter') {
        // PD requests change in view.
        var VersesMode = getXSLParam(textXSL, 'view')
        // Chapter=0 or Verses=1
        var layout = getXSLParam(textXSL, 'format')
        // Full, Note-free, Text-only, Qere-only
        if (VersesMode == '1') {
            // In Verse view=1, go to Chapter view=0
            setXSLParam(textXSL, "view", '0');
            createCookie("View", "0", 3650);
        } else {
            // In Chapter view=0, go to Verses view=1
            setXSLParam(textXSL, "view", '1');
            createCookie("View", "1", 3650);
        }
    }
    createCookie("Layout", layout, 3650);
    setXSLParam(textXSL, "format", layout);
    //setSelectedValue("LayoutPD2", layout);
    setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text"));
}

// Set the PD's from cookies after the Book page is displayed.
function setPDs() {
    var layout = getXSLParam(textXSL, "format");
    layout = askForCookie("Layout", layout);
    var view = getXSLParam(textXSL, 'view');
    view = askForCookie("View", view);
    setXSLParam(textXSL, "view", view);
    setSelectedValue("LayoutPD2", layout);
    setXSLParam(textXSL, "format", layout);

    var content = getXSLParam(textXSL, "content");
    content = askForCookie("Content", content);
    setSelectedValue("ContentPD", content);
    setXSLParam(textXSL, "content", content);

    var fontsize = getXSLParam(textXSL, "fontsize");
    fontsize = askForCookie("FontSize", fontsize);
    setSelectedValue("FontSizePD", fontsize);
    setXSLParam(textXSL, "fontsize", fontsize);
    setDependentFontSizes(textXSL);

    if (document.getElementById("DHPD") != null) { // Do nothing if not Torah
        var DH = getXSLParam(textXSL, "DH");
        DH = askForCookie("DHMode", DH);
        setSelectedValue("DHPD", DH);
        setXSLParam(textXSL, "DH", DH);
    }
}

function changeFontSize() {
    var fontsize = getSelectedValue('FontSizePD');
    if (fontsize == 'change') {
        setXSLParam(tanachXSL, "fontfamily", FontFamily)
        setTemplateToNode(tanachIndexXML, tanachXSL, "ChangeFont", document.body);
        return;
    }
    if (fontsize == 'test') {
        fontsize = getXSLParam(textXSL, "fontsize");
        setSelectedValue("FontSizePD", fontsize);
        var fontfamily = getXSLParam(textXSL, "fontfamily");
        var url = "Pages/FontTest.xml?" + fontfamily;
        var w = window.open(url, "", "", "");
        return;
    }
    createCookie("FontSize", fontsize, 3650);
    setXSLParam(textXSL, "fontsize", fontsize);
    setDependentFontSizes(textXSL);
    setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text"));
}

function changeTheme() {
    var theme = localStorage.theme || "day";
    if (theme == "night") {
        localStorage.theme = "day";
        $("#linktheme").attr("href", "css/day.css");
        $("#linkDay").hide();
        $("#linkNight").show();
    } else {
        localStorage.theme = "night";
        $("#linktheme").attr("href", "css/night.css");
        $("#linkDay").show();
        $("#linkNight").hide();
    }
}