//=============================================================================
//=============================================================================
//
//       TanachBook.js - Functions associated primarily with Book page.
//
//              11 Jul 2013
//
//                    
//    Two informative pages, BookTEIHeader, Unicode Representations,
//    and FontTest, appear in separate browser windows.
//    
//    One input-dependent page, ChangeFont, appears in the body element
//    and returns by an enter button, enterFont().           
//   
// Contains 6 major sections:
//
//     1. Core Book page activation.
//     2. Parsing functions.
//     3. Text pulldown functions.
//     4. Display of Unicode representation on SHIFT-then-click.
//     5. No-input accessory pages: showBookTEIHeader() and showFontTest().
//     6. Book page external links feature.
//
//=============================================================================
//=== 1 =======================================================================

// Book page activation

// Enter with a the Parse object P set and tested with HomePageFiles loaded.

function setBookPage(){

// load the bookXML file from either the server or locally.

  P.getBookXML() ;
  
// Citation is valid, bookXML is full, continue.  
  if(P.bookIndex <6 ){ //Set Book page to show DH pulldown.
    setXSLParam(tanachXSL, "clickbookindex", P.bookIndex) ;
  }
  
  FontFamily = askForCookie("FontFamily", "SBL Hebrew") ;
  setXSLParam(tanachXSL, "fontfamily", FontFamily) ;
  setTemplateToNode(bookXML, tanachXSL, "Book", document.body) ;
  
  
  loadBookPageFiles() ;

  setLinksPD() ;
  
  P.setToXSL(textXSL) ;
  setXSLParam(textXSL, "fontfamily", FontFamily) ;
  setPDs() ; // Takes Cookie values into account.
  setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text") ) ;
  
  document.excerptinput.textfield.value = "" ;
}
//----------------------------------------------------------------------------- 

// Book page key supporting functions.

// Load Book page files
function loadBookPageFiles(){
  if(bookPageFilesLoaded == 'false'){
    textXSL = loadSarissaDoc(baseURL + "XSL/Text.xsl.xml") ;
    setAsXSL(textXSL) ;
    P.setToXSL(textXSL) ;
    linksXML = loadSarissaDoc(baseURL + "XSL/Links.xml") ;
    linksXSL = loadSarissaDoc(baseURL + "XSL/Links.xsl.xml") ;
    setAsXSL(linksXSL) ;
    bookPageFilesLoaded = 'true' ;
  }
}

//  Returns Parse object after parsing Citation as input String.

function checkCitation(input){
  P = new Parse() ;  // Create the parser object P.
  var CitationError = "Junk" ;
  CitationError = P.parse(input) ;
  
// Don't set cookie if citation is incorrect.
  if(CitationError!=""){
    return P;
    }
  createCookie("Citation", input, 3650) ;
  return P ;
  }
  
// Sets a query URL into the location for bookmarking.
function setBookMark(){
// Crude deblanker added 11 Feb 2016
  var bookAbbrev ="" ;
  for( k=0; k< P.bookabbrev.length; k++) {
    if(P.bookabbrev.charAt(k) != ' '){
      bookAbbrev = bookAbbrev + P.bookabbrev.charAt(k) ;
    }
  }

  var location = "Tanach.xml?" 
    + bookAbbrev + P.chapter + ":" + P.verse 
    + "-" + P.lastchapter + ":" + P.lastverse ;
  window.location = location ;  // Launches site reload with query parameter set.
}
//=============================================================================
//=== 2 ==========================================================================
//
//  2. Parsing functions
//
// Contains:
//
//       P = new Parse() ; ;
//       Error = P.parse(input) ;    // Parses input String.
//       P.show() ;                  // Shows Parse results as an alert.
//       P.getBookXML() ;            // Gets bookXML from Server.xml or local file.
//       P.setToXSL(PagesFileName) ; // Puts Citation into textXSL
//      
//=============================================================================
function Parse(input){
    this.input = "" ;
    this.bookIndex = 0 ;
    this.book = "" ; // Book name for found book ;
    this.bookabbrev = "" ; // Abbreviated book name for found book ;
    this.filename = "" ; // Filename for found book.
    this.chapter = "" ;
    this.verse = "" ;
    this.lastchapter = "" ;
    this.lastverse = "" ;
    this.error = "" ;
    
    this.ChapterVerses = "" ;
    this.FinalChapter = 0 ;
    this.SingleChapter = 'false' ;  // Exactly one chapter.
    
    this.parse = Parse_parse;
    this.show = Parse_show ; // alert display of results.
    this.getBookXML = Parse_getBookXML ; // Sets Parse results into bookXML.
    this.setToXSL = Parse_setToXSL ;     // Sets Parse results into textXSL.
    }

