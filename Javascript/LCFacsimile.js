//=============================================================================
//=============================================================================
//
//  LCFacsimile.js  -  Javascript for LC facsimile display
//
//=============================================================================
//=============================================================================

// Initial dispatcher.
var LCIndex ;          // The Sarissa file for the LC index html file.
                       // The following is a URL 
                       // to pop the pdf up in a separate window.
var indexLoaded = 0 ;  // Flag to prevent reloading of index.
                       // Location of the LC index file.
var TanachIndex        // Sarissa file for Books/TanachIndex
var tanachIndexLoaded = 0;  // Flag to prevent reloading of index.
var WLCText ;          // The Sarissa file for page-matching Server.xml file.
var pathToFolios = "http://www.cvkimball.com/Tanach/LCFolios/" ;
//----------------------------------------------------------------------------- 

function showFacsimile(book, chapter, verse){

// The book chapter:verse for the reference verse sought.  If a range is provided for the display,
// the first chapter:verse is the reference verse.
  var r = new Reference(book, chapter + ":" + verse) ;
 
// The Folio handling object.  
  var folio = new Folio(r) ;  // Finds the folio ID for the facsimile containing the reference.
  folio.locateText() ;
                              // Finds information locating the reference verse in the facsimile.
  
// Popup the text.
  folio.showText() ;
  
// Popup the pdf.
  folio.showPDF() ;
}
//----------------------------------------------------------------------------- 
//----------------------------------------------------------------------------- 

// Finds the folio ID for the facsimile page containing the reference verse, r.

function Folio(r){
  this.r = r;
  this.folioID = "" ;
  this.locateText = Folio_locateText ;  // .locateText()
                                        // Gets information locating the text in the facsimile.
  this.showPDF = Folio_showPDF ;    // .showPDF()
                                    // Pops up the PDF facsimile file.
  this.showText = Folio_showText ;  // .showText() 
                                    // Pops up the WLC text contained in the page.
                                    // locateText() must be called first.
  this.inRange = Folio_inRange ;    // Determines if the reference is on a given page.
                                    // Not for external use.
  
  this.r = r;                    // Reference for the reference verse.
  this.folioID = "" ;            // The folio ID for the facsimile page containing the reference verse.
  this.first = null ;            // Search temporary for Reference to first verse on page
  this.last = null ;             // Search temporary for Reference to last verse on page
  this.firstMatching = null ;    // Reference to first verse on page for page matching verse reference
  this.lastMatching = null ;     // Reference to first verse on page for page matching verse reference
  this.range = null ;            // Search temporary for string containing a folioID
  this.rangeMatching = null ;    // String containing folioID for page containing the reference verse.
  this.locationResult = " " ;    // String describing text location after locateText() is called.
  this.firstBook= " ";           // For facsimile pages with two books, the first book.
  this.secondBook = " " ;        // For facsimile pages with two books, the second book.
  this.twoBooks = false ;        // boolean indicating that two books are on the facsimile page.
  this.firstFullVerse = false ;  // boolean indicating that the reference verse is the first
                                 // FULL verse on the page.
  this.lastVerse = false ;       // boolean indicating that the reference verse is the last verse on the page.
  this.lastVersePartial = false; // boolean indicating that the last verse on the page is partial.
  
  if (indexLoaded == 0){
    LCIndex = loadSarissaDoc(baseURL +"XSL/LCIndex.xml") ;
    LCIndex.setProperty("SelectionLanguage", "XPath") ; 
    indexLoaded = 1 ;
  }
// Find the ranges and look for the reference.  
  var path = "/HTML/BODY/table/tr[./td[2]=\'" + this.r.book + "\']/td[3]" ;
  var bookFolios = LCIndex.selectNodes(path); 
  if(bookFolios.length ==0){
    alert("No folios found for book " + this.r.book + ".") ;
    }
  var chosenFolio = -1 ;
  for(var i=0; i < bookFolios.length; i++){
    this.range = getNodeText(bookFolios[i]) ;
    if(this.inRange()){
//      alert("Reference " + this.r.c + ":" + this.r.v + " is within the range " + this.range +  ": " + this.inRange() ) ;
      chosenFolio = i ;
      this.firstMatching = this.first ;
      this.lastMatching = this.last ;
      this.rangeMatching = this.range ;
      break ;
    }
  }
  if(chosenFolio == -1){
      alert("Reference " + this.r.c + ":" + this.r.v + " not found for book " + this.r.book + ".") ;
  }
// Get the folio ID.
  var path = "/HTML/BODY/table/tr[./td[2]=\'" + this.r.book + "\']/td[1]" ;
  var bookFolioIDs = LCIndex.selectNodes(path); 
  this.folioID = getNodeText(bookFolioIDs[chosenFolio])
} 
//----------------------------------------------------------------------------- 

