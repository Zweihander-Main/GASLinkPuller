/* global generateDialog */

/**
 * Creates modal dialog for picking GMail label to use for script checking.
 */
function lpDialog() {
	SpreadsheetApp.getUi().showModalDialog(
		generateDialog('Views/lpDialogPage.html'),
		'Select GMail Label to Pull Data From:'
	);
}

/**
 * Returns an array of all labels in user's GMail account
 */
function returnListOfLabels() {
	const returnArray = [];
	const labels = GmailApp.getUserLabels();
	labels.forEach((label) => {
		returnArray.push(label.getName());
	});
	return returnArray;
}

/**
 * Returns script set user selected GMail label from UserProperties
 * @return {string} Name of label stored
 */
function returnSelectedLabel() {
	const userProperties = PropertiesService.getUserProperties();
	return userProperties.getProperty('SELECTED_LABEL');
}

/**
 * Sets GMail label user has selected to script UserProperties
 * @param  {HTML form} formObject Looking for .labels property
 */
function processLPForm(formObject) {
	const userProperties = PropertiesService.getUserProperties();
	userProperties.setProperty('SELECTED_LABEL', formObject.labels);
}
