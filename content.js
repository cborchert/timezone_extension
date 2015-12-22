chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.message) {
        case "convert-selected":
        convertTime(request.timezone);
        break;
    }
  }
);

function convertTime(toZone) {
    if(text = getSelectionText());
    var time = parseTime(text);
    var interpretedTime = createTime(time['time'], convertZoneToUTC(time['zone']));
    var convertedTime = convertToZone( createTime(time['time'], convertZoneToUTC(time['zone'])), toZone);
    var timeString = stringTime(convertedTime);
    if(timeString.length > 0) {
        appendValue( " ("+stringTime(convertedTime)+") " );
    }
    removeSelections();
}

function createTime(time, zone) {
    if(time && time != undefined) {
        var timeHr = time.substr(0, time.indexOf(":"));
        var timeMin = time.substr(time.indexOf(":") + 1, time.legth);
        var now = moment();
        if(typeof(zone) != undefined && zone != null && zone && zone.indexOf("UTC") > -1) {
            // Okay, looks like we have a UTC zone    
            offset = convertUtcToOffset(zone);
            now.utcOffset(offset);
            now.hours(parseInt(timeHr));
            now.minutes(parseInt(timeMin)); 
            now.seconds(0);
        } else {
            now.tz(zone);
            now.hours(parseInt(timeHr));
            now.minutes(parseInt(timeMin));
            now.seconds(0);
        }
        return now;
    } else {
        return false;
    }
}

//takes a moment called time and converts it to a given zone
function convertToZone(time, zone) {
    if(time && time != undefined) {
        var converted = time.clone().tz(zone);
        return converted;
    } else {
        return false;
    }
}

function stringTime(time) {
    if(typeof(time.format)== 'function') {
        return (time.format('h:mma [UTC]Z[/]z'));
    } else {
        return ("");
    }
    
}