function Parse_parse(input){
  this.input = input ;
  var Found = false ;
  this.error = "" ;
  if(isBlank(this.input)){
    this.error =
      "Please enter a citation, i.e. Deut 26:5 - 26:9, in the above field. "
      + "Click the \"Syntax\" link for information on how to specify a citation." ;
    return this.error;
    }
// Matches x x x  (for Song of Songs), n x , or x
  var BookReg=/^\s*([a-zA-Z]*\s+[a-zA-Z]*\s+[a-zA-Z]*|(\d)\s*[a-zA-Z]*|[a-zA-Z]*)/g ;
  var books = this.input.match(BookReg) ;
  if (books == null ){
      this.error = "Missing or improper book specification." ;
      return this.error ;
      }
//    Strip leading and trailing blanks, remove internal blanks. 
  var booklength = books[0].length ;
  var Remnant = this.input.substring(booklength, 100) ;
  var book = books[0].replace(/^\s*/, '').replace(/\s+$/, '').replace(/\s+/g, '') ;
  var bookLC = book.toLowerCase() ;  // Comparison is on lower case.

// Comparison of abbreviations
  var abbrevs = tanachIndexXML.selectNodes("/Tanach/tanach/book/names/abbrev") ;
  var Found = 'false' ;
  var loopIndex = 0 ;
  for( loopIndex = 0 ; loopIndex < abbrevs.length; loopIndex++){  
    var c = abbrevs[loopIndex] ;
    if( c.firstChild.nodeValue.toLowerCase().replace(/\s+/g,'') == bookLC ){
      Found = 'true' ;
      break ;
    }
  }
  
// Comparison of names.
  var names = tanachIndexXML.selectNodes("/Tanach/tanach/book/names/name") ;
  if (Found == 'false'){
    for( loopIndex = 0 ; loopIndex < names.length; loopIndex++){  
      var c = names[loopIndex] ;
      if( c.firstChild.nodeValue.toLowerCase().replace(/\s+/g,'') == bookLC ){
        Found = 'true' ;
        break ;
      }
    }
  }
   
// Check for error (not Found)
  if (Found=='false'){
    this.error = "Book \'" + books[0].replace(/^\s*/, '').replace(/\s+$/, '') 
        + "\' is not in the Tanach as a book name or abbreviation."
        + " Please click the Syntax link to see valid book names."  ;
    this.bookIndex = 0 ;
    return this.error ;
    }  
// Found = 'true', set the bookIndex from the loopIndex
  this.bookIndex = loopIndex + 1;  
  this.book =  names[loopIndex].firstChild.nodeValue ;
            
  var filenames = tanachIndexXML.selectNodes("/Tanach/tanach/book/names/filename") ;
  if(loopIndex <= 4){
    this.filename = filenames[loopIndex].firstChild.nodeValue + ".DH.xml" ;
    }
  else{
    this.filename = filenames[loopIndex].firstChild.nodeValue  + ".xml";
    }

  this.bookabbrev = getBookAbbrevFromIndex(this.bookIndex) ;
  this.error = "" ;
  
  this.ChapterVerses = setChapterVerses(this.bookIndex) ;
  var maxchapters =  getBookChaptersFromIndex(this.bookIndex)
  this.FinalChapter = maxchapters ;
  this.FinalVerse = this.ChapterVerses[maxchapters] ;
  
// if the Remnant is empty, return an error.
  if(isBlank(Remnant)){
    this.error = "The input field lacks a chapter:verse specification, "
        + " i.e. 1:1 - 1:2, after the book name or an asterisk, *, to see the whole book. "
        + "Click the \"Syntax\" link for information on how to specify a citation." ;
    return this.error ;
    }
    
  var Asterisk=/^\s*\*\s*$/g ;
  var FullReg=/^\s*\d{1,3}:\d{1,3}\s*-\s*\d{1,3}:\d{1,3}\s*$/g ;
  var OneChapterReg=/^\s*\d{1,3}\s*$/g ;
  var ChapterRangeReg=/^\s*\d{1,3}\s*-\s*\d{1,3}\s*$/g ;
  var OneChapterVerseReg=/^\s*\d{1,3}:\d{1,3}\s*$/g ;
  var ChapterVerseRangeReg=/^\s*\d{1,3}:\d{1,3}\s*-\s*\d{1,3}:\d{1,3}\s*$/g ;
  var PartialChapterVerseRangeReg=/^\s*\d{1,3}:\d{1,3}\s*-\s*\d{1,3}\s*$/g ;
  var NumberReg=/\d{1,3}/g ;
// ***** Single asterisk ******************************************************* 
  if(Remnant.search(Asterisk)==0){
    this.chapter = 1 ;
    this.verse = 1 ;
    this.lastchapter = this.FinalChapter ;
    this.lastverse = this.FinalVerse ;
    return this.error;
    }
// ***** Full ******************************************************* 
  else if( Remnant.search(FullReg) == 0 ){
    var numbers = Remnant.match(NumberReg) ;
// Check the chapter number. 
    var chapterno = parseInt(numbers[0]) ;
    if(chapterno > maxchapters){
      this.error = "First chapter, " + chapterno + ", not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error ;
      }   
// Check the verse number. 
    var maxverses = this.ChapterVerses[chapterno] ;
    var verseno = parseInt(numbers[1]) ;
    if(verseno > maxverses){
      this.error = "First verse, " + verseno + ", not found in " + this.book 
          + " chapter " + chapterno + " which has only " 
          + maxverses +" verses." ;
      return this.error;
      }   
// Check the last chapter number. 
    var lastchapterno = parseInt(numbers[2]) ;
    if(lastchapterno > maxchapters){
      this.error = "Last chapter, " + lastchapterno + ", not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error ;
      }
    if(chapterno > lastchapterno){
      this.error = "Chapters out of order." ;
      return this.error;
      }
    var lastverseno = parseInt(numbers[3]) ;
    maxverses = this.ChapterVerses[lastchapterno] ;
    if(lastverseno > maxverses){
      this.error = "Last verse, " + lastverseno + ", not found in " 
          + this.book  + " chapter " + lastchapterno + " which has only " 
          + maxverses +" verses." ;
      return this.error;
      }  
// All checks out, load the XSL file variables and show the extract. 
    this.chapter = chapterno ;
    this.verse = verseno ;
    this.lastchapter = lastchapterno ;
    this.lastverse = lastverseno ;
    if(this.chapter == this.lastchapter){
      if(this.verse == 1 & this.lastverse == maxverses){
        this.SingleChapter = 'true' ;
        }
      }
    }
// ***** OneChapter ******************************************************* 
  else if(Remnant.search(OneChapterReg) == 0 ){
    var numbers = Remnant.match(NumberReg) ;
// Check the chapter number. 
    var chapterno = parseInt(numbers[0]) ;
    if(chapterno > maxchapters){
      this.error = "Chapter " + chapterno + " not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error;
      }                  
// All checks out, load the XSL file variables and show the extract. 
    document.getElementById("excerpterror").innerHTML = " " ;
    this.chapter =  chapterno ;
    this.verse = 1 ;
    this.lastchapter = chapterno ;
    this.lastverse = this.ChapterVerses[chapterno] ;
    this.SingleChapter = 'true' ;
    }
// ***** ChapterRange ******************************************************* 
  else if(Remnant.search(ChapterRangeReg) == 0 ){
    var numbers = Remnant.match(NumberReg) ;
// Check the chapter number. 
    var chapterno = parseInt(numbers[0]) ;
    if(chapterno > maxchapters){
      this.error = "First chapter, " + chapterno + ", not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error;
      }   
// Check the last chapter number. 
    var lastchapterno = parseInt(numbers[1]) ;
    if(lastchapterno > maxchapters){
      this.error = "Last chapter, " + lastchapterno + ", not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error;
      }
    if(chapterno > lastchapterno){
      this.error = "Chapters out of order." ;
      return this.error;
      }
// All checks out, load the XSL file variables and show the extract. 
    this.chapter = chapterno ;
    this.verse = "1" ;
    this.lastchapter = lastchapterno ;
    this.lastverse = this.ChapterVerses[lastchapterno] ;
    if (this.chapter == this.lastchapter){
      this.SingleChapter='true' ;
      }
    }
// ***** OneChapterVerse *************************************************
  else if(Remnant.search(OneChapterVerseReg) == 0 ){
   var numbers = Remnant.match(NumberReg) ;
// Check the chapter number. 
    var chapterno = parseInt(numbers[0]) ;
    if(chapterno > maxchapters){
      this.error = "Chapter " + chapterno + " not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error ;
      }   
// Check the verse number. 
    var maxverses = this.ChapterVerses[chapterno] ;
    var verseno = parseInt(numbers[1]) ;
    if(verseno > maxverses){
      this.error = "Verse " + verseno + " not found in " 
          + this.book  + " chapter " + chapterno + " which has only " 
          + maxverses +" verses." ;
      return this.error;
      }   
// All checks out, load the XSL file variables and show the extract. 
    this.chapter = chapterno ;
    this.verse = verseno ;
    this.lastchapter = chapterno ;
    this.lastverse =  verseno ;
    }
// ***** PartialChapterVerseRange *****************************************      
  else if(Remnant.search(PartialChapterVerseRangeReg) == 0 ){
    var numbers = Remnant.match(NumberReg) ;                                 
// Check the chapter number. 
    var chapterno = parseInt(numbers[0]) ;
    if(chapterno > maxchapters){
      this.error = "Chapter, " + chapterno + ", not found in " 
          + this.book + " which has only "
          + maxchapters + " chapters." ;
      return this.error;
      }   
// Check the verse number. 
    var maxverses = this.ChapterVerses[chapterno] ;
    var verseno = parseInt(numbers[1]) ;
    if(verseno > maxverses){
      this.error = "First verse, " + verseno + ", not found in " 
          + this.book + " chapter " + chapterno + " which has only " 
          + maxverses +" verses." ;
      return this.error;
      }   
// Check the last verse number. 
    var lastverseno = parseInt(numbers[2]) ;
    if(verseno > lastverseno){
      this.error = "Verses out of order in same chapter." ;
      return this.error;
      } 
    if(lastverseno > maxverses){
      this.error = "Last verse, "+lastverseno+", not found in "
                  + this.book + " chapter " + chapterno + " of " 
                  + maxverses +" verses." ;
      return this.error ;
      }   
// All checks out, load the XSL file variables and show the extract. 
    this.chapter = chapterno ;
    this.verse = verseno ;
    this.lastchapter = chapterno ;
    this.lastverse = lastverseno ;
    if(this.verse == 1 & this.lastverse==maxverses){
      this.SingleChapter = 'true';
      }
    }
// ***** Bad syntax!  *****************************************      
  else{
    this.error = "The syntax was incorrect. \n"
        + "See the \"Syntax\" link to see \n"
        + "how to specify a citation." ;
    }
  return this.error ;
  }  

