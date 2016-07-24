// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.pageAction.onClicked.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
     var activeTab = arrayOfTabs[0];
     var activeTabUrl = activeTab.url; // or do whatever you need
     console.log("working")
     console.log(activeTabUrl)
  });

});
