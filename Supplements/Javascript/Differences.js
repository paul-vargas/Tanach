//=============================================================================
//=============================================================================
//
//  Differences.js Javascript functions for Differences.xml
//
//              15 Jul 2011
//
// Contains five major sections:
//
//     1. Differences dispatching.
//
//  Differences.xml loads Utilities.js and has access to its functions too!
//
// Copyright C.V.Kimball 2006
//
//=============================================================================
//=============================================================================
// Initial dispatcher.
 
var filename ;  // Name of file in the Supplements directory.
var baseURL ;   // Full path to the Supplements directory.

var filesLoaded = 'false' ;
var differencesXML ; // Differences.xml file from the Supplements directory.
var differencesXSL ; // Differences.xsl.xml file from the Supplements/XSL directory.
                
function init(){
  filename = getFilename() ;
  baseURL = getBaseURL(filename) ;
  loadFiles() ;      
  document.title = "WLC version differences" ;
  setTemplateToNode(differencesXML, differencesXSL, "Differences", document.body )  ; 
 }
//=============================================================================
//=== 2 =======================================================================

// Load the Home page files
function loadFiles(){
  if(filesLoaded == 'false'){
    differencesXML = loadSarissaDoc(baseURL + filename) ;
    
    differencesXSL = loadSarissaDoc(baseURL + "XSL/Differences.xsl.xml") ;
    setAsXSL(differencesXSL) ;
    setXSLParam(differencesXSL, "baseURL", baseURL) ;

    filesLoaded = 'true' ;
  }
}

// Gives the book results when a book name is clicked on the main page.
function showBook( bookname ){
  setXSLParam(differencesXSL, "selectedbook", bookname ) ;
  setXSLParam(differencesXSL, "backbutton", "true" ) ;
  document.title = "Differences in " + bookname  ;
  setTemplateToNode(differencesXML, differencesXSL, "Book", document.body )  ; 
  set2PDs() ;
  setTemplateToNode(differencesXML, differencesXSL, "Excerpt", document.getElementById("Text") ) ;
}

function previousPage(){
  setTemplateToNode(differencesXML, differencesXSL, "Differences", document.body )  ; 
  document.title = "WLC version differences" ;
}  
  
// Set the PD's from cookies or the XSL file after the Book page is displayed.
function set2PDs(){
  var fontsize = getXSLParam(differencesXSL, "fontsize") ;  
  fontsize = askForCookie("FontSize", fontsize) ;
  setSelectedValue("FontSizePD", fontsize) ; 
  setXSLParam(differencesXSL, "fontsize", fontsize ) ;
  
  
  var MD = getXSLParam(differencesXSL, "showMD") ;  
  MD = askForCookie("MD", MD ) ;
  setSelectedValue("MDPD", MD) ; 
  setXSLParam(differencesXSL, "showMD", MD ) ;
  
  var fontfamily = getXSLParam(differencesXSL, "fontfamily") ;  
  fontfamily = askForCookie("FontFamily", fontfamily) ;
  setXSLParam(differencesXSL, "fontfamily", fontfamily ) ;
}  
//=============================================================================

// The following are called by the Excerpt page.

  
function changeMD(){
  var MD = getSelectedValue('MDPD') ;
  createCookie("MD", MD,  3650) ;
  setXSLParam( differencesXSL, "showMD", MD) ;
  if(MD=='true'){
    setXSLParam(differencesXSL, "content", 'Morphology') ;
    }
  else{
    setXSLParam(differencesXSL, "content", 'Accents') ;
    }
  setTemplateToNode(differencesXML, differencesXSL, "Excerpt", document.getElementById("Text") ) ;
}
           
function changeFontSize(){
  var fontsize = getSelectedValue('FontSizePD') ;
  createCookie("FontSize", fontsize,  3650) ;
  setXSLParam(differencesXSL, "fontsize", fontsize) ;
  setXSLParam(differencesXSL, "cellpadding", 4 + fontsize/4 ) ;
// Sets the reducedfontsize and Englishfontsize variables
  var reducedfontfraction = 0.75 ;
  var Englishfontfraction = 0.75 ;  
  setXSLParam(differencesXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
  setXSLParam(differencesXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
  setTemplateToNode(differencesXML, differencesXSL, "Excerpt", document.getElementById("Text") ) ;
}

//=============================================================================
//=============================================================================
   