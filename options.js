/* global chrome $ console */

/**
 * Callback for chrome.storage.local.get.
 * Sets the UI elements to match the settings retrieved from storage.
 *
 * @param stored - An object containing the values retrieved from storage
 */
function updatePage(stored) {
  if (stored.hasOwnProperty('msparpUseIdleTimer')) {
    $('#useIdleTimer').prop('checked', stored.msparpUseIdleTimer);
  }
  if (stored.hasOwnProperty('msparpIdleTime')) {
    $('#idleTime').val(stored.msparpIdleTime);
  } else {
    $('#idleTime').val(5);
  }
  toggleTimerOpts();
}

function toggleTimerOpts() {
  var disabled = !$('#useIdleTimer').prop('checked');
  $('#idleTime').prop('disabled', disabled);
  $('#idleTime, label[for=idleTime]').toggleClass('ui-state-disabled',
                                                      disabled);
}

/**
 * Gets the settings from storage and updates the page.
 */
function getStorage() {
  console.log('refreshing page');
  chrome.storage.local.get([
    'msparpUseIdleTimer', 'msparpIdleTime'
  ], updatePage);
}

/**
 * Show a message for a second and a half once saving is complete.
 */
function saveComplete() {
  if (!chrome.runtime.lastError) {
    $('#popupMsg').text('Save successful!');
  } else {
    $('#popupMsg').text('There was an error: ' + chrome.runtime.lastError);
  }
  $('#popupMsg').dialog({
    closeOnEscape: false,
    draggable: false,
    resizable: false,
    dialogClass: 'ui-dialog-notitle ui-option',
    hide: 100,
    width: 250,
    height: 50,
    open: function (e, ui) {
      setTimeout(function () { $('#popupMsg').dialog('close'); }, 1500);
    }
  });
}

$(function () {
  $('#useIdleTimer').on('change', toggleTimerOpts);

  $('button#saveSettings').button({
    icons: { primary: 'ui-icon-disk' }
  }).click(function () {
    chrome.storage.local.set({
      msparpUseIdleTimer: $('#useIdleTimer').prop('checked'),
      msparpIdleTime: $('#idleTime').val()
    }, saveComplete);
  });

  $('button#discardChanges').button({
    icons: { primary: 'ui-icon-closethick' }
  }).click(function () {
    getStorage();
  });

  //Populate the settings
  getStorage();

  //Listen for settings changes
  //Sort of an artifact from settings being in the popup but I see
  //it useful in case someone has multiple instances of this page open.
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (changes.hasOwnProperty('msparpUseIdleTimer') ||
        changes.hasOwnProperty('msparpIdleTime')) {
      getStorage();
    }
  });
});