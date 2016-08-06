//=============================================================================
//=============================================================================
//
//  Search.js Javascript functions for Search.xml
//
//              21 Jul 2011
//
// A major problem on IE is that askForCookie returns 05d2 05e8 for 
// SearchTextHex even after cookies have been cleared in IE 9.  Other 
// non-existent cookies return null, as expected.
//
// Contains five major sections:
//
//     1. Search dispatching.
//     1. Search global variables.
//     2. Core functions.
//     3. Text pulldown functions.
//     4. Utilities
//
//  Search.xml loads Utilities.js and has access to its functions too!
//
// Copyright C.V.Kimball 2006
//
//=============================================================================
//=============================================================================
//
//  0. Search dispatching
//
//=============================================================================
 
var filename ;  // Name of file in the Supplements directory.
var baseURL ;   // Full path to the Supplements directory.

var filesLoaded = 'false' ;
var TanachIndexXML ; // TanachIndex.xml from the /Tanach/Books directory.
var searchXSL ; // Differences.xsl.xml file from the Supplements/XSL directory.

var all ;
var searchconsonants ;
var searchvowels ;
var vowels ;
var searchaccents ;
var trueaccents ;
var InInitialization ;
var fontfamily ;
var OverallResult ;
var OverallCount ;
var multibook = false ;
var counts ;

                
function init(){
  filename = getFilename() ;
  baseURL = getBaseURL(filename) ;
  loadFiles() ;      
  setConstants() ;
  document.title = "WLC search" ;
  setTemplateToNode(TanachIndexXML, searchXSL, "Search", document.body )  ; 
  setSearchPDs() ;
  setTextfield() ;
}

// Load the Home page files
function loadFiles(){
  if(filesLoaded == 'false'){
    TanachIndexXML = loadSarissaDoc(baseURL + "../Books/TanachIndex.xml" ) ;
    searchXSL = loadSarissaDoc(baseURL + "XSL/Search.xsl.xml") ;
    setAsXSL(searchXSL) ;
    setXSLParam(searchXSL, "baseURL", baseURL) ;
    filesLoaded = 'true' ;
  }
}

function setConstants(){
  setXSLFromCookie(searchXSL, "SearchBook", "searchbook") ;      
  setXSLFromCookie(searchXSL, "SearchContent", "searchcontent") ;
  setXSLFromCookie(searchXSL, "SearchType", "searchtype") ;
  setXSLFromCookie(searchXSL, "SearchVariants", "searchvariants") ;
  setXSLFromCookie(searchXSL, "SearchOutput", "searchoutput") ;
  setXSLFromCookie(searchXSL, "FontSize", "fontsize") ;
  setXSLFromCookie(searchXSL, "SearchReference", "searchreference") ;
  
// These must be formed from component XSL variables, not taken from all variable.
  searchconsonants =  getXSLParam(searchXSL, 'consonants') + getXSLParam(searchXSL, 'blank') ;
  vowels =  getXSLParam( searchXSL, 'vowels') + getXSLParam(searchXSL, 'maqafsofpasuq') ;
  searchvowels = searchconsonants + vowels ;
  trueaccents =  getXSLParam(searchXSL, 'trueaccents') ;    
  searchaccents = searchvowels + trueaccents ;
  var mdivider =  getXSLParam(searchXSL, 'mdivider') ; 
  all = searchaccents + mdivider ;
  fontfamily = getXSLParam(searchXSL, 'fontfamily') ; 
// This turns the initial value block on and off. 
  var type = askForCookie("SearchType", "") ;
  if(type=='char' || type== ''){
    var rawsearchtext = askForCookie( 'SearchTextChar', "") ;
    var searchtext = "" ;
    if(rawsearchtext!=""){
      searchtext = fromCharCodes(rawsearchtext) ;
    }         
    if (searchtext != ""  && searchtext != initialChar ){
      setXSLParam(searchXSL, 'initialstring', 'false');
    }
    else{
      setXSLParam(searchXSL, 'initialstring', 'true') ;
    }
  }
  if(type=='hex'){
    var searchnumbers = askForCookie( 'SearchTextHex', '') ;
    if(searchnumbers != "" && searchnumbers != initialHex ){
      setXSLParam(searchXSL, 'initialstring', 'false');
    }
    else{
      setXSLParam(searchXSL, 'initialstring', 'true') ;
    }
  }
}