function Parse_show(){
    alert("Found the following citation: \n\n" + this.book 
      + " (" + this.bookabbrev +", " + this.bookIndex + ") "+ "\n\n" 
       +  this.filename + "\n\n" 
      + this.chapter  + ":" + this.verse  
      + " - " + this.lastchapter  + ":" + this.lastverse + "." 
      +"\n\nFinal chapter: " + this.FinalChapter 
      +"\n\nSingle chapter: " + this.SingleChapter 
      +"\n\nError: " + this.error) ;
    return ;
    }
    
function Parse_getBookXML(){
  if(Server=="true") {
// Server references must always be to the absolute root server, not through the baseURL!
    var httpstring  = "http://" + getHost() +":" + getPort() + "/Server.xml?" 
       + this.bookabbrev + this.chapter + ":" + this.verse
       + "-" + this.lastchapter + ":" + this.lastverse ;  // Modified 11 Jul 2013 for revised Server.    
       + "&chk=0" 
    bookXML  = loadSarissaDoc( httpstring ) ;
//    alert("Loaded bookXML from Server.xml.") ;
    }
  else{
    bookXML = loadSarissaDoc( baseURL + "Books/" + this.filename) ;
//    alert("Loaded bookXML from local file system.") ;
    }
  return;
  }
    
