
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlMatches: 'airbnb.com/(s|rooms)/' },
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

//var base_url = "http://mlovic.com";
var base_url = "http://localhost:8080";
//

function getListingId(url) {
  return url.split("/")[4].split("?")[0];
};

function getQueryString(url) {
  return url.split("?")[1];
};

function getLocation(url) {
  return url.match(/com\/s\/(.*)?\?/)[1]; // string instead of regex literal?
};

function isTargetURL(url) {
  return url.indexOf("airbnb.com/rooms/") > -1
};

// Check if the listing in the corresponding tab is already being monitored
// TODO separate querying chrome API from HTTP request
function checkForExistingAlert() {
  console.log("checking for existing alert");
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

// add alert to the system
function postAlert(path, callback) {
  let url = base_url + path;
  console.log("url: " + url);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url); // add true for async
  // also check onreadystatechange
  xhr.onload = function() {
    console.log("onload...")
    console.log(xhr.response)
    if (xhr.status == 200) {  // http status between 200 to 299 are all successful
      console.log("successful");
      callback();
    }
  }
  xhr.onerror = function() {
    alert('Network error');
  }
  xhr.send();
}

function pageType(tab) {
  switch (tab.url.match(/com\/(.*)?\//)[1]) {
  case "rooms":
    return "listing";
  case "s":
    return "search";
  }
}

chrome.pageAction.onClicked.addListener(function(tab){
  console.log("what is path?");
  console.log(path);
  //let url = tab.url;
  switch (pageType(tab)) {
    case "listing":
      var path = "/?id=" + getListingId(tab.url);
      break;
    case "search":
      var path = "/search-query?location=" + getLocation(tab.url) +
                 "&query_url=" + encodeURIComponent(getQueryString(tab.url));
      break;
    default:
      throw "Page must be listing or search page";
  }
  postAlert(path, function() {
    chrome.pageAction.setIcon({path: "dark_icon.png", tabId: tab.id});
  });
  // make ajax call here
});
