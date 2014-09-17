/* global $ chrome MutationObserver Audio */

/**
 * Callback for DOM mutation.
 *
 * @param recs - Array of MutationRecords
 * @param self - The MutationObserver calling the callback
 */
function mutConversation(recs, self) {
  console.log('conversation mutated');
  if (!document.hasFocus() || isIdle()) {
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
 * Updates the idle timer.
 */
function resetIdleTimer() {
  lastAct = Date.now();
}

/**
 *
 */
function isIdle() {
  var now = Date.now();
  //Use config value later. Goes by minutes
  var threshold = 2 * 60000;
  return (now - lastAct) > threshold;
}

var lastAct;
var obsConversation = new MutationObserver(mutConversation);
obsConversation.observe($('#conversation')[0], { childList: true });
$(window).on('load mousedown mousemove click keypress', resetIdleTimer);
