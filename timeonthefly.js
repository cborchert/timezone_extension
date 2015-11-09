/* Time on the Fly is the basis for a Google extension which will
    take a selected time and replace it with the time in another timezone 
    
    Does not work with 5a or 5p must either be 5am or 5pm
    */

function convertTime(e) {
    e.preventDefault();
    
    if(text = getSelectionText())
    alert(parseTime(text));
    removeSelections();
}


function getSelectionText() {
    var text = "";
    // This will work on most normal elements, but not textareas or inputs
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection ) {
        //this should work for textareas etc on IE
        text = document.selection.createRange().text;
    }
    
    // for all those inputs and textareas out there :)
    if(text == "") {
        var textareas = document.getElementsByTagName('textarea');
        var inputs =  document.getElementsByTagName('input');
        var allAreas = Array.prototype.slice.call(textareas).concat(Array.prototype.slice.call(inputs));
        
        allAreas.forEach(function(e, i, a){
            if (text == "" || text == undefined) {
                text = getSelectionFromTextComponent(e, i, a);
            }
        });
    }
    
    if(text != '' && text != undefined) {
        return text;
    } else {
        return false;
    }
}

function getSelectionFromTextComponent( e, i, a) {
    if (e.selectionStart != undefined && e.selectionStart != e.selectionEnd) {
        var startPos = e.selectionStart;
        var endPos = e.selectionEnd;
        var text = e.value.substring(startPos, endPos); 
        if(text != "" && text != undefined) {
            return text;
        }
    }
}

function removeSelections() {
        var textareas = document.getElementsByTagName('textarea');
        var inputs =  document.getElementsByTagName('input');
        var allAreas = Array.prototype.slice.call(textareas).concat(Array.prototype.slice.call(inputs));
        
        allAreas.forEach(function(e, i, a){
            e.selectionEnd = e.selectionStart;
            e.blur();
        });
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection ) {
            document.selection.empty();
        }
}

function parseTime(timeString) {
    var timeZone = '';
    var ampm = 0;
    //give them the benefit of the doubt
    var validTime = true;
    
    //Get rid of whitespace and make lower case
    timeString = timeString.replace(/ /g,'');
    timeString = timeString.toLowerCase();
    endOfTime = 0;
    
    // First look for the time itself
        //grab the first 7 chars... this is long enough to get all the numbers and AM PM
        time = timeString.substr(0, 7);
        // If there is an open paren, grab everything before that
        if(time.indexOf("(") > -1) {
            time = time.substr(0, time.indexOf("("));
        }
        // if there is a U... that will be UTC, grab everything before that
        if(time.indexOf("u") > -1) {
            time = time.substr(0, time.indexOf("u"));
        }
        
        if(time.indexOf("am") > -1) {
            time = time.substr(0, time.indexOf("am") + 2);
        }
        if(time.indexOf("pm") > -1) {
            time = time.substr(0, time.indexOf("pm") + 2);
            ampm = 12;
        }
        
        //From here, we can assume that the rest of the string is the timezone
        timeZone = timeString.replace(time, "");
    
        //now we should have a time string to work with. Let's get to work!
        var timeHr = 0;
        var timeMin = "00";
        
        //get the number part as a string
        timeNum = String(time.match( /\d+/g )).replace(",","");
        if ( timeNum.length == 0 || isNaN(parseInt(timeNum)) || typeof(timeNum) == undefined ) {
            validTime = false;
        } 
        
        //if it's more 2 chars long then assume we have minutes on our hands
        if( timeNum.length > 2 || timeNum.substr(0, 1) == "0") {
            //get the last 2 numbers, that's our minutes
            timeMin = String(timeNum.substr(timeNum.length - 2, timeNum.length));
            timeNum = timeNum.substr(0, timeNum.length - 2);
        }
        
        //the rest is the hours (add the ampm value)
        timeHr = String(parseInt(timeNum) + ampm);
        
        //adjust for the fact that 12pm should not be converted to 24:00
        if(parseInt(timeHr) >= 24) {
            timeHr = String(parseInt(timeHr) - 12);
            if(parseInt(timeHr) >= 24) { //if it's still more than 24, then they fucked up
//                validTime = false;
            }
        }
        //Add the ":" back in
        time = timeHr + ":" + timeMin;
    
    // The rest is a timezone
        //Remove the parentheses
        timeZone = timeZone.replace(/\(/g,'');
        timeZone = timeZone.replace(/\)/g,'');
    
    if(validTime) {
        return time + ' zone: '+ timeZone;
    } else {
        return false;
    }
    
}