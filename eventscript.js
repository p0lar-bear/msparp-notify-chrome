/* global chrome $ */

/**
 * Play a sound in the extension's "sounds" folder.
 *
 * @param soundName - Name of the sound file.
 * @param vol - Volume from 0.0 to 1.0.
 */
function playSound(soundName, vol) {
  if (soundName && soundName !== '(None)') {
    console.log('playing ' + soundName + ' at ' + vol + ' gain');
    var sound = new Audio(chrome.extension.getURL('sounds/' + soundName));
    sound.volume = vol;
    sound.play();
  }
}

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
 * Generate notifications and play sounds.
 */
function doNotify(stored, chatMessage) {
  if (chatMessage.type === 'system') {
    playSound('system-inbound.wav', parseFloat(stored.msparpNotifyVolume));
  } else {
    playSound('user-inbound.wav', parseFloat(stored.msparpNotifyVolume));
  }
}

/**
 * Handle a passed message.
 *
 * See https://developer.chrome.com/extensions/runtime#event-onMessage
 */
function handleMessage(message, sender, sendResponse) {
  if ('chatMessage' in message) {
    chrome.storage.local.get([
      'msparpNotifyVolume'
    ], function (stored) { doNotify(stored, message.chatMessage); });
  }
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
      'msparpIdleTime': 10,
      'msparpNotifyVolume': 0.75
    });
    chrome.idle.setDetectionInterval(600);
  }
}

chrome.runtime.onInstalled.addListener(onInit);
chrome.runtime.onMessage.addListener(handleMessage);
chrome.storage.onChanged.addListener(updateIdleTimer);
chrome.idle.onStateChanged.addListener(updateIdleState);