function Parse_setToXSL(textXSL){
  setXSLParam(textXSL, "chapter", this.chapter) ;
  setXSLParam(textXSL, "verse", this.verse) ;
  setXSLParam(textXSL, "lastchapter", this.lastchapter) ;
  setXSLParam(textXSL, "lastverse", this.lastverse) ;
  setXSLParam(textXSL, "singlechapter", this.SingleChapter) ;
  }
//  Chapter 1, Verse 1 <-> Index = 0 ;
function Parse_getIndex(c, v){
  var Index = 0 ;
  for(var i = 1; i < c; i++){
    Index = Index + this.ChapterVerses[i] ;
    }
  Index = (Index + v) - 1 ;
  return Index ;
  }
//-----------------------------------------------------------------------------

//  Sets the ChapterVerses array:  ChapterVerses[n] = number of verses in chapter n

function setChapterVerses(bookIndex){
  var ChapterVerses = new Array;
  var cvs = tanachIndexXML.selectNodes("/Tanach/tanach/book[position()=" + bookIndex +"]/c/vs") ;
  var ChapterVerses = new Array(cvs.length+1);
  ChapterVerses[0] = -1 ;
  for(var i = 0; i < cvs.length; i++){
    ChapterVerses[i+1] = parseInt(cvs[i].firstChild.nodeValue) ;
    }
  return ChapterVerses ;
  }