// Sets an XSL variable from a cookie.
function setXSLFromCookie(XSLFile, CookieName, XSLVariableName){
  var Cookie  = askForCookie( CookieName, "") ;
  if(Cookie!=""){
    setXSLParam(XSLFile, XSLVariableName, Cookie)  ;
  }
  return Cookie ;
}

function setSearchPDs(){
  var book =  getXSLParam(searchXSL, "searchbook") ;
  setSelectedValue("SearchBookPD", book) ;
  var type =  getXSLParam(searchXSL, "searchtype") ;
  setSelectedValue("SearchTypePD", type) ;
  var content =  getXSLParam(searchXSL, "searchcontent") ;
  setSelectedValue("SearchContentPD", content) ;
  var variants =  getXSLParam(searchXSL, "searchvariants") ;
  setSelectedValue("SearchVariantsPD", variants) ;
  var output =  getXSLParam(searchXSL, "searchoutput") ;
  setSelectedValue("SearchOutputPD", output) ;
}

//=============================================================================
//
//  1. Search global variables
//
//
//=============================================================================

    var Torah = new Array() ;
    Torah[0] = 'Genesis' ;
    Torah[1] = 'Exodus' ;
    Torah[2] = 'Leviticus' ;
    Torah[3] = 'Numbers' ;
    Torah[4] = 'Deuteronomy' ;
    var Tanach = new Array() ;
    Tanach[ 0] = 'Genesis' ;
    Tanach[ 1] = 'Exodus' ;
    Tanach[ 2] = 'Leviticus' ;
    Tanach[ 3] = 'Numbers' ;
    Tanach[ 4] = 'Deuteronomy' ;
    Tanach[ 5] = 'Joshua' ;
    Tanach[ 6] = 'Judges' ;
    Tanach[ 7] = 'Samuel_1' ;
    Tanach[ 8] = 'Samuel_2' ;
    Tanach[ 9] = 'Kings_1' ;
    Tanach[10] = 'Kings_2' ;
    Tanach[11] = 'Isaiah' ;
    Tanach[12] = 'Jeremiah' ;
    Tanach[13] = 'Ezekiel' ;
    Tanach[14] = 'Hosea' ;
    Tanach[15] = 'Joel' ;
    Tanach[16] = 'Amos' ;
    Tanach[17] = 'Obadiah' ;
    Tanach[18] = 'Jonah' ;
    Tanach[19] = 'Micah' ;
    Tanach[20] = 'Nahum' ;
    Tanach[21] = 'Habakkuk' ;
    Tanach[22] = 'Zephaniah' ;
    Tanach[23] = 'Haggai' ;
    Tanach[24] = 'Zechariah' ;
    Tanach[25] = 'Malachi' ;
    Tanach[26] = 'Psalms' ;
    Tanach[27] = 'Proverbs' ;
    Tanach[28] = 'Job' ;
    Tanach[29] = 'Song_of_Songs' ;
    Tanach[30] = 'Ruth' ;
    Tanach[31] = 'Lamentations' ;
    Tanach[32] = 'Ecclesiastes' ;
    Tanach[33] = 'Esther' ;
    Tanach[34] = 'Daniel' ;
    Tanach[35] = 'Ezra' ;
    Tanach[36] = 'Nehemiah' ;
    Tanach[37] = 'Chronicles_1' ;
    Tanach[38] = 'Chronicles_2' ;
    
    var initialChar = "\u05d5\u05b0\u05d0\u05b8\u05a3\u05d4\u05b7\u05d1\u05b0\u05ea\u05bc\u05b8\u0594" ;
    var initialHex = "05d5 05b0 05d0 05b8 05a3 05d4 05b7 05d1 05b0 05ea 05bc 05b8 0594" ;
