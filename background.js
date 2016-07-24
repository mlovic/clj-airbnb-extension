
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'airbnb.com/rooms' },
            // TODO allow for all airbnb, but display error if tried
            // at page other than room
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

var base_url = "http://mlovic.com";
//var base_url = "http://localhost:8080";
//

function getListingId(url) {
  return url.split("/")[4].split("?")[0];
};

function isTargetURL(url) {
  return url.indexOf("airbnb.com/rooms/") > -1
};

function checkForExistingAlert() {
  console.log("checking for existing alert")
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    var tab = tabs[0];
    console.log(tab);
    // sometimes tab is undefined. don't know why
    if (tab == undefined) {
      console.log("tab is undefined");
      return false;
    }
    if (isTargetURL(tab.url)) {
      var id = getListingId(tab.url);
      var xhr = new XMLHttpRequest();
      xhr.open("GET", (base_url + "/?id=" + id))
      xhr.onload = function() {
        console.log("onload...")
        console.log(xhr)
        console.log(xhr.responseText)
        console.log(typeof(xhr.responseText))
        if (xhr.status == 200 && xhr.responseText == "true") {  // http status between 200 to 299 are all successful
          chrome.pageAction.setIcon({path: "dark_icon.png", tabId: tab.id});
        }
      }
      console.log("sending request");
      xhr.send();
    }
  });
};
// try to only check when airbnb is the page

chrome.tabs.onUpdated.addListener(checkForExistingAlert);
// TODO change icon for listings that already have alert

function sendListing(id, tab) {
  var url = base_url + "/?id=" + id;
  console.log("url: " + url);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url); // add true for async
  // also check onreadystatechange
  // TODO move into callback in main fn
  xhr.onload = function() {
    console.log("onload...")
    console.log(xhr.response)
    if (xhr.status == 200) {  // http status between 200 to 299 are all successful
      console.log("successful");
      chrome.pageAction.setIcon({path: "dark_icon.png", tabId: tab.id});
    }
  }
  xhr.onerror = function() {
    alert('Network error');
  }
  xhr.send();
  // TODO on completed callback - set icon
};

chrome.pageAction.onClicked.addListener(function(tab){
  var listingId= getListingId(tab.url);
  sendListing(listingId, tab);
  // make ajax call here
});
