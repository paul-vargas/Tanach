//=============================================================================
//=============================================================================
//
//  Statistics.js Javascript functions for statistics.xml
//
//              26 Oct 2014
//
// Contains five major sections:
//
//     1. Statistics dispatching.
//
//  Statistics.xml loads Tanach/Javascript/Utilities.js and has access to its functions too!
//
// Copyright C.V.Kimball 2006
//
//=============================================================================
//=============================================================================
// Initial dispatcher.
 
var filename ;  // Name of file in the Supplements directory.
var baseURL ;   // Full path to the Supplements directory.

var filesLoaded = 'false' ;
var statisticsXML ; // statistics.xml file from the Supplements directory.
var statisticsXSL ; // statistics.xsl.xml file from the Supplements/XSL directory.
                
function init(){
  filename = getFilename() ;
  baseURL = getBaseURL(filename) ;
  loadFiles() ;      
  setXSLParam(statisticsXSL, "baseURL", baseURL ) ;
  document.title = "WLC statistics" ;
  setTemplateToNode(statisticsXML, statisticsXSL, "Statistics", document.body )  ; 
 }
//=============================================================================
//=== 2 =======================================================================

// Load the Home page files
function loadFiles(){
  if(filesLoaded == 'false'){
    statisticsXML = loadSarissaDoc(baseURL + filename) ;
    
    statisticsXSL = loadSarissaDoc(baseURL + "XSL/Statistics.xsl.xml") ;
    setAsXSL(statisticsXSL) ;
    setXSLParam(statisticsXSL, "baseURL", baseURL) ;

    filesLoaded = 'true' ;
  }
}

function showChapters(){
  setXSLParam(statisticsXSL, "backbutton", "true" ) ;
  document.title = "Chapter, verse, and XML tag counts" ;
  setTemplateToNode(statisticsXML, statisticsXSL, "Chapters", document.body )  ; 
}

function showCharacterTypes(){
  setXSLParam(statisticsXSL, "backbutton", "true" ) ;
  document.title = "Character type counts" ;
  setTemplateToNode(statisticsXML, statisticsXSL, "CharacterTypes", document.body )  ; 
}

function showCharacters(){
  setXSLParam(statisticsXSL, "backbutton", "true" ) ;
  document.title = "Character counts" ;
  setTemplateToNode(statisticsXML, statisticsXSL, "Characters", document.body )  ; 
}

function showAssertions(){
  setXSLParam(statisticsXSL, "backbutton", "true" ) ;
  document.title = "Assertions about XML tags" ;
  setTemplateToNode(statisticsXML, statisticsXSL, "Assertions", document.body )  ; 
}
function previousPage(){
  setXSLParam(statisticsXSL, "backbutton", "false" ) ;
  setTemplateToNode(statisticsXML, statisticsXSL, "Statistics", document.body )  ; 
  document.title = "WLC statistics" ;
}  
  

//=============================================================================
//=============================================================================
   