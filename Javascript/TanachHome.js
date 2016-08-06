//=============================================================================
//=============================================================================
//
//       TanachHome.js - Functions associated primarily with Home page.
//
//              11 Jul 2013
//
// Contains 6 major sections:
//
//     1. Core variables, Dispatcher and Home page activation.
//     2. Home page click responses.
//     3. Home page utilities.
//     4. showTEIHeader() target of clicking Tanach title.
//
//=============================================================================
//=== 1 =======================================================================

var baseURL ;
var Server = 'true' ;  // Operating online.

// Home page files:
var homePageFilesLoaded = 'false' ;
var tanachIndexXML ; // The TanachIndex.xml file from the Books directory.       
var tanachXSL ; // Tanach.xsl.xml file from the XSL directory.

// Book page files:
var bookPageFilesLoaded = 'false' ;
var textXSL;        // The Text.xsl.xml file.
var linksXSL ;      // Links.xsl.xml file loaded in setLinksPD.
var linksXML ;      // Links.xml file holding both links and markers.

// Dynamically loaded Book page files.
var tanachHeaderXML;  // The TanachHeader.xml file. from the Pages directory.
var bookXML ;         // The XML file for the selected Book, loaded by parser, P,
                      // from either the server or from the Books directory.

var P ; //  Parser object 
var FontFamily ;

var linkCount = 0 ;
var linkNames = new Array() ;
var linkSites = new Array() ;
var linkFormats = new Array() ;
var selectedLink ;  // Set as a result of the LinksPD.
                    // Loaded by setLinksPD.


// Initial dispatcher.
        
function init(){
  baseURL = getBaseURL("Tanach.xml") ;
  
  loadHomePageFiles() ;  // Always needed. Sets Server variable.
  
  if(window.location.search.substring(1).length == 0){
    setXSLParam(tanachXSL, "queryURL", "false") ;
    setHomePage() ;
  }
  else{
    setXSLParam(tanachXSL, "queryURL", "true") ;
    var queryString = window.location.search.substring(1) ;
    testAndLaunchBookPage(queryString ) ;
  }
}
//----------------------------------------------------------------------------- 

// Home page activation
  
function setHomePage(){
        
//  Place the Home template in the body element.
  FontFamily = askForCookie("FontFamily", "SBL Hebrew") ;
  setXSLParam(tanachXSL, "fontfamily", FontFamily) ;
  setTemplateToNode(tanachIndexXML, tanachXSL, "Home", document.body )  ; 
   
  var Citation  = askForCookie( 'Citation', "");
  document.excerptinput.textfield.value = Citation;
//  Place the BookTable into the Text area.
  setBookTable() ;
}
//=============================================================================
//=== 2 =======================================================================

// Load the Home page files
function loadHomePageFiles(){
  if(homePageFilesLoaded == 'false'){
    tanachIndexXML = loadSarissaDoc(baseURL + "Books/TanachIndex.xml") ;
    tanachXSL = loadSarissaDoc(baseURL + "XSL/Tanach.xsl.xml") ;
    setAsXSL(tanachXSL) ;
    setXSLParam(tanachXSL, "baseURL", baseURL) ;
// Set the Server parameter from the tanachXSL setting.
    Server = getXSLParam(tanachXSL, "server") ;
    homePageFilesLoaded = 'true' ;
  }
}

// Home page click responses.

function setBookTable(){
  setTemplateToNode(tanachIndexXML, tanachXSL, "BookTable", document.getElementById("Text") ) ;
}
function setBookClick(bookIndex) {
  var bookName = getBookNameFromIndex(bookIndex) ;
  var bookAbbrev = getBookAbbrevFromIndex(bookIndex);
  var chapters = getBookChaptersFromIndex(bookIndex) ;
  setXSLParam(tanachXSL, "clickbook", bookName) ;
  setXSLParam(tanachXSL, "clickbookabbrev", bookAbbrev ) ;
  setXSLParam(tanachXSL, "clickbookindex", bookIndex ) ;
  setChapterTable()
  document.excerptinput.textfield.value = bookName ;
}

function setChapterTable(){
  document.excerptinput.textfield.value = getXSLParam(tanachXSL, "clickbook")  ;
  setTemplateToNode(tanachIndexXML, tanachXSL, "ChapterTable", document.getElementById("Text") ) ;
}

function setChapterClick(chapter) {
  setXSLParam(tanachXSL, "clickchapter",chapter ) ;
  setVerseTable()  ;
}