//=============================================================================
//=============================================================================
//
//  2. Core functions
//
//            doSearch() ; - Checks inputs, launches SearchResult Page.
//            initSearchResult() ; - After SearchResult page is launched,
//                                   called at page activation.
//            search() ;
//            searchBook(book) ; - Search over a particular book.
//            contentfilter(string, content) ;
//            boolean = hasContent(string, content) ;
//
//=============================================================================

// Tests the search text and opens SearchResult page if correct.      

function doSearch(){
  document.getElementById("SearchError").innerHTML = "" ;
  var type =  getXSLParam(searchXSL, "searchtype") ;
  var content =  getXSLParam(searchXSL, "searchcontent") ;
  var input = document.SearchForm.textfield.value ;
  if (input == initialChar || input == initialHex){
    setXSLParam(searchXSL, "initialstring", "true") ;
  }
  else{
    setXSLParam(searchXSL, "initialstring", "false") ;
  }
  var unicode = "" ;
// Test for no input.
  if( input.length == 0 | input== null){
    document.getElementById("SearchError").innerHTML = "Input search text is empty." ;         
    if(type=='char'){
      createCookie("SearchTextChar", "", 3650)
    }
    if(type=='hex'){
      createCookie("SearchTextHex", "", 3650)
    }
    return ;
  }
// char mode test of input for Unicode Hebrew characters
  if(type=='char'){
    Error = isHebrewString(input) ;
    if(Error.length != 0 ){
      document.getElementById("SearchError").innerHTML = Error ;         
      return ;
    }
    unicode = input ;
  }
// char mode test of input.
  if(type=='hex'){
// Remove leading zeros here.
    input = input.replace(new RegExp(/^\s+/), "") ;
    input = removeSuccessiveBlanks(input) ;
    Error = validNumbers(input) ;
    if(Error.length != 0 ){
      document.getElementById("SearchError").innerHTML = Error ;         
      return ;
    }
// Test for correspondence with Hebrew characters.
    Error = areHebrewNumbers(input) ;
    if(Error.length != 0 ){
      document.getElementById("SearchError").innerHTML = Error ;         
      return ;
    }
    unicode = hexToString(input) ;
  }
  unicode  = contentfilter(unicode, content) ;
        
  if(unicode.length==0){
    Error="Filtered search text has zero length.";
    document.getElementById("SearchError").innerHTML = Error ;         
    return ;
  }
  else{
    document.getElementById("SearchError").innerHTML = "" ;
  }
  if(!hasContent(unicode, content)){
    document.getElementById("SearchError").innerHTML = 
          "Caution: The search target doesn't contain " 
          + content +" content.  The result may be empty." ;        
  }
  unicode = singleSpaces(unicode) ;  // Remove multiple spaces.
//alert("Verified unicode characters: &gt;"+unicode+"&lt;") ;
// Save search text cookies ONLY if valid.
  if(type=='char'){
    createCookie("SearchTextChar", toCharCodes(document.SearchForm.textfield.value), 3650)
  }
  if(type=='hex'){
    createCookie("SearchTextHex", document.SearchForm.textfield.value, 3650)
  }
// Go to the SearchResult page.      
  var book = getSelectedValue("SearchBookPD") ;
  setXSLParam(searchXSL, 'searchbook', book );
  setXSLParam(searchXSL, 'test', unicode ) ;
  setXSLParam(searchXSL, 'searchcontent', getSelectedValue('SearchContentPD' ) );
  setXSLParam(searchXSL, 'searchvariants',  getSelectedValue("SearchVariantsPD") ) ;
  setXSLParam(searchXSL, 'backbutton', 'true' ) 
  document.title = "WLC search results" ;
  setTemplateToNode(TanachIndexXML, searchXSL, "SearchResult", document.body )  ;
  setSearchResultPDs() ;;
  initSearchResult() ; 
  search() ;
  return ;
}
//----------------------------------------------------------------------------
      
