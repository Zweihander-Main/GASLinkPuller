/* global createMenu */

/**
 * Checks given triggers array to see if script set trigger is present
 * @param  {array} triggers array of triggers
 * @return {boolean}          returns true if script trigger is present
 */
function findTrigger(triggers) {
	return triggers.find((trigger) => {
		return trigger.getHandlerFunction() === 'pullGMailData';
	});
}

/**
 * Checks if script set trigger is present on current Spreadsheet
 * @return {boolean} True if it is, false if not
 */
function checkTriggerExists() {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const triggers = ScriptApp.getUserTriggers(ss);
	if (findTrigger(triggers)) {
		return true;
	}
	return false;
}

/**
 * Installs user trigger for checking GMail
 */
function installTrigger() {
	ScriptApp.newTrigger('pullGMailData')
		.timeBased()
		.everyHours(1)
		.create();
}

/**
 * Uninstalls user trigger set by this script for checking GMail.
 * Will log if the trigger wasn't found.
 */
function uninstallTrigger() {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const triggers = ScriptApp.getUserTriggers(ss);
	const toUninstallTrigger = findTrigger(triggers);
	if (toUninstallTrigger) {
		ScriptApp.deleteTrigger(toUninstallTrigger);
	} else {
		Logger.log('Trigger not found');
	}
}