function setVerseTable(){
  document.excerptinput.textfield.value = getXSLParam(tanachXSL, "clickbook") 
       + " " + getXSLParam(tanachXSL, "clickchapter");
  setTemplateToNode(tanachIndexXML, tanachXSL, "VerseTable", document.getElementById("Text") ) ;
}
function setVerseClick(verse) {
  setXSLParam(tanachXSL, "clickverse", verse ) ;
  setLastVerseTable()  ;
}

function setLastVerseTable(){
  document.excerptinput.textfield.value = getXSLParam(tanachXSL, "clickbook") 
       + " " + getXSLParam(tanachXSL, "clickchapter")
       + ":" + getXSLParam(tanachXSL, "clickverse");
  setTemplateToNode(tanachIndexXML, tanachXSL, "LastVerseTable", document.getElementById("Text") ) ;
}
//-----------------------------------------------------------------------------

// The following two functions are the ONLY way to get from the Home page
// to the Book page.

function setLastVerseClick(lastVerse) {
  testAndLaunchBookPage(document.excerptinput.textfield.value + " - " + lastVerse ) ;
}

//  enterHomeCitation() ;  Called when RETURN occurs in the Home Citation field.
function enterHomeCitation(){
  if( window.location.search.substring(1).length ==0){ 
    testAndLaunchBookPage(document.excerptinput.textfield.value) ;
  }
// Previous page had a query parameter, load the Home page.
  else{
    createCookie("Citation", document.excerptinput.textfield.value, 3650) ;
    window.location = "Tanach.xml" ;
  }
}

//  enterBookCitation() ;  Called when RETURN occurs in the Book Citation field.
function enterBookCitation(){
  if( window.location.search.substring(1).length ==0){ 
    if(document.excerptinput.textfield.value.length==0){
      setHomePage()
    }
    else{
      testAndLaunchBookPage(document.excerptinput.textfield.value) ;
      }
  }
// Previous page had a query parameter, load the Home page.
  else{
    createCookie("Citation", document.excerptinput.textfield.value, 3650) ;
    window.location = "Tanach.xml" ;
  }
}
 
// Checks the citation and launches the Book page if it's OK.
function testAndLaunchBookPage(citation){
  P = checkCitation(citation) ;  
  if(P.error != ''){
    setTemplateToNode(tanachIndexXML, tanachXSL, "Home", document.body) ;
    document.excerptinput.textfield.value = citation ;
    document.getElementById("excerpterror").innerHTML = P.error ;
    setBookTable() ;
    return ;
  }
  setBookPage() ;
}

function returnToHomePage() {
  setHomePage() ;
  }

//=============================================================================
//=== 3 =======================================================================

// Home page utilities.

function getBookNameFromIndex(bookIndex) {
  var searchString = "/Tanach/tanach/book["  + bookIndex + "]/names/name" ;
  var name = tanachIndexXML.selectSingleNode(searchString)  ;
  if (name == null){
    alert("getBookNameFromIndex: bookIndex = " + bookIndex + "    Node " + searchString + " not found.") ;
    return ""  ;
  }
  else{
    var t = name.firstChild;
    return t.nodeValue ;
  }
}
function getBookAbbrevFromIndex(bookIndex) {
  var searchString = "/Tanach/tanach/book["  + bookIndex + "]/names/abbrev" ;
  var name = tanachIndexXML.selectSingleNode(searchString)  ;
  if (name == null){
    alert("getBookAbbrevFromIndex: bookIndex = " + bookIndex + "    Node " + searchString + " not found.") ;
    return ""  ;
  }
  else{
    var t = name.firstChild;
    return t.nodeValue ;
  }
}
function getBookNumberFromIndex(bookIndex) {
  var searchString = "/Tanach/tanach/book["  + bookIndex + "]/names/number" ;
  var name = tanachIndexXML.selectSingleNode(searchString)  ;
  if (name == null){
    alert("getBookNumberFromIndex: bookIndex = " + bookIndex + "    Node " + searchString + " not found.") ;
    return ""  ;
  }
  else{
    var t = name.firstChild;
    return t.nodeValue ;
  }
}
function getBookChaptersFromIndex(bookIndex) {
  var searchString = "/Tanach/tanach/book["  + bookIndex + "]/cs" ;
  var name = tanachIndexXML.selectSingleNode(searchString)  ;
  if (name == null){
    alert("getBookChaptersFromIndex: bookIndex = " + bookIndex + "    Node " + searchString + " not found.") ;
    return ""  ;
  }
  else{
    var t = name.firstChild;
    return t.nodeValue ;
  }
}
//=============================================================================
//=== 4 =======================================================================

// Response function for clicking on Tanach title.

function showTEIHeader(){
  var url = "Pages/TEIHeader.xml" ; 
  var w = window.open(url,"","", "") ;
  }
//=============================================================================
//=============================================================================
//   EOF