function initSearchResult(){
  InInitialization = true ;
  book =  getXSLParam(searchXSL, "searchbook") ;
  type =  getXSLParam(searchXSL, "searchtype") ;
  content =  getXSLParam(searchXSL, "searchcontent") ;
  variants =  getXSLParam(searchXSL, "searchvariants") ;
  output =  getXSLParam(searchXSL, "searchoutput") ;
  test = getXSLParam(searchXSL, "test");
  fontsize = getXSLParam(searchXSL, 'fontsize') ;

  setXSLParam(searchXSL, "format", "Verses") ;
  setSelectedValue('FontSizePD', getXSLParam(searchXSL, "fontsize" ) ) ;
  setXSLFromCookie(searchXSL, "SearchReference", "searchreference") ;
  setSelectedValue('ReferencePD', getXSLParam(searchXSL, "searchreference" ) ) ;
  InInitialization = false ;
  document.title = "Search results for >" + test + "< in " + book ;
}
//----------------------------------------------------------------------------

function search(){
  OverallResult = "" ;
  OverallCount = 0 ;
  BookCount = 0 ;
 
  if(book=='Tanach'){
    multibook = 'true' ;
    for( i=0; i != Tanach.length ; i++ ){
      searchBook(Tanach[i]) ;
    }
  }
  else if(book=='Torah'){
    multibook = 'true' ;
    for( i=0; i != Torah.length ; i++ ){
       searchBook(Torah[i]) ;
    }
  }
  else{
    multibook = 'false' ;
    searchBook(book) ;
  }
      
  if(multibook=='true' | OverallCount == 0){
    setXSLParam(searchXSL,  "overallcount", OverallCount) ;
    setXSLParam(searchXSL, "foundinbooks", BookCount) ;
    setXSLParam(searchXSL, "template", "OverallSearchTitle" ) ;
    var xsltpro = new XSLTProcessor() ;
    xsltpro.importStylesheet(searchXSL) ;
    var titledoc = xsltpro.transformToDocument(TanachIndexXML) ;
    var serializer = new XMLSerializer() ;
    overalltitle = serializer.serializeToString(titledoc);    
  }
  else{
    overalltitle= "" ;
  }
  document.getElementById('Results').innerHTML = overalltitle +  OverallResult ;
  setXSLParam(searchXSL, 'initialstring',"false") ;
  
}
//----------------------------------------------------------------------------

function searchBook( book ){
  var bookXML = loadSarissaDoc(baseURL + "../Books/" + book + ".xml" ) ;
  setXSLParam(searchXSL, 'currentbook', book) ;   
  setXSLParam(searchXSL, 'currentbookname', getBookName(bookXML) ) ;
  setXSLParam(searchXSL, 'currentbookabbrev',  getBookAbbrev(bookXML) ) ;
  setXSLParam(searchXSL, 'template',"SearchScan") ;
  var xsltpro = new XSLTProcessor() ;
  xsltpro.importStylesheet(searchXSL) ;
  var resultdoc = xsltpro.transformToDocument(bookXML) ;
  var serializer = new XMLSerializer() ;
  var resultstring = serializer.serializeToString(resultdoc);  
      
// This must exactly match the span statement found by the emphasizetest template
// in order for the counting to work.
  searchspan = "//span[./@style = 'color:blue;font-size:"+fontsize+"pt;font-family:"
           + fontfamily + "\']" ;
  var nodes = resultdoc.selectNodes(searchspan) ;
//
  if(nodes.length != 0){
    setXSLParam(searchXSL, 'bookcount', nodes.length ) ;
    setXSLParam(searchXSL, 'template',"SearchTitle") ;
    var xsltpro = new XSLTProcessor() ;
    xsltpro.importStylesheet(searchXSL) ;
    var resultdoc = xsltpro.transformToDocument(bookXML) ;
    var serializer = new XMLSerializer() ;
    titlestring = serializer.serializeToString(resultdoc);  
    
// Controls whether text is displayed.
    if(output=='counts'){
      OverallResult = OverallResult + titlestring ;
    }
    else{
      OverallResult = OverallResult + titlestring +  resultstring ;
    }
    OverallCount = OverallCount + nodes.length ;
    BookCount = BookCount + 1 ;
  }
}

function setSearchResultPDs(){
  var fontsize =  getXSLParam(searchXSL, "fontsize") ;
  setSelectedValue("FontSizePD", fontsize) ;
  var reference =  getXSLParam(searchXSL, "searchreference") ;
  setSelectedValue("ReferencePD", reference) ;
  }
  

