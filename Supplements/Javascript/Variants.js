//=============================================================================
//=============================================================================
//
//  Variants.js Javascript functions for variants.xml
//
//              15 Jul 2011
//
// Contains five major sections:
//
//     1. Variants dispatching.
//
//  Variants.xml loads Utilities.js and has access to its functions too!
//
// Copyright C.V.Kimball 2006
//
//=============================================================================
//=============================================================================
// Initial dispatcher.
 
var filename ;  // Name of file in the Supplements directory.
var baseURL ;   // Full path to the Supplements directory.

var filesLoaded = 'false' ;
var variantsXML ; // variants.xml file from the Supplements directory.
var variantsXSL ; // variants.xsl.xml file from the Supplements/XSL directory.
                
function init(){
  filename = getFilename() ;
  baseURL = getBaseURL(filename) ;
  loadFiles() ;      
  document.title = "WLC qere/ketiv variants" ;
  setTemplateToNode(variantsXML, variantsXSL, "Variants", document.body )  ; 
 }
//=============================================================================
//=== 2 =======================================================================

// Load the Home page files
function loadFiles(){
  if(filesLoaded == 'false'){
    variantsXML = loadSarissaDoc(baseURL + filename) ;
    
    variantsXSL = loadSarissaDoc(baseURL + "XSL/Variants.xsl.xml") ;
    setAsXSL(variantsXSL) ;
    setXSLParam(variantsXSL, "baseURL", baseURL) ;

    filesLoaded = 'true' ;
  }
}

// Gives the book results when a book name is clicked on the main page.
function showBook( bookname ){
  setXSLParam(variantsXSL, "selectedbook", bookname ) ;
  setXSLParam(variantsXSL, "backbutton", "true" ) ;
  document.title = "Variants in " + bookname  ;
  setTemplateToNode(variantsXML, variantsXSL, "Book", document.body )  ; 
  setPD() ;
}

function previousPage(){
  setXSLParam(variantsXSL, "backbutton", "false" ) ;
  setTemplateToNode(variantsXML, variantsXSL, "Variants", document.body )  ; 
  document.title = "WLC variants" ;
}  
  
// Set the PD's from cookies or the XSL file after the Book page is displayed.
function setPD(){
  var fontsize = getXSLParam(variantsXSL, "fontsize") ;  
  fontsize = askForCookie("FontSize", fontsize) ;
  setSelectedValue("FontSizePD", fontsize) ; 
  setXSLParam(variantsXSL, "fontsize", fontsize ) ;
  
  var fontfamily = getXSLParam(variantsXSL, "fontfamily") ;  
  fontfamily = askForCookie("FontFamily", fontfamily) ;
  setXSLParam(variantsXSL, "fontfamily", fontfamily ) ;
}  
//=============================================================================
           
function changeFontSize(){
  var fontsize = getSelectedValue('FontSizePD') ;
  createCookie("FontSize", fontsize,  3650) ;
  setXSLParam(variantsXSL, "fontsize", fontsize) ;
  setXSLParam(variantsXSL, "cellpadding", 4 + fontsize/4 ) ;
// Sets the reducedfontsize and Englishfontsize variables
  var reducedfontfraction = 0.75 ;
  var Englishfontfraction = 0.75 ;  
  setXSLParam(variantsXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
  setXSLParam(variantsXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
  setTemplateToNode(variantsXML, variantsXSL, "Book", document.body ) ;
}
//=============================================================================
//=============================================================================
   