// A citation is within a range if the first part of the verse is contained
// in the range. Ranges starting with a "b" split marking do not contain
// the first verse in the range as its starting half isn't in the range.

function Folio_inRange(){
  var rangeArray = this.range.split("-") ;
  if(rangeArray.length != 2){
    alert("inRange: Parsing error, range = >" + range + "<.") ;
  }
  this.first = new Reference(this.r.book, rangeArray[0]) ;
  this.last = new Reference(this.r.book, rangeArray[1]) ;
  var r2first = this.r.compare(this.first) ;
  var r2last = this.r.compare(this.last) ;
  
// Test depends on whether the first refers to the end of a split verse.

// The range starts with the last half of a verse.
  if(this.first.split=="b"){
    if((r2first == "gt" ) && (r2last =="lt" || r2last =="eq") ){
      return true ;
    }
    else{
      return false ;
    }
  }
  
// Not a last half of a verse.
  else{
    if((r2first == "gt"  || r2first =="eq") && (r2last =="lt" || r2last =="eq") ){
      return true ;
    }
    else{
      return false ;
    }
  }
}  
//----------------------------------------------------------------------------- 

// Provides a result string, also in .locationResult to assist the viewer in finding 
// the reference verse on the facsimile page.. 

function Folio_locateText(){
  var twoBooks = false ;
  var firstBook ;
  var secondBook ;
  
// Determine if 2 books are on same page.

// Find the ranges and look for the reference.  
  var path = "/HTML/BODY/table/tr[./td[1]=\'" + this.folioID + "\']/td[2]" ;
  var nodenodeArray = LCIndex.selectNodes(path); 
  if(nodenodeArray.length == 2){
    this.twoBooks = true ;
    this.firstBook = getNodeText(nodenodeArray[0]) ;
    this.secondBook = getNodeText(nodenodeArray[1]) ;
  }

// Locate the reference by downloading the page's text, including
// the off-page fractional verses.

// Get a copy of the WLC XML for all verses in the range.

  var URL = "Server.xml?" + this.r.book + this.firstMatching.c + ":" + this.firstMatching.v
     + "-" + this.lastMatching.c + ":" + this.lastMatching.v ; 
//  alert("The text will be obtained from the URL: " + baseURL + URL ) ;
  
  WLCText = loadSarissaDoc(baseURL + URL) ;
  WLCText.setProperty("SelectionLanguage", "XPath") ; 
  
// Get the total words count include w and k tags.
  var nodeArray = WLCText.selectNodes("//w"); 
  var totalWords = nodeArray.length ;
  nodeArray = WLCText.selectNodes("//k"); 
  totalWords = totalWords + nodeArray.length ;
  
// Get the words in the first verse
  nodeArray = WLCText.selectNodes("/Tanach/tanach/book/c/v[1]//w"); 
  var firstWords = nodeArray.length ;
  nodeArray = WLCText.selectNodes("/Tanach/tanach/book/c/v[1]//k"); 
  firstWords = firstWords + nodeArray.length ;
  
// Get the words in the first verse
  nodeArray = WLCText.selectNodes("/Tanach/tanach/book/c/v[last()]//w"); 
  var lastWords = nodeArray.length ;
  nodeArray = WLCText.selectNodes("/Tanach/tanach/book/c/v[last()]//k"); 
  lastWords = lastWords + nodeArray.length ;
  
  if(this.firstMatching.split=="b"){
    totalWords = totalWords - firstWords/2 ;
    }
  if(this.lastMatching.split=="a"){
    totalWords = totalWords - lastWords/2 ;
    }
  
// Get the words count from the start to the reference
  
  path = "/Tanach/tanach/book/c[./@n<" + this.r.c +"]/v/w" ;
  nodeArray = WLCText.selectNodes(path) ;
  var referenceWords = nodeArray.length ;
  path = "/Tanach/tanach/book/c[./@n<" + this.r.c +"]/v/k" ;
  nodeArray = WLCText.selectNodes(path) ;
  referenceWords = referenceWords + nodeArray.length ;
  path = "/Tanach/tanach/book/c[./@n=" + this.r.c +"]/v[./@n<" + this.r.v + "]/w" ;
  nodeArray = WLCText.selectNodes(path) ;
  referenceWords = referenceWords + nodeArray.length ;
  path = "/Tanach/tanach/book/c[./@n=" + this.r.c +"]/v[./@n<" + this.r.v + "]/k" ;
  nodeArray = WLCText.selectNodes(path) ;
  referenceWords = referenceWords + nodeArray.length ;
  if(this.firstMatching.split=="b"){
    referenceWords = referenceWords - firstWords/2 ;
  }
  
  var pct = Math.round(referenceWords*100/totalWords) ;
    
// Count sameks and pes
  path = "/Tanach/tanach/book/c[./@n<" + this.r.c +"]//samekh" ;
  nodeArray = WLCText.selectNodes(path) ;
  var samekhs = nodeArray.length ;
  path = "/Tanach/tanach/book/c[./@n=" + this.r.c +"]/v[./@n<" + this.r.v + "]//samekh" ;
  nodeArray = WLCText.selectNodes(path) ;
  samekhs = samekhs + nodeArray.length ;
  
  path = "/Tanach/tanach/book/c[./@n<" + this.r.c +"]//pe" ;
  nodeArray = WLCText.selectNodes(path) ;
  var pes = nodeArray.length ;
  path = "/Tanach/tanach/book/c[./@n=" + this.r.c +"]/v[./@n<" + this.r.v + "]//pe" ;
  nodeArray = WLCText.selectNodes(path) ;
  pes = pes + nodeArray.length ;
  
// Determine if the verse is first full or last or last partial verse

//  ** Remember r always contains the first half of the verse! ** 

// First full verse on page?
  this.firstFullVerse = false ;
// The first verse in the PDF isn't split
  if(this.firstMatching.split !="b"){
    if(this.r.compare(this.firstMatching) == "eq"){
      this.firstFullVerse = true ;
    }
  }
  
// The first verse in the PDF is split,
// compare r with the next verse.
//
  else{
    if( this.r.compare(this.firstMatching.next()) == 'eq' ){
        this.firstFullVerse = true ;
    }
  }
  
// Last verse on page?
  this.lastVerse = false ;
  this.lastVersePartial = false ;
  if(this.r.compare(this.lastMatching) == "eq"){
    this.lastVerse = true ;
    if(this.lastMatching.split=="a"){
      this.lastVersePartial = true  ;
    }
  }
  
  var result = "" ;
  if (!this.firstFullVerse && !this.lastVerse){
    result = "The reference starts about " + pct +" percent of the way into the text for " + this.r.book + ".";
    result = result + " " + samekhs + " samekh, mid-line gaps, and " + pes 
       + " pe, new lines, occur before the reference." ;
  }
  else{
    if(this.firstFullVerse){
      result = "The reference verse is the first full verse on the facsimile page for " + this.r.book + "." ;
    }
    if(this.lastVerse){
      if(!this.lastVersePartial){
        result = "The reference verse is the last verse on the facsimile page for " + this.r.book + "." ;
      }
      else{
        result = "The reference verse is the last verse on the facsimile page for " + this.r.book + ". It is a partial verse. " 
          + "To see the remainder of the verse in the facsimile, "
        + "set the reference verse to " ;
        if(this.r.isLastVerse()){
          if(this.r.book == "Numbers"){
            result= result + "Deuteronomy 1:1 ." ;
          }
          else if(this.r.book == "Jonah"){
            result = result + "Micah 1:1 ." ;
          }
          else{
            result = result + "Problem in index!" ;
          }
        }
        else{
          var rNext = this.r.next() ;
          result = result  + rNext.string() +". " ;
        }
      }
    }
  }
    
  this.locationResult = result ;
  return result ;
}
//----------------------------------------------------------------------------- 

