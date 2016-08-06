//=============================================================================
//=============================================================================
//
//  Verses.js Javascript functions for Verses.xml
//
//              26 Oct 2014
//
// Contains five major sections:
//
//     1. Verses dispatching.
//
//  Verses.xml loads Tanach/Javascript/Utilities.js and has access to its functions too!
//
// Copyright C.V.Kimball 2006
//
//=============================================================================
//=============================================================================
// Initial dispatcher.
 
var filename ;  // Name of file in the Supplements directory.
var baseURL ;   // Full path to the Supplements directory.

var filesLoaded = 'false' ;
var versesXML ; // verses.xml file from the Supplements directory.
var versesXSL ; // verses.xsl.xml file from the Supplements/XSL directory.
var bookXML ; // XML book file from the Tanach/Books directory.
                
function init(){
  filename = getFilename() ;
  baseURL = getBaseURL(filename) ;
  loadFiles() ;      
  document.title = "WLC verse lengths" ;
  setTemplateToNode(versesXML, versesXSL, "Verses", document.body )  ; 
 }
//=============================================================================
//=== 2 =======================================================================

// Load the Home page files
function loadFiles(){
  if(filesLoaded == 'false'){
    versesXML = loadSarissaDoc(baseURL + filename) ;
    versesXSL = loadSarissaDoc(baseURL + "XSL/Verses.xsl.xml") ;
    setAsXSL(versesXSL) ;
    setXSLParam(versesXSL, "baseURL", baseURL) ;
    filesLoaded = 'true' ;
  }
}

function showVerseLengths(){
  setXSLParam(versesXSL, "backbutton", "true" ) ;
  document.title = "Verse length histogram" ;
  var KQ = getKQ() ;
  setTemplateToNode(versesXML, versesXSL, "VerseLengths", document.body )  ; 
  setSelectedValue("KQPD", KQ) ;
}

function showNameVerses(){
  setXSLParam(versesXSL, "backbutton", "true" ) ;
  document.title = "Name verses" ;
  setTemplateToNode(versesXML, versesXSL, "NameVerses", document.body )  ; 
 }

function previousPage(){
  setXSLParam(versesXSL, "backbutton", "false" ) ;
  setTemplateToNode(versesXML, versesXSL, "Verses", document.body )  ; 
  document.title = "WLC verse lengths" ;
}  
//=============================================================================
  
// The following are called by the VersesLength analysis.

function getKQ(){
  var KQ = getXSLParam(versesXSL, "versetype")
  askForCookie("KQ", KQ,  3650) ;
  setXSLParam(versesXSL, "versetype", KQ) ;
  return KQ ;
}

function changeKQ(){
  var KQ = getSelectedValue('KQPD') ;
  createCookie("KQ", KQ,  3650) ;
  setXSLParam(versesXSL, "versetype", KQ) ;
  setTemplateToNode(versesXML, versesXSL, "VerseLengths", document.body )  ; 
  setSelectedValue("KQPD", KQ) ;
}

function showCount( book, bookfilename, count, number ){
  var n = parseInt(count) ;
  var nn = parseInt(number) ;
  setXSLParam(versesXSL, "selectedbook", book) ;
  setXSLParam(versesXSL, "versecount", n) ;
  setXSLParam(versesXSL, "numberofverses", nn) 
  var bookPath = baseURL + "../Books/" + bookfilename +".xml" ;
  bookXML = loadSarissaDoc(bookPath) ;
  window.status = "Now searching " + bookfilename + " ..." ;
  var fontsize = getFontSize() ;
  setTemplateToNode(bookXML, versesXSL, "VerseLengthSearch", document.body )  ; 
  setSelectedValue("FontSizePDVerseLengthSearch", fontsize) ; 
}  


// Gets the fontsize from the cookie or XSL value.  Sets FontFamily, too.        
function getFontSize(){
  var fontsize = getXSLParam(versesXSL, "fontsize") ;  
  fontsize = askForCookie("FontSize", fontsize) ;
  setXSLParam(versesXSL, "fontsize", fontsize ) ;
  var fontfamily = getXSLParam(versesXSL, "fontfamily") ;  
  fontfamily = askForCookie("FontFamily", fontfamily) ;
  setXSLParam(versesXSL, "fontfamily", fontfamily ) ;
  return fontsize ;
}