//=============================================================================
//=== 3 =======================================================================
//    
//   3. Text pulldown functions.
//
//     changeContent() ;
//     changeDH() ;
//     changeFontSize() ;
//     setDependentFontSizes(TextXSL)
//     changeLayout() ;
//     DHcode = getDHCode( Book, DHlabel) ;
//     setPDs() ;
//     setSelectedText( PDName, index, text )
//
//  Server buttons at bottom of page call these functions:
//
//     getXML() ;
//     getText() ;
//     getHTML() ;
//     getODT() ;
//
//  Response buttons for the ChangeFont page
//
//     enterFont() ;
//     returnToBookPage() ;
//     defaultFont() ;
//
//=============================================================================
//
function changeContent(){
    var content = getSelectedValue("ContentPD");
    createCookie("Content", content, 3650) ;
    setXSLParam(textXSL, "content", content) ;
    setSelectedValue("ContentPD", content) ;
    setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text") ) ;
    }
    
function changeDH(){
    var previousShowDHCodeSelector = getXSLParam(tanachXSL, "showDHlabelselector") ;
    var dh = getSelectedValue('DHPD') ;
    createCookie("DHMode", dh, 3650) ;
    setXSLParam(textXSL, "DH", dh) ;
    var ShowDHCodeSelector = getXSLParam( tanachXSL, "showDHlabelselector") ;
    setSelectedValue("DHPD", dh) ;
    setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text") ) ;
    }
    
    
function changeFontSize(){
    var fontsize = getSelectedValue('FontSizePD') ;
    if(fontsize=='change'){
      setXSLParam(tanachXSL, "fontfamily", FontFamily )
      setTemplateToNode(tanachIndexXML, tanachXSL, "ChangeFont", document.body) ;  
      return ;
     }
    if(fontsize=='test'){
      fontsize = getXSLParam(textXSL, "fontsize") ;
      setSelectedValue("FontSizePD", fontsize) ; 
      var fontfamily = getXSLParam(textXSL, "fontfamily") ;
      var url = "Pages/FontTest.xml?" + fontfamily ; 
      var w = window.open(url,"","", "") ;
      return ;
     }
    createCookie("FontSize", fontsize,  3650) ;
    setXSLParam(textXSL, "fontsize", fontsize) ;
    setXSLParam(textXSL, "cellpadding", 12 + fontsize/4 ) ;
    setDependentFontSizes(textXSL) ;
    setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text") ) ;
    }

// Sets the reducedfontsize and Englishfontsize variables
function setDependentFontSizes(textXSL){
    var fontsize = getXSLParam(textXSL, "fontsize") ;
    var reducedfontfraction = 0.75 ;
    var Englishfontfraction = 0.60 ;  // Changed 1 Jul 2010 
    setXSLParam(textXSL, "reducedfontsize", fontsize*reducedfontfraction) ;
    setXSLParam(textXSL, "Englishfontsize",fontsize*Englishfontfraction) ;
    }
    
// Layout PD has two functions: Format = (Full, Note-free, Text-only, Qere-only) and View =(0=Chapter/1=Verse )

function changeLayout(){
    var layout = getSelectedValue('LayoutPD') ;
    if (layout=='Verses' || layout=='Chapter'){ // PD requests change in view.
      var VersesMode = getXSLParam(textXSL, 'view') // Chapter=0 or Verses=1
      var layout = getXSLParam(textXSL, 'format') // Full, Note-free, Text-only, Qere-only
      if(VersesMode=='1'){ // In Verse view=1, go to Chapter view=0
        setXSLParam(textXSL, "view", '0') ;
        createCookie("View", "0", 3650) ;
        setSelectedText( 'LayoutPD', 4, 'Verses view' ) ;
      }
      else{  // In Chapter view=0, go to Verses view=1
        setXSLParam(textXSL, "view", '1') ;
        createCookie("View", "1", 3650) ;
        setSelectedText( 'LayoutPD', 4, 'Chapter view' ) ;
      }
    }
    createCookie("Layout", layout, 3650) ;
    setXSLParam(textXSL, "format", layout) ;
    setSelectedValue("LayoutPD", layout) ; 
    setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text") ) ;
    }
       