// Popup the pdf.

function Folio_showPDF(){
  var facsimileFilename = "LC_Folio_" + this.folioID + ".pdf" ;
  var path = pathToFolios + facsimileFilename ;
//  alert("URL to PDF file: >" + path + "< ." ) ;
  var newWindow = window.open(path, "_blank") ;
  }
//----------------------------------------------------------------------------- 

// Popup the page's text with location information included.
// locateText() must be called first.

function Folio_showText(){
  var t2text ;
    
  if(!this.twoBooks){
    t2text = "Contains the reference: " + this.r.string();
  }
  else{
    if(this.firstBook ==this.r.book){
      t2text="The folio contains text from 2 books. The first book contains the reference: " + this.r.string()
      + ". Only the first book is shown below." ;
    }
    else if(this.secondBook== this.r.book){
      t2text="The folio contains text from 2 books. The second book contains the reference: "+ this.r.string() 
      + ". Only the second book is shown below."
    }
    else{
      alert("locateText: " + firstBook + " and " + secondBook + " are on the page."
      + " The reference book, " + this.r.book + ", was not found in either book.") ;
    }
  }
  var URL = "Server.html?" + this.r.book + this.firstMatching.c + ":" + this.firstMatching.v
     + "-" + this.lastMatching.c + ":" + this.lastMatching.v
     + "&Brief=1&font=16"
     
     + "&t1=Folio " + this.folioID + " --- " + this.r.book + " " 
     +  this.rangeMatching 
     
     + "&t3=" + t2text 
     + "&t4=" + this.locationResult ;
  var newWindow = window.open(baseURL + URL) ;
  }
