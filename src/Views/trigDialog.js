/* global generateDialog, checkTriggerExists, installTrigger, uninstallTrigger */

/**
 * Creates modal dialog for user to start or stop script auto checking
 */
function trigDialog() {
	SpreadsheetApp.getUi().showModalDialog(
		generateDialog('Views/trigDialogPage.html'),
		'Control GMail Checking:'
	);
}

/**
 * Returns if the script trigger is currently set
 * @return {boolean} true if it is
 */
function returnIfCurrentlyTriggering() {
	return checkTriggerExists();
}

/**
 * Starts or stops script trigger depending on user selection
 * @param  {HTML form} formObject Looking for .toChangeTo property as either
 *                     'start' or 'stop'
 */
function processTrigForm(formObject) {
	if (formObject.toChangeTo === 'start') {
		installTrigger();
	} else {
		uninstallTrigger();
	}
}