// Set the PD's from cookies after the Book page is displayed.
function setPDs(){
   var layout = getXSLParam(textXSL, "format") ;
   layout = askForCookie("Layout", layout)  ;
   var view = getXSLParam(textXSL, 'view') ;
   view = askForCookie("View", view)   ;
   setXSLParam(textXSL, "view", view) ;
   if(view=='1'){
      setSelectedText( 'LayoutPD', 4, 'Chapter view' ) ;
      }
   else{
      setSelectedText( 'LayoutPD', 4, 'Verses view' ) ;
      }
   setSelectedValue("LayoutPD", layout) ;
   setXSLParam(textXSL, "format", layout) ;
    
   var content = getXSLParam(textXSL, "content") ;  
   content = askForCookie("Content", content)   ;
   setSelectedValue("ContentPD", content) ; 
   setXSLParam(textXSL, "content", content) ;
     
   var fontsize = getXSLParam(textXSL, "fontsize") ;  
   fontsize = askForCookie("FontSize", fontsize)   ;
   setSelectedValue("FontSizePD", fontsize) ; 
   setXSLParam(textXSL, "fontsize", fontsize) ;
   setDependentFontSizes(textXSL) ;
       
   if(document.getElementById("DHPD") !=null){ // Do nothing if not Torah
     var DH = getXSLParam(textXSL, "DH") ;  
     DH = askForCookie("DHMode", DH)   ;    
     setSelectedValue("DHPD", DH) ;
     setXSLParam(textXSL, "DH", DH) ;
   }
 }

        
// Sets the specified HTML element, an option list, to have
// a particular text at a specified index position.
// Does nothing if index isn't in range,
  function setSelectedText( elementName, index, text ){
    var e = document.getElementById(elementName) ; 
    for (i=0; i < e.options.length; i++){
      if ( i == index){
        e.options[i].innerHTML = text ;
        }
      }
    }



// Font entry functions supporting the ChangeFont page.
    
function enterFont(){
     var newFont = document.fontInput.textfield.value ;
     FontFamily = newFont ;
     createCookie("FontFamily", newFont,  3650) ;
     setXSLParam(tanachXSL, "fontfamily", newFont) ;
     setXSLParam(textXSL, "fontfamily", newFont) ;
     setTemplateToNode(tanachIndexXML, tanachXSL, "ChangeFont", document.body) ;  
   }

function returnToBookPage() {
     setTemplateToNode(bookXML, tanachXSL, "Book", document.body ) ;
     setPDs() ;
     setLinksPD() ;
     setTemplateToNode(bookXML, textXSL, "Excerpt", document.getElementById("Text") ) ;
  }
  
function defaultFont(){
     document.fontInput.textfield.value = "SBL Hebrew" ;
   }
//-----------------------------------------------------------------------------  

// Server buttons

// Opens a new window with text from the XML server  

function getXML(){
      var XMLURL=baseURL+"Server.xml?" ;
      XMLURL = XMLURL + P.bookabbrev + P.chapter + ":" + P.verse
         + "-" + P.lastchapter + ":" + P.lastverse ;
      display = window.open() ;
      display.location = XMLURL ;
  }
  
// Opens a new window with text from the Text server  

function getText(){
      var TextURL= baseURL+"Server.txt?"
      TextURL = TextURL + P.bookabbrev + P.chapter + ":" + P.verse
         + "-" + P.lastchapter + ":" + P.lastverse ;
         

      var layout = getXSLParam(textXSL, "format") 
      var content = getXSLParam(textXSL, "content") 
      TextURL = TextURL 
          +  "&layout=" + layout
          +  "&content=" + content ;
      display = window.open() ;
      display.location = TextURL ;
  }
// Opens a new window with text from the HTML server  
function getHTML(){
      var HTMLURL=baseURL+"Server.html?"
      HTMLURL = HTMLURL + P.bookabbrev + P.chapter + ":" + P.verse
         + "-" + P.lastchapter + ":" + P.lastverse ;
         
      var layout = getXSLParam(textXSL, "format") 
      var view = getXSLParam(textXSL, "view") 
      var content = getXSLParam(textXSL, "content") 
      var fontsize = getXSLParam(textXSL, "fontsize") 
      var fontfamily = getXSLParam(textXSL, "fontfamily") 
      var Englishfontfraction = 0.75 ;  
      var Englishfontsize = fontsize*Englishfontfraction ;
      var dh = getXSLParam(textXSL, "DH") ;
      HTMLURL = HTMLURL 
          +  "&layout=" + layout
          +  "&view=" + view
          +  "&content=" + content 
          +  "&font=" + fontsize  
          +  "&fontfamily=" + fontfamily  
          +  "&Englishfontsize=" + Englishfontsize   
          +  "&dh=" + dh   ;
             
      HTMLURL=HTMLURL + "&Brief=1" ;
      display = window.open() ;
      display.location = HTMLURL ;
  }