//----------------------------------------------------------------------------- 
//----------------------------------------------------------------------------- 

//  Object for book, chapter, verse and split references.

// Parses x:y, x:ya, x:yb into the object. Blanks are ignored.

// Can show and compare references.

function Reference(book, string){
  this.show = Reference_show ;       // .show()
                                     // Shows the Reference in an alert.
  this.stringFull = Reference_stringFull ;  // .stringFull()
                                            // String including the split value.
  this.string = Reference_string ;          // .string()
                                            // String without the split value.
  this.compare = Reference_compare ;        // .compare(rx)
                                            // Compares the Reference object to another Reference
                                            // object with results "eq". "gt", "lt".
  this.isLastVerse = Reference_isLastVerse ;// .isLastVerse()
                                            // boolean indicating verse is last in the book.
  this.next = Reference_next ;              // rNext = r.next() ;
                                            // The next available verse in the book.  isLastVerse()
                                            // must be called first.
  this.book = "" ;     // Book
  this.c = 0 ;         // Chapter
  this.v = 0 ;         // Verse
  this.cs = 0 ;        // Total chapters in the book.
  this.vs = 0 ;        // Number of verses in the chapter, c.
  
  if (tanachIndexLoaded == 0){
    TanachIndex = loadSarissaDoc(baseURL +"Books/TanachIndex.xml") ;
    TanachIndex.setProperty("SelectionLanguage", "XPath") ; 
    tanachIndexLoaded = 1 ;
  }
  
  this.book = book ;   
  var string = deblank(string) ;
  var n = string.length
  if(string.charAt(n-1) == 'a' || string.charAt(n-1) == 'b'){
    this.split=string.charAt(n-1) ;
    string = string.substring(0, n-1) ;
    }
  else{
    this.split=" " ;
  }
    
  var sArray = string.split(":") ;
  if(sArray.length != 2){
    alert("Reference: Parsing error for >" + string +"<.") ;
  }
  this.c = parseInt(sArray[0]) ;
  this.v = parseInt(sArray[1]) ;
  }

// Compare object to r2 giving lt, eq, gt returns.
function Reference_compare(r2){
  if(this.book != r2.book){
    alert("Reference.compare(): Both References must be from the same book!"
       + "  Object book: " + this.book + "  argument book: " + r2.book + ".") ;
    }
  if(this.c > r2.c){
    return "gt" ;
  }
  if(this.c < r2.c){
    return "lt";
  }
// r1.c = r2.c
  if(this.v > r2.v){
    return "gt" ;
  }
  if(this.v < r2.v){
    return "lt" ;
  }
  return "eq" ;
}
  
function Reference_show(title){
  alert(title + " " + this.book + " " + this.c +":" + this.v + this.split) ;
  }
function Reference_stringFull(){
  return this.book + " " + this.c +":" + this.v + this.split ;
  }
function Reference_string(){
  return this.book + " " + this.c +":" + this.v  ;
  }
  
function Reference_isLastVerse(){
  var path = "/Tanach/tanach/book[./names/name=\'" + this.book +"\']/cs" ;
  var nodeArray = TanachIndex.selectNodes(path)
  if(nodeArray.length > 1){
    alert("Error in Reference.islastVerse() (1).");
    return ;
  }
  var csString = getNodeText(nodeArray[0]) ;
  this.cs = parseInt(csString) ;
  path = "/Tanach/tanach/book[./names/name=\'" + this.book +"\']/c[./@n=" + csString +"]/vs";
  var nodeArray = TanachIndex.selectNodes(path) ;
  if(nodeArray.length > 1){
    alert("Error in Reference.islastVerse() (2).");
    return ;
  }
  this.vs=parseInt(getNodeText(nodeArray[0])) ;
  if (this.c < this.cs){
    return false ;
  }
  else{
    if(this.v == this.vs){
      return true ;
    }
  }
  return false ;
}

function Reference_next(){
  var path = "/Tanach/tanach/book[./names/name=\'" + this.book +"\']/c[./@n=" + this.c  +"]/vs";
  var nodeArray = TanachIndex.selectNodes(path) ;
  if(nodeArray.length > 1){
    alert("Error in Reference.next() (1).");
    return ;
  }
  var localVs = parseInt(getNodeText(nodeArray[0])) ;
  var nextR ;
  if(this.v < localVs){
    var localV = this.v + 1 ;
    nextR = new Reference(this.book, (this.c + ":" +localV) ) ;
   }
  else{
    var localC = this.c + 1 ;
    nextR = new Reference(this.book, (localC + ":" +1) ) ;
  }
  return nextR ;
}
//=============================================================================
//=============================================================================
//   EOF