function appendValue(html) {
    var selectInserted = true;
    if (typeof window.getSelection != "undefined") {
        // IE 9 and other non-IE browsers
        sel = window.getSelection();
        text = sel.toString() + html;
        // Test that the Selection object contains at least one Range
        if (sel.getRangeAt && sel.rangeCount) {
            // Get the first Range (only Firefox supports more than one)
            range = window.getSelection().getRangeAt(0);
            range.deleteContents();

            // Create a DocumentFragment to insert and populate it with HTML
            // Need to test for the existence of range.createContextualFragment
            // because it's non-standard and IE 9 does not support it
            if (range.createContextualFragment) {
                fragment = range.createContextualFragment(text);
            } else {
                // In IE 9 we need to use innerHTML of a temporary element
                var div = document.createElement("div"), child;
                div.innerHTML = text;
                fragment = document.createDocumentFragment();
                while ( (child = div.firstChild) ) {
                    fragment.appendChild(child);
                }
            }
            var firstInsertedNode = fragment.firstChild;
            var lastInsertedNode = fragment.lastChild;
            range.insertNode(fragment);
            if (selectInserted) {
                if (firstInsertedNode) {
                    range.setStartBefore(firstInsertedNode);
                    range.setEndAfter(lastInsertedNode);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE 8 and below
        range = document.selection.createRange();
        range.pasteHTML(html);
    }
    
    var textareas = document.getElementsByTagName('textarea');
    var inputs =  document.getElementsByTagName('input');
    var allAreas = Array.prototype.slice.call(textareas).concat(Array.prototype.slice.call(inputs));

    allAreas.forEach(function(e, i, a){
            if (e.selectionStart != undefined && e.selectionStart != e.selectionEnd) {
                var startPos = e.selectionStart;
                var endPos = e.selectionEnd;
                var text = e.value.substring(startPos, endPos); 
                e.value = e.value.substr(0, endPos) + html + e.value.substr(endPos, e.value.length)
            }
    });
}


function convertUtcToOffset(zone) {
    var offset = 0;
    zone = zone.replace("UTC", "");
    if(zone.indexOf(" ") > -1) {
       zone = zone.replace(/ /g, "");
    }
    var plus_minus = zone.substr(0, 1);
    if(zone.indexOf("+") > -1) {
       zone = zone.replace("+", "");
    }
    if(zone.indexOf("-") > -1) {
       zone = zone.replace("-", "");
    }
    var zoneHr = 0;
    var zoneMin = 0;
    if(zone.indexOf(":")>-1){ 
        zoneHr = zone.substr(0, zone.indexOf(":"));
        zoneMin = zone.substr(zone.indexOf(":")+1, zone.legth);
        offset = parseInt(zoneHr) * 60 + parseInt(zoneMin);
    } else {
        offset = parseInt(zone) * 60;
    }
    if(plus_minus == '-') {
        offset = parseInt(offset) * -1;
    }
    return offset;
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


//Returns an array with keys "time" as a string in 24hr format and "zone" as a string
function parseTime(timeString) {
    var timeZone = '';
    var ampm = 0;
    //give them the benefit of the doubt
    var validTime = true;
    
    //Get rid of whitespace and make lower case
    if(timeString.indexOf(" ") > -1) {
        timeString = timeString.replace(/ /g,'');
    }
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
                validTime = false;
            }
        }
        //Add the ":" back in
        time = timeHr + ":" + timeMin;
    
    // The rest is a timezone
        //Remove the parentheses
        timeZone = timeZone.replace(/\(/g,'');
        timeZone = timeZone.replace(/\)/g,'');
    
    //Create the output 
        timeArray = Array();
        timeArray['time'] = time;
        timeArray['zone'] = timeZone;
        
    if(validTime) {
        return timeArray;
    } else {
        return false;
    }    
}

//Will replace known timezones to UTC, eg UTC+1... if the input is unknown it will be left alone
//certain other strings will be converted to the moment.js timezone string
function convertZoneToUTC(zoneString) {
    if(typeof(zoneString) != undefined && zoneString ) {
        zoneString = zoneString.toUpperCase();
        zoneString = zoneString.replace("TIME", "");
        zoneString = zoneString.replace(".", "");
        zoneString = zoneString.replace("_", "");
        if(zoneString.indexOf("UTC") > -1) {
            return zoneString;
        } else {
            return zoneCode[zoneString];
        }
    }
}


//Known Timezones
var zoneCode = Array();
zoneCode['A']='UTC+1:00';
zoneCode['ACDT']='UTC+10:30';
zoneCode['ACST']='UTC+9:30';
//zoneCode['ACT']='UTC-5:00';
//zoneCode['ACT']='UTC+10:30/+9:30'; //Use a city instead
//zoneCode['ACT']='Australia/ACT';
zoneCode['ACWST']='UTC+8:45';
//zoneCode['ADT']='UTC+3:00';
//zoneCode['ADT']='UTC-3:00';
zoneCode['AEDT']='UTC+11:00';
zoneCode['AEST']='UTC+10:00';
//zoneCode['AET']='UTC+11:00/+10:00';
zoneCode['AFT']='UTC+4:30';
zoneCode['AKDT']='UTC-8:00';
zoneCode['AKST']='UTC-9:00';
zoneCode['ALMT']='UTC+6:00';
//zoneCode['AMST']='UTC-3:00';
//zoneCode['AMST']='UTC+5:00';
//zoneCode['AMT']='UTC-4:00';
//zoneCode['AMT']='UTC+4:00';
zoneCode['ANAST']='UTC+12:00';
zoneCode['ANAT']='UTC+12:00';
zoneCode['AQTT']='UTC+5:00';
zoneCode['ART']='UTC-3:00';
//zoneCode['AST']='UTC+3:00';
//zoneCode['AST']='UTC-4:00';
//zoneCode['AT']='UTC-4:00/-3:00';
zoneCode['AWDT']='UTC+9:00';
zoneCode['AWST']='UTC+8:00';
zoneCode['AZOST']='UTC+0:00';
zoneCode['AZOT']='UTC-1:00';
zoneCode['AZST']='UTC+5:00';
zoneCode['AZT']='UTC+4:00';
zoneCode['AoE']='UTC-12:00';
zoneCode['B']='UTC+2:00';
zoneCode['BNT']='UTC+8:00';
zoneCode['BOT']='UTC-4:00';
zoneCode['BRST']='UTC-2:00';
zoneCode['BRT']='UTC-3:00';
//zoneCode['BST']='UTC+6:00';
//zoneCode['BST']='UTC+11:00';
//zoneCode['BST']='UTC+1:00';
zoneCode['BTT']='UTC+6:00';
zoneCode['C']='UTC+3:00';
zoneCode['CAST']='UTC+8:00';
zoneCode['CAT']='UTC+2:00';
zoneCode['CCT']='UTC+6:30';
zoneCode['CDT']='UTC-5:00'; //gotta give preference to US here, sorry!
//zoneCode['CDT']='UTC-4:00';
zoneCode['CEST']='UTC+2:00';
zoneCode['CET']='UTC+1:00';
zoneCode['CHADT']='UTC+13:45';
zoneCode['CHAST']='UTC+12:45';
zoneCode['CHOT']='UTC+8:00';
zoneCode['CHUT']='UTC+10:00';
zoneCode['CKT']='UTC-10:00';
zoneCode['CLST']='UTC-3:00';
zoneCode['CLT']='UTC-3:00';
zoneCode['COT']='UTC-5:00';
zoneCode['CST']='UTC-6:00';//gotta give preference to US here, sorry!
//zoneCode['CST']='UTC+8:00';
//zoneCode['CST']='UTC-5:00';
//zoneCode['CT']='UTC-6:00/-5:00'; //Use a city instead
zoneCode['CVT']='UTC-1:00';
zoneCode['CXT']='UTC+7:00';
zoneCode['ChST']='UTC+10:00';
zoneCode['D']='UTC+4:00';
zoneCode['DAVT']='UTC+7:00';
zoneCode['DDUT']='UTC+10:00';
zoneCode['E']='UTC+5:00';
zoneCode['EASST']='UTC-5:00';
zoneCode['EAST']='UTC-5:00';
zoneCode['EAT']='UTC+3:00';
zoneCode['ECT']='UTC-5:00';
zoneCode['EDT']='UTC-4:00';
zoneCode['EEST']='UTC+3:00';
zoneCode['EET']='UTC+2:00';
zoneCode['EGST']='UTC+0:00';
zoneCode['EGT']='UTC-1:00';
zoneCode['EST']='UTC-5:00';
//zoneCode['ET']='UTC-5:00/-4:00'; //Use a city instead
zoneCode['F']='UTC+6:00';
zoneCode['FET']='UTC+3:00';
zoneCode['FJST']='UTC+13:00';
zoneCode['FJT']='UTC+12:00';
zoneCode['FKST']='UTC-3:00';
zoneCode['FKT']='UTC-4:00';
zoneCode['FNT']='UTC-2:00';
zoneCode['G']='UTC+7:00';
zoneCode['GALT']='UTC-6:00';
zoneCode['GAMT']='UTC-9:00';
zoneCode['GET']='UTC+4:00';
zoneCode['GFT']='UTC-3:00';
zoneCode['GILT']='UTC+12:00';
zoneCode['GMT']='UTC+0:00';
//zoneCode['GST']='UTC+4:00';
//zoneCode['GST']='UTC-2:00';
zoneCode['GYT']='UTC-4:00';
zoneCode['H']='UTC+8:00';
zoneCode['HADT']='UTC-9:00';
zoneCode['HAST']='UTC-10:00';
zoneCode['HKT']='UTC+8:00';
zoneCode['HOVT']='UTC+7:00';
zoneCode['I']='UTC+9:00';
zoneCode['ICT']='UTC+7:00';
zoneCode['IDT']='UTC+3:00';
zoneCode['IOT']='UTC+6:00';
zoneCode['IRDT']='UTC+4:30';
zoneCode['IRKST']='UTC+9:00';
zoneCode['IRKT']='UTC+8:00';
zoneCode['IRST']='UTC+3:30';
//zoneCode['IST']='UTC+5:30';
//zoneCode['IST']='UTC+1:00';
//zoneCode['IST']='UTC+2:00';
zoneCode['JST']='UTC+9:00';
zoneCode['K']='UTC+10:00';
zoneCode['KGT']='UTC+6:00';
zoneCode['KOST']='UTC+11:00';
zoneCode['KRAST']='UTC+8:00';
zoneCode['KRAT']='UTC+7:00';
zoneCode['KST']='UTC+9:00';
zoneCode['KUYT']='UTC+4:00';
zoneCode['L']='UTC+11:00';
zoneCode['LHDT']='UTC+11:00';
zoneCode['LHST']='UTC+10:30';
zoneCode['LINT']='UTC+14:00';
zoneCode['M']='UTC+12:00';
zoneCode['MAGST']='UTC+12:00';
zoneCode['MAGT']='UTC+10:00';
zoneCode['MART']='UTC-9:30';
zoneCode['MAWT']='UTC+5:00';
zoneCode['MDT']='UTC-6:00';
zoneCode['MHT']='UTC+12:00';
zoneCode['MMT']='UTC+6:30';
zoneCode['MSD']='UTC+4:00';
zoneCode['MSK']='UTC+3:00';
zoneCode['MST']='UTC-7:00';
//zoneCode['MT']='UTC-7:00/-6:00'; //Use a city instead
zoneCode['MUT']='UTC+4:00';
zoneCode['MVT']='UTC+5:00';
zoneCode['MYT']='UTC+8:00';
zoneCode['N']='UTC-1:00';
zoneCode['NCT']='UTC+11:00';
zoneCode['NDT']='UTC-2:30';
zoneCode['NFT']='UTC+11:00';
zoneCode['NOVST']='UTC+7:00';
zoneCode['NOVT']='UTC+6:00';
zoneCode['NPT']='UTC+5:45';
zoneCode['NRT']='UTC+12:00';
zoneCode['NST']='UTC-3:30';
zoneCode['NUT']='UTC-11:00';
zoneCode['NZDT']='UTC+13:00';
zoneCode['NZST']='UTC+12:00';
zoneCode['O']='UTC-2:00';
zoneCode['OMSST']='UTC+7:00';
zoneCode['OMST']='UTC+6:00';
zoneCode['ORAT']='UTC+5:00';
zoneCode['P']='UTC-3:00';
zoneCode['PDT']='UTC-7:00';
zoneCode['PET']='UTC-5:00';
zoneCode['PETST']='UTC+12:00';
zoneCode['PETT']='UTC+12:00';
zoneCode['PGT']='UTC+10:00';
zoneCode['PHOT']='UTC+13:00';
zoneCode['PHT']='UTC+8:00';
zoneCode['PKT']='UTC+5:00';
zoneCode['PMDT']='UTC-2:00';
zoneCode['PMST']='UTC-3:00';
zoneCode['PONT']='UTC+11:00';
zoneCode['PST']='UTC-8:00';
//zoneCode['PST']='UTC-8:00';
//zoneCode['PT']='UTC-8:00/-7:00'; //Use a city instead
zoneCode['PWT']='UTC+9:00';
zoneCode['PYST']='UTC-3:00';
zoneCode['PYT']='UTC-4:00';
zoneCode['Q']='UTC-4:00';
zoneCode['QYZT']='UTC+6:00';
zoneCode['R']='UTC-5:00';
zoneCode['RET']='UTC+4:00';
zoneCode['ROTT']='UTC-3:00';
zoneCode['S']='UTC-6:00';
zoneCode['SAKT']='UTC+10:00';
zoneCode['SAMT']='UTC+4:00';
zoneCode['SAST']='UTC+2:00';
zoneCode['SBT']='UTC+11:00';
zoneCode['SCT']='UTC+4:00';
zoneCode['SGT']='UTC+8:00';
zoneCode['SRET']='UTC+11:00';
zoneCode['SRT']='UTC-3:00';
zoneCode['SST']='UTC-11:00';
zoneCode['SYOT']='UTC+3:00';
zoneCode['T']='UTC-7:00';
zoneCode['TAHT']='UTC-10:00';
zoneCode['TFT']='UTC+5:00';
zoneCode['TJT']='UTC+5:00';
zoneCode['TKT']='UTC+13:00';
zoneCode['TLT']='UTC+9:00';
zoneCode['TMT']='UTC+5:00';
zoneCode['TOT']='UTC+13:00';
zoneCode['TVT']='UTC+12:00';
zoneCode['U']='UTC-8:00';
zoneCode['ULAT']='UTC+8:00';
zoneCode['UTC']='UTC';
zoneCode['UYST']='UTC-2:00';
zoneCode['UYT']='UTC-3:00';
zoneCode['UZT']='UTC+5:00';
zoneCode['V']='UTC-9:00';
zoneCode['VET']='UTC-4:30';
zoneCode['VLAST']='UTC+11:00';
zoneCode['VLAT']='UTC+10:00';
zoneCode['VOST']='UTC+6:00';
zoneCode['VUT']='UTC+11:00';
zoneCode['W']='UTC-10:00';
zoneCode['WAKT']='UTC+12:00';
zoneCode['WARST']='UTC-3:00';
zoneCode['WAST']='UTC+2:00';
zoneCode['WAT']='UTC+1:00';
zoneCode['WEST']='UTC+1:00';
zoneCode['WET']='UTC+0:00';
zoneCode['WFT']='UTC+12:00';
zoneCode['WGST']='UTC-2:00';
zoneCode['WGT']='UTC-3:00';
zoneCode['WIB']='UTC+7:00';
zoneCode['WIT']='UTC+9:00';
zoneCode['WITA']='UTC+8:00';
//zoneCode['WST']='UTC+13:00';
//zoneCode['WST']='UTC+1:00';
zoneCode['WT']='UTC+0:00';
zoneCode['X']='UTC-11:00';
zoneCode['Y']='UTC-12:00';
zoneCode['YAKST']='UTC+10:00';
zoneCode['YAKT']='UTC+9:00';
zoneCode['YAPT']='UTC+10:00';
zoneCode['YEKST']='UTC+6:00';
zoneCode['YEKT']='UTC+5:00';
zoneCode['Z']='UTC+0:00';

//Common Times
zoneCode['CT']='America/Chicago';
zoneCode['CENTRAL']='America/Chicago';
zoneCode['CHICAGO']='America/Chicago';

zoneCode['ET']='America/New_York';
zoneCode['EASTERN']='America/New_York';
zoneCode['NEWYORK']='America/New_York';
zoneCode['WASHINGTONDC']='America/New_York';
zoneCode['DC']='America/New_York';
zoneCode['MARYLAND']='America/New_York';

zoneCode['MT']='America/Denver';
zoneCode['MOUNTAIN']='America/Denver';
zoneCode['DENVER']='America/Denver';

zoneCode['PT']='America/Los_Angeles';
zoneCode['PACIFIC']='America/Los_Angeles';
zoneCode['LA']='America/Los_Angeles';
zoneCode['LOS ANGELES']='America/Los_Angeles';
zoneCode['LOSANGELES']='America/Los_Angeles';
zoneCode['SAN FRANCISCO']='America/Los_Angeles';
zoneCode['SANFRANCISCO']='America/Los_Angeles';
zoneCode['CALIFORNIA']='America/Los_Angeles';

zoneCode['AKT']='America/Anchorage';
zoneCode['ALASKA']='America/Anchorage';

//Europe
zoneCode['PARIS']='Europe/Paris';
zoneCode['FRANCE']='Europe/Paris';
zoneCode['LONDON']='Europe/London';
zoneCode['MADRID']='Europe/Madrid';