// Opens a new window with text from the ODT server  
function getODT(){
      var ODTURL=baseURL+"Server.odt?" ;
      ODTURL = ODTURL + P.bookabbrev + P.chapter + ":" + P.verse
         + "-" + P.lastchapter + ":" + P.lastverse ;
         
      var layout = getXSLParam(textXSL, "format") 
      var content = getXSLParam(textXSL, "content") 
      var fontsize = getXSLParam(textXSL, "fontsize") 
      var fontfamily = getXSLParam(textXSL, "fontfamily") 
      var Englishfontfraction = 0.75 ;  
      var Englishfontsize = fontsize*Englishfontfraction ;
      ODTURL = ODTURL 
          +  "&textalign=right" 
          +  "&layout=" + layout
          +  "&content=" + content 
          +  "&font=" + fontsize  
          +  "&fontfamily=" + fontfamily  
          +  "&columns=1"  ;
      if (navigator.appVersion.indexOf("Mac")!=-1) {
        ODTURL=ODTURL + "&lineheight=120" ;
        }
          
      display = window.open() ;
      display.location = ODTURL ;
  }
//=============================================================================
//=== 4 =======================================================================

// When Hebrew text is highlighted and SHIFT-then-click is done,
// the representation of the text in Unicode is displayed
// in a separate window.

// Sets the SelectedText variable and launches the UnicodeRep page.

function showText(e){
    if(!e.shiftKey) return ;
    if(window.getSelection){
      SelectedText = new String(window.getSelection()) ; //<!-- Firefox -->
      }
    else if( document.getSelection){
      SelectedText = document.getSelection() ;
      }
    else if(document.selection){
      SelectedText = document.selection.createRange().text ; //<!-- IE6 -->
    }  
    ShiftPressed = false ;
    if (SelectedText.length > 200){
      alert( SelectedText.length + " Unicode characters have been selected.\n\n"
        + "This may be too long! \n\nConsider making a shorter selection. \n\n"
        + "But you may try it anyway.") ;
    }
    var U = new UnicodeRepresentations(SelectedText) ;    
    var url = "Pages/UnicodeRep.xml?" + deblank(U.QueryHexValues) ;
    var w = window.open(url, "", "", "") ;
    }
//=============================================================================
//=== 5 =======================================================================
  
function showBookTEIHeader(){
  var url = "Pages/TEIHeader.xml?" + (P.filename).replace(".xml", "") ; 
  var w = window.open(url,"","", "") ;
  }
//================================================================================================
//=== 6 =============================================================================================
//
//   Book page external links feature.
//
//  Depends on Links.xml containing link specification and translation markers.
//  Depends on Links.xsl.xml to provide creation of BooksLinkControl.
//
//================================================================================================
//================================================================================================

// Button actions for the Home and Book pages.  

//   setLinksPD() ;  Sets the LinksPD on the book page.
//   setLink() ;     Responds to selection of a link from LinksPD. 
//   goToLink() ;    Goes to the SelectedLink.

//-----------------------------------------------------------------------------  

// Sets the LinksPD on the book page.

function setLinksPD(showAlert){
  if(Server=='false') return ; // Without a Server, there's no LinksPD!
  
  var tNames = linksXML.selectNodes("/Links/links/link/name") ;
  
// linkCount is taken by actually counting links in Links.xml. 

  linkCount = tNames.length ;

  linkNames = new Array(linkCount);
  for(var i = 0; i < linkCount; i++){
    linkNames[i] = getNodeText(tNames[i]) ;
    }
 
  var tSites = linksXML.selectNodes("/Links/links/link/site") ;
  linkSites = new Array(linkCount);
  for(var i = 0; i < linkCount; i++){
    linkSites[i] = getNodeText(tSites[i]) ;
    }
 
  var tFormats = linksXML.selectNodes("/Links/links/link/format") ;
  linkFormats = new Array(linkCount);
  for(var i = 0; i < linkCount; i++){
    linkFormats[i] = getNodeText(tFormats[i]) ;
    }

// Links are 1 based!    
  selectedLink = askForCookie("SelectedLink", 1)  ;
  setXSLParam(linksXSL, "server", Server) ;
  setTemplateToNode(linksXML, linksXSL, "BookLinkControls", document.getElementById("BookLinkControls") ) ;  
  setSelectedValue("LinksPD", selectedLink ) ;
  }