function changeFontSizeVerseLengthSearch(){
  var fontsize = getSelectedValue('FontSizePDVerseLengthSearch') ;
  createCookie("FontSize", fontsize,  3650) ;
  setXSLParam(versesXSL, "fontsize", fontsize) ;
  setXSLParam(versesXSL, "cellpadding", 4 + fontsize/4 ) ;
// Sets the reducedfontsize and Englishfontsize variables
  var reducedfontfraction = 0.75 ;
  var Englishfontfraction = 0.75 ;  
  setXSLParam(versesXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
  setXSLParam(versesXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
  setTemplateToNode(bookXML, versesXSL, "VerseLengthSearch", document.body ) ;
  setSelectedValue("FontSizePDVerseLengthSearch", fontsize) ; 
}

function previousPageVLS(){
  var KQ = getKQ() ;
  setTemplateToNode(versesXML, versesXSL, "VerseLengths", document.body )  ; 
  setSelectedValue("KQPD", KQ) ;  
}
//=============================================================================
  
function changeFontSizeNameVerseSearch(){
  var fontsize = getSelectedValue("FontSizePDNameVerseSearch") ;
  createCookie("FontSize", fontsize,  3650) ;
  setXSLParam(versesXSL, "fontsize", fontsize) ;
  
  setXSLParam(versesXSL, "cellpadding", 4 + fontsize/4 ) ;
// Sets the reducedfontsize and Englishfontsize variables
  var reducedfontfraction = 0.75 ;
  var Englishfontfraction = 0.75 ;  
  setXSLParam(versesXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
  setXSLParam(versesXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
  setSelectedValue("FontSizePDNameVerseSearch", fontsize) ;
  clearElement(bookXML, versesXSL, "BookSearchResult", "NamesSearch") ;
  getVerses() ;
}

function showName( firstletter, lastletter, count ){
  ifirst = parseInt(firstletter) ;
  ilast = parseInt(lastletter)
  var firstletters = versesXML.selectNodes("/Verses/summary/nameverses/firstletters/firstletter") ;
  var lastletters = versesXML.selectNodes("/Verses/summary/nameverses/lastletters/lastletter") ;
  firstletter = firstletters[ifirst-1].firstChild.nodeValue  ; 
  lastletter = lastletters[ilast-1].firstChild.nodeValue ;
  setXSLParam(versesXSL, "firstletter", firstletter) ;
  setXSLParam(versesXSL, "lastletter", lastletter) ;
  setXSLParam(versesXSL, "versecount", count) ;
  var fontsize = getFontSize() ;
  setTemplateToNode(versesXML, versesXSL, "NameVerseSearch", document.body )  ;
  setSelectedValue("FontSizePDNameVerseSearch", fontsize) ;
  
  getVerses() ;
}


function getVerses(){
  var Books = versesXML.selectNodes("/Verses/book/book/filename") ;
  for (i=0; i < Books.length; i++){
    var book = Books[i].firstChild.nodeValue ; 
    window.status = "Now searching " + book + " ..." ;
    bookXML = loadSarissaDoc(baseURL + "../Books/" + book + ".xml" ) ;
    appendToElement(bookXML, versesXSL, "BookSearchResult", "NamesSearch") ;
  }
}

// Used only in Verses supplement.
function appendToElement(XML, XSL, Template, ID){
  setXSLParam(XSL, "template", Template) ;
  var xsltpro = new XSLTProcessor() ;
  xsltpro.importStylesheet(XSL) ;
  var newElement = xsltpro.transformToDocument(XML) ;
  var Serializer = new XMLSerializer() ;
  document.getElementById(ID).innerHTML = document.getElementById(ID).innerHTML + Serializer.serializeToString(newElement);  
  }
  
// Used only in Verses supplement.
function clearElement(XML, XSL, Template, ID){
  setXSLParam(XSL, "template", Template) ;
  var xsltpro = new XSLTProcessor() ;
  xsltpro.importStylesheet(XSL) ;
  var newElement = xsltpro.transformToDocument(XML) ;
  var Serializer = new XMLSerializer() ;
  document.getElementById(ID).innerHTML = "";  
  }
  
function previousPageNVS(){
  setTemplateToNode(versesXML, versesXSL, "NameVerses", document.body )  ; 
}

//=============================================================================
//=============================================================================
   