/* global $ chrome MutationObserver Audio */

/**
 * Callback for DOM mutation.
 *
 * @param recs - Array of MutationRecords
 * @param self - The MutationObserver calling the callback
 */
function mutConversation(recs, self) {
  if (!(document.hasFocus() || isIdle)) {
    for (var i = 0; i < recs.length; i++) {
      for (var j = 0; j < recs[i].addedNodes.length; j++) {
           var msg = recs[i].addedNodes[j];
           if (msg.className === 'system') {
             chrome.runtime.sendMessage(null, {
               chatMessage: {
                 type: 'system',
                 message: msg.innerText,
                 userId: null,
                 userName: null
               }
             });
           } else {
             chrome.runtime.sendMessage(null, {
               chatMessage: {
                 type: 'user',
                 message: msg.innerText,
                 userId: null,
                 userName: null
               }
             });
           }
         }
    }
  } else {
    console.log('window has focus or computer is idle, nothing to do');
  }
}

function handleIdleUpdate(message, sender, sendResponse) {
  if ('idleState' in message) {
    console.log('recieved idle state message: computer is '+message.idleState);
    isIdle = (message.idleState !== 'active');
  }
}

var isIdle = false;
var obsConversation = new MutationObserver(mutConversation);
obsConversation.observe($('#conversation')[0], { childList: true });
chrome.runtime.onMessage.addListener(handleIdleUpdate);