function getBookName(bookXML) {
    var bookstring = "/Tanach/tanach/book/names/name" ;
    var name = bookXML.selectSingleNode(bookstring)  ;
    if (name == null){
      alert("getBookName: Node " + bookstring + " not found.") ;
      return ""  ;
      }
    else{
      var t = name.firstChild;
      return t.nodeValue ;
      }
    }
    
function getBookAbbrev(bookXML) {
    var bookstring = "/Tanach/tanach/book/names/abbrev" ;
    var name = bookXML.selectSingleNode(bookstring)  ;
    if (name == null){
      alert("getBookAbbrev: Node " + bookstring + " not found.") ;
      return ""  ;
      }
    else{
      var t = name.firstChild;
      return t.nodeValue ;
      }
    }
//-----------------------------------------------------------------------------

// Filters a string to the proper content.        

    function contentfilter(string, content){
      s = "" ;
      if(content == 'consonants'){
        for (i=0; i != string.length ; i++){
          c = string.charAt(i) ;
          for (j=0; j != searchconsonants.length ; j++){
            if(c == searchconsonants.charAt(j)){
              s = s + c ;
              }
            }
          if (c=='&#x05be;'){  // Maqafs are filtered to blanks.
              s = s + ' ';
              }
          }
        }
      else if(content == 'vowels'){
        for (i=0; i != string.length ; i++){
          c = string.charAt(i) ;
          for (j=0; j != searchvowels.length ; j++){
            if(c == searchvowels.charAt(j)){
              s = s + c ;
              }
            }
          }
        }
      else if(content == 'accents'){
        for (i=0; i != string.length ; i++){
          c = string.charAt(i) ;
          for (j=0; j != searchaccents.length ; j++){
            if(c == searchaccents.charAt(j)){
              s = s + c ;
              }
            }
          }
        }
      else if(content == 'morphology'){
        for (i=0; i != string.length ; i++){
          c = string.charAt(i) ;
          for (j=0; j != all.length ; j++){
            if(c == all.charAt(j)){
              s = s + c ;
              }
            }
          }
        }
      else{
          alert("contentfilter: Incorrect content type: " + content + " !") ;
        }
      return s ;
      }
//-----------------------------------------------------------------------------

// Indicates if the string has the required content.        

