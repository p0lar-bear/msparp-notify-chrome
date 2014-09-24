/* global chrome $ */

function updateIdleTimer(changes, areaName) {
  if ('msparpIdleTime' in changes) {
    console.log('updating idle check interval');
    chrome.idle.setDetectionInterval(changes.msparpIdleTime.newValue * 60);
  }
}

function updateIdleState(newState) {
  chrome.storage.local.get('msparpUseIdleTimer', function (stored) {
    if (stored.msparpUseIdleTimer) {
      chrome.tabs.query(
        { url: 'http://unsupported.msparp.com/chat/*' },
        function (tabs) {
          for (var i = 0; i < tabs.length; i++) {
            console.log('sending new idle state to tab ' + tabs[i].id);
            chrome.tabs.sendMessage(tabs[i].id, { idleState: newState });
          }
        }
      );
    }
  });
}

/**
 * Handler for extension installation or update.
 *
 * @param details - refer to https://developer.chrome.com/extensions/runtime#event-onInstalled
 */
function onInit(details) {
  if (details.reason === 'install') {
    //Init settings
    chrome.storage.local.set({
      'msparpUseIdleTimer': true,
      'msparpIdleTime': 10
    });
    chrome.idle.setDetectionInterval(600);
  }
}

chrome.runtime.onInstalled.addListener(onInit);
chrome.storage.onChanged.addListener(updateIdleTimer);
chrome.idle.onStateChanged.addListener(updateIdleState);