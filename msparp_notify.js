/* global $ chrome MutationObserver Audio */

/**
 * Callback for DOM mutation.
 *
 * @param recs - Array of MutationRecords
 * @param self - The MutationObserver calling the callback
 */
function mutConversation(recs, self) {
  chrome.storage.local.get([
    'msparpUseIdleTimer', 'msparpIdleTime'
  ], function (stored) {
       if (!document.hasFocus() || isIdle(stored)) {
         for (var i = 0; i < recs.length; i++) {
           for (var j = 0; j < recs[i].addedNodes.length; j++) {
             var msg = recs[i].addedNodes[j];
             if (msg.className === 'system') {
               playSound('system-inbound.wav', 0.75);
             } else {
               playSound('user-inbound.wav', 0.75);
             }
           }
         }
       } else {
         console.log('window has focus, not idle, nothing to do');
       }
     });
}

/**
 * Play an sound in the extension's "sounds" folder.
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

/**
 * Event handler - updates the idle timer.
 *
 * @param e - jQuery event object
 */
function resetIdleTimer(e) {
  if (e.type !== 'mousemove' || !(lastX === e.screenX || lastY === e.screenY)) {
    lastAct = Date.now();
    lastX = e.screenX;
    lastY = e.screenY;
  }
}

/**
 *
 */
function isIdle(stored) {
  if (stored.msparpUseIdleTimer && stored.msparpIdleTime) {
    var now = Date.now();
    //minutes * 60000 = time in ms
    var threshold = stored.msparpIdleTime * 60000;
    return (now - lastAct) > threshold;
  } else {
    return false;
  }
}

var lastAct, lastX, lastY;
var obsConversation = new MutationObserver(mutConversation);
obsConversation.observe($('#conversation')[0], { childList: true });
$(window).on('load mousedown mousemove scroll click keypress', resetIdleTimer);