function hasContent(string, content){
  var result = false ;
  if(content == 'consonants'){
    for (i=0; i != string.length ; i++){
      c = string.charAt(i) ;
      for (j=0; j != searchconsonants.length ; j++){
        if(c == searchconsonants.charAt(j)){
          result=true;
        }
      }
    }
  }
  else if(content == 'vowels'){
    for (i=0; i != string.length ; i++){
      c = string.charAt(i) ;
      for (j=0; j != vowels.length ; j++){
        if(c == vowels.charAt(j)){
          result=true ;
        }
      }
    }
  }
  else if(content == 'accents'){
    for (i=0; i != string.length ; i++){
      c = string.charAt(i) ;
      for (j=0; j != trueaccents.length ; j++){
        if(c == trueaccents.charAt(j)){
          result=true ;
        }
      }
    }
  }
  
  
  else if(content == 'morphology'){
    for (i=0; i != string.length ; i++){
      c = string.charAt(i) ;
      for (j=0; j != all.length ; j++){
        if(c == all.charAt(j)){
          result=true ;
        }
      }
    }
  }
  
  
  else{
    alert("hasContent: Incorrect content type: " + content + " !") ;
  }
  return result;
}
//=============================================================================
//=============================================================================
//
//  3. Pulldown handlers.
//
//      changeBook() ;
//      changeContent() ;
//      changeOutput() ;
//      changeType() ;
//      changeVariants() ;
//      changeFontSize()
///     changeReference()
//      setSearchPDs() ;
//      setTextfield() ;
//
//=============================================================================

    function changeBook(){
      var book = getSelectedValue('SearchBookPD') ;
      createCookie("SearchBook", book,  3650) ;
      setXSLParam(searchXSL, "searchbook", book) ;
      }

    function changeContent(){
      var content = getSelectedValue('SearchContentPD' ) 
      createCookie("SearchContent", content,  3650) ;
      setXSLParam(searchXSL, "searchcontent", content) ;
      }

    function changeOutput(){
      var output = getSelectedValue('SearchOutputPD' ) 
      createCookie("SearchOutput", output,  3650) ;
      setXSLParam(searchXSL, "searchoutput", output) ;
      }

    function changeType(){
      var type = getSelectedValue('SearchTypePD' ) 
      createCookie("SearchType", type,  3650) ;
      setXSLParam(searchXSL, "searchtype", type) ;
      setTextfield() ;
      }

    function changeVariants(){
      var variants = getSelectedValue('SearchVariantsPD' ) 
      createCookie("SearchVariants", variants,  3650) ;
      setXSLParam(searchXSL, "searchvariants", variants) ;
      }  
      
    function setTextfield(){
      var type =  getXSLParam(searchXSL, "searchtype") ;
      document.getElementById("SearchError").innerHTML = "" ;         
      var str ;
      if(type=='char'){
        str = "<input dir=\"rtl\" type=\"TEXT\" " + 
          "style=\"font-weight:bold;font-family:SBL Hebrew;font-size:20pt\" " + 
          "size=\"25\" maxlength=\"256\" name=\"textfield\" " +
          "title=\"Enter or paste Unicode Hebrew text here.\">&#x00a0;" +
          "</input>" ;
        document.SearchForm.innerHTML= str;
        var rawsearchtext = askForCookie( 'SearchTextChar', "") ;
        var searchtext = "" ;
        if(rawsearchtext!=""){
          searchtext = fromCharCodes(rawsearchtext) ;
          }
          
// Set the text ONLY if there's text to set.  (Possible Linux problem.)
        if (searchtext != ""){
          document.SearchForm.textfield.value = searchtext ;
          }
        else{
          document.SearchForm.textfield.value = initialChar ;
          }
        }
      if(type=='hex'){
        str = "<input dir=\"ltr\" type=\"TEXT\" " + 
          "style=\"font-weight:bold;font-size:12pt\" " + 
          "size=\"60\" maxlength=\"256\" name=\"textfield\" " +
          "title=\"Enter hex values here.\">&#x00a0;" +
          "</input>" ;
        document.SearchForm.innerHTML= str;
        var searchnumbers = askForCookie( 'SearchTextHex', '') ;
        if(searchnumbers != ""){
          document.SearchForm.textfield.value = searchnumbers ;
          }
        else{
          document.SearchForm.textfield.value = initialHex ;
          }
        }
      }
      
