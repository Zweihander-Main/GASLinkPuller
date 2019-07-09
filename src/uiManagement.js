/* global checkTriggerExists */

/**
 * Create the user facing menu allowing them to start the script and specify
 * options
 */
function createMenu() {
	SpreadsheetApp.getUi()
		.createMenu('Link Puller')
		.addItem('Select GMail Label', 'lpDialog')
		.addItem('Control Mail Checking', 'trigDialog')
		.addItem('Manually Pull Messages', 'pullGMailData')
		.addToUi();
}

/** GAS Simple Trigger called on Spreadsheet open */
function onOpen() {
	createMenu(false);
}