// Responds to selection of a link from LinksPD. 
function setLink(){
  selectedLink = getSelectedValue('LinksPD') ;
  createCookie( "SelectedLink", selectedLink, 3650) ;
  }

//   goToLink() ;    Goes to the SelectedLink.  
function goToLink(){
    selectedLink = getSelectedValue('LinksPD') ;
// Catch "LC facsimile" linkName as special case.
    if(linkNames[selectedLink-1]=="LC facsimile"){
      showFacsimile(P.book, P.chapter, P.verse) ;
    }
    else{
      var URL = translateLink( linkSites[selectedLink-1], linkFormats[selectedLink-1]) ;
      var newWindow = window.open(URL) ;
    }
}
///-----------------------------------------------------------------------------

// Translation functions from (Site, Format) pairs and P to a URL

//  translateLink(Site, Format) ; 
//  fmt = setBookMarkers(fmt, Markers, P) ;
//  Index = getMarkerIndex( Markers, bmarker) ;
//  Value = getBookValue(Markers, MarkerIndex, booknumber) ;
//  String = twoDigits( numberstring ) ;

//-----------------------------------------------------------------------------
function translateLink(Site, Format){
  var fmt = Format.toString() ;
//  Search for any book marker, {$Bxxx} and replace it from the Markers.xml file.
  fmt = setBookMarkers(fmt, linksXML, P) ;
//  Replace chapter and verse markers  
  fmt= fmt.replace(/\{\$C\}/g, P.chapter.toString() ) ;
  fmt= fmt.replace(/\{\$Clast\}/g, P.lastchapter.toString() ) ;
  fmt= fmt.replace(/\{\$Cmm\}/g, twoDigits(P.chapter.toString()) ) ;
  fmt= fmt.replace(/\{\$V\}/g, P.verse.toString() ) ;
  fmt= fmt.replace(/\{\$Vlast\}/g, P.lastverse.toString() ) ;
  return Site + fmt ;
  }
  
//  Search for any book marker, {$Bxxx} and replace it from the Markers file.
function setBookMarkers(fmt, linksXML, P){
  var bmarker = /\{\$B\w*\}/g ;
  var bmarkers = fmt.match(bmarker) ;
  if(bmarkers!=null){
    for (var i =0; i < bmarkers.length; i++){
      var Index = getMarkerIndex(linksXML, bmarkers[i]) ; 
      if (Index > 0){
        var value = getBookValue(linksXML, Index, P.bookIndex) ;
// This is not the best way to do this!
        var fmts = fmt.split(bmarkers[i]) ;
        var trailer = fmts[1] ;
        if (fmts.length > 2) {
          for (var j = 2; j<fmts.length; j++){
            trailer = trailer + bmarkers[i] + fmts[j] ;
            }
          }
        fmt = fmts[0] + value + trailer ;
        }
      else{
        alert("setBookMarkers: Code " + bmarkers[i] + " isn't in Markers.xml.") ;
        }
      }
    }
  return fmt ;
  }
    
function getMarkerIndex( markersXML, bmarker){
  bmarker=bmarker.substring(2, bmarker.length-1) ;
  var BookCodeList = linksXML.selectNodes("/Links/markers/marker/code") ;
  for (var i=0; i < BookCodeList.length; i++){
    var code = getNodeText(BookCodeList[i]) ;
    if(code==bmarker){
      return i + 1 ;
      }
    }
  return -1;
  }

function getBookValue(markersXML, MarkerIndex, bookIndex){
  var path = "/Links/markers/marker[" + MarkerIndex + "]/marks/mark["+bookIndex+"]" ;
  var BookValueNode = markersXML.selectSingleNode(path) ;
  return getNodeText(BookValueNode) ;
  }

  
function twoDigits( numberstring ){
  var i = parseInt(numberstring) ;
  if ( i >= 100 && i < 110){
    numberstring = "a" + (i-100).toString() ;
    }
  if ( i >= 110 && i < 120){
    numberstring = "b" + (i-110).toString() ;
    }
  if ( i >= 120 && i < 130){
    numberstring = "c" + (i-120).toString() ;
    }
  if ( i >= 130 && i < 140){
    numberstring = "d" + (i-130).toString() ;
    }
  if ( i >= 140 && i < 150){
    numberstring = "e" + (i-140).toString() ;
    }
  if ( i >= 150 && i < 160){
    numberstring = "e" + (i-150).toString() ;
    }
  if(numberstring.length < 2){
    numberstring = "0" + numberstring ;
    }
  return numberstring ;
  }
//=============================================================================
//=============================================================================
// EOF
