//=============================================================================
//=============================================================================
//
//  notes.js Javascript functions for notes.xml
//
//              26 Oct 2014
//
// Contains five major sections:
//
//     1. notes dispatching.
//
//  notes.xml loads Tanach/Javascript/Utilities.js and has access to its functions too!
//
// Copyright C.V.Kimball 2006
//
//=============================================================================
//=============================================================================
// Initial dispatcher.
 
var filename ;  // Name of file in the Supplements directory.
var baseURL ;   // Full path to the Supplements directory.

var filesLoaded = 'false' ;
var notesXML ; // notes.xml file from the Supplements directory.
var notesXSL ; // notes.xsl.xml file from the Supplements/XSL directory.
                
function init(){
  filename = getFilename() ;
  baseURL = getBaseURL(filename) ;
  loadFiles() ;      
  document.title = "WLC transcription notes" ;
  setTemplateToNode(notesXML, notesXSL, "Notes", document.body )  ; 
 }
//=============================================================================
//=== 2 =======================================================================

// Load the Home page files
function loadFiles(){
  if(filesLoaded == 'false'){
    notesXML = loadSarissaDoc(baseURL + filename) ;
    
    notesXSL = loadSarissaDoc(baseURL + "XSL/Notes.xsl.xml") ;
    setAsXSL(notesXSL) ;
    setXSLParam(notesXSL, "baseURL", baseURL) ;

    filesLoaded = 'true' ;
  }
}

function selectNote( note ){
  setXSLParam(notesXSL, "selectednote", note ) ;
  setXSLParam(notesXSL, "backbutton", "true" ) ;
  document.title = "Type " + note + " transcription note" ;
  var fontsize = getFontsize() ;
  setTemplateToNode(notesXML, notesXSL, "Book", document.body )  ; 
  setSelectedValue("FontSizePD", fontsize) ; 
}

function previousPage(){
  setTemplateToNode(notesXML, notesXSL, "Notes", document.body )  ; 
  document.title = "WLC transcription notes" ;
}  
  
// Get PD value, fontsize, from XSL file or cookie.
// Also sets fontfamily.
function getFontsize(){
  var fontsize = getXSLParam(notesXSL, "fontsize") ;  
  fontsize = askForCookie("FontSize", fontsize) ;
  setXSLParam(notesXSL, "fontsize", fontsize ) ;
    
  var fontfamily = getXSLParam(notesXSL, "fontfamily") ;  
  fontfamily = askForCookie("FontFamily", fontfamily) ;
  setXSLParam(notesXSL, "fontfamily", fontfamily ) ;
  return fontsize ;
}  
//=============================================================================

// The following are called by the Excerpt page.
           
function changeFontSize(){
  var fontsize = getSelectedValue('FontSizePD') ;
  createCookie("FontSize", fontsize,  3650) ;
  setXSLParam(notesXSL, "fontsize", fontsize) ;
  setXSLParam(notesXSL, "cellpadding", 4 + fontsize/4 ) ;
// Sets the reducedfontsize and Englishfontsize variables
  var reducedfontfraction = 0.75 ;
  var Englishfontfraction = 0.75 ;  
  setXSLParam(notesXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
  setXSLParam(notesXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
  setTemplateToNode(notesXML, notesXSL, "Book", document.body ) ;
  setSelectedValue("FontSizePD", fontsize) ; 
}

//=============================================================================
//=============================================================================
   