function changeFontSize(){
  var fontsize = getSelectedValue('FontSizePD') ;
  createCookie("FontSize", fontsize,  3650) ;
  setXSLParam(searchXSL, "fontsize", fontsize) ;
  setXSLParam(searchXSL, "cellpadding", 4 + fontsize/4 ) ;
// Sets the reducedfontsize and Englishfontsize variables
  var reducedfontfraction = 0.75 ;
  var Englishfontfraction = 0.75 ;  
  setXSLParam(searchXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
  setXSLParam(searchXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
  if(!InInitialization){
    initSearchResult() ;    
    search() ;
  }
}

function changeReference(){
  var reference = getSelectedValue('ReferencePD') ;
  createCookie("SearchReference", reference,  3650) ;
  setXSLParam(searchXSL, "searchreference", reference) ;
  if(!InInitialization){
    initSearchResult() ;    
    search() ;
  }
}

function previousPage(){
  setXSLParam(searchXSL, "backbutton", "false") ;
  setTemplateToNode(TanachIndexXML, searchXSL, "Search", document.body )  ; 
  setSearchPDs() ;
  setTextfield() ;
}

function showInstructions(){
  setXSLParam(searchXSL, "backbutton", "true") ;
  setTemplateToNode(TanachIndexXML, searchXSL, "Instructions", document.body) ;
}
//=============================================================================
//=============================================================================
//
// 4. Utilities
//
//      boolean = isHebrewString(String) ;  
//      boolean = isHebrewChar(c) ;  
//      boolean = validNumber(String) ;  
//      input = removeSuccessiveBlanks(input) ;
//      boolean =  areHebrewNumbers(String) ;
//      String = hexToString(string) ;
//      String = toCharCodes(String) - Converts a Unicode string to 
//                                     space-separated DECIMAL char codes
//      String = singleSpaces(string) - Reduces multiple spaces to single spaces.
//      String = fromCharCodes(string) - Converts a string of space-separated 
//                                       DECIMAL char codes to Unicode.
//
//=============================================================================   

// Tests that the string contains only Hebrew characters giving Error string.
    function isHebrewString(string){
      errors = "" ;
      for (i=0; i != string.length ; i++){
        c = string.charAt(i) ;
        h = string.charCodeAt(i); 
        if(!isHebrewChar(c)){
          errors = errors + c + "  [x" + (string.charCodeAt(i)).toString(16)  +"], " ;
          }
        }
      if( errors.length > 0){
        return "Non-Hebrew characters, " + errors + " may not appear in the search text." ;
        }
      return ""
      }
      
// boolean indicating if Unicode character is a Hebrew character      
    function isHebrewChar(c){        
      found = false ;
      for (j=0; j != all.length ; j++){
        u = all.charAt(j) ;
        if (u==c){
          return true;
          }
        }
      return false ;
      }

// Tests that the numbers in the string can be converted to hex with Error message return.     
    function validNumbers(string){
      var splits = string.split(" ") ;
      s = "" ;
      for (i=0; i != splits.length ; i++){
        k = parseInt(splits[i], 16) ;
        if( isNaN(k)){
          s = s + splits[i] + " " ;
          }
        }
      if( s.length > 0){
         s = s + " not convertible to hexadecimal." ;
         }
      return s ;
      }

//  Removes successive blanks
function removeSuccessiveBlanks(input){
  var cleanedInput = "" ;
  var previousChar = '*' ;
  for (i=0; i != input.length; i++){
    if(input.charAt(i) == " " ){
      if(previousChar != " "){
        cleanedInput = cleanedInput + input.charAt(i) ;
      }
    }
    else{
      cleanedInput = cleanedInput + input.charAt(i) ;
    }
    previousChar = input.charAt(i)
  }
  return cleanedInput ;  
}

// Verifies that the hex numbers correspond to Hebrew characters.      
    function areHebrewNumbers(string){
      var splits = string.split(" ") ;
      s = "" ;
      for (i=0; i != splits.length ; i++){
        k = parseInt(splits[i], 16) ;
        c = String.fromCharCode(k) ;
        if( !isHebrewChar(c)){
          s = s + splits[i] + " " ;
          }
        }
      if( s.length > 0){
         s = s + " not hexadecimal for a Hebrew character." ;
         }
      return s ;
      }

// Converts a string of hex numbers, previously tested, to a Unicode string.
    function hexToString(string){
      var splits = string.split(" ") ;
      s = "" ;
      for (i=0; i != splits.length ; i++){
        k = parseInt(splits[i], 16) ;
        c = String.fromCharCode(k) ;
        s = s + c ;
        }
      return s ;
      }

// Converts a Unicode string to space-separated DECIMAL char codes.        
    function toCharCodes(string){
       s="" ;
       for (i=0; i != string.length ; i++){
         s = s + string.charCodeAt(i) + " " ;
         }
       return s ;
       }

// Makes all multiple spaces into single spaces.
    function singleSpaces(string){
      s = "" ;
      previousSpace = false ;
      for (i=0; i != string.length ; i++){
        c = string.charAt(i) ;
        if(c==' '){
          if(!previousSpace){
            s = s + c ;
            previousSpace = true ;
            }
          }
        else{
          previousSpace = false ;
          s = s + c ;
          }  
        }
      return s ;
      }

// Converts a string of space-separated DECIMAL char codes to Unicode.        
    function fromCharCodes(string){
      var splits = string.split(" ") ;
      s = "" ;
      for (i=0; i != splits.length ; i++){
        k = parseInt(splits[i]) ;
        c = String.fromCharCode(k) ;
        s = s + c ;
        }
      return s ;
      }
//=============================================================================
//=============================================================================
