/**
 * Checks if the script set property for the label to checked by the script
 * is set
 * @return {string/boolean} Label if set, false if not
 */
function returnCurrentUserLabelSet() {
	const userProperties = PropertiesService.getUserProperties();
	const userLabel = userProperties.getProperty('SELECTED_LABEL');
	if (userLabel !== null) {
		return userLabel;
	}
	return false;
}

/**
 * Matches urls from a given string. Urls are expected to be using http/https
 * protocol. Is looking for URLs that take up the whole line which should be
 * the ones this script is aiming for.
 * @param  {string} stringToMatch Likely message body from which URLs are to be
 *                                extracted
 * @return {[string]}               Array of matches or empty array if not found
 */
function matchLinksReturnArray(stringToMatch) {
	const urlMatchingRegex = /^((((?:https?){1}:(?:\/\/)?)(?:[^\-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)$/gm;
	let foundArray = stringToMatch.match(urlMatchingRegex);
	if (foundArray === null || foundArray.length === 0) {
		const lineEndingURLsRegex = /((((?:https?){1}:(?:\/\/)?)(?:[^\-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)$/gm;
		foundArray = stringToMatch.match(lineEndingURLsRegex);
		if (foundArray === null || foundArray.length === 0) {
			const anyURLsRegex = /((((?:https?){1}:(?:\/\/)?)(?:[^\-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/gm;
			foundArray = stringToMatch.match(anyURLsRegex);
			if (foundArray === null || foundArray.length === 0) {
				return [];
			}
		}
	}
	return foundArray;
}

/**
 * Will check if a URL belongs to the twitter.com domain
 * @param  {string} urlToCheck Possible Twitter URL
 * @return {boolean}            True if it matches twitter.com
 */
function checkIfTwitter(urlToCheck) {
	const twitterMatch = /^https?:\/\/([\w\d]+\.)?twitter\.com[A-Za-z0-9&?\-/_=]*$/;
	return twitterMatch.test(urlToCheck);
}

/**
 * Gets the string data of a tweet using the Twitter oembed API. Strips HTML and
 * asks that scripts aren't sent.
 * @param  {string} urlToPull Twitter URL to query
 * @return {string}           Tweet contents or empty string
 */
function pullTwitterData(urlToPull) {
	try {
		const response = UrlFetchApp.fetch(
			'https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=' +
				urlToPull
		);
		if (response.getResponseCode() == 200) {
			const responseObject = JSON.parse(response.getContentText());
			const html = responseObject.html;
			return html.replace(/<[^>]+>/g, '').trim();
		}
	} catch (e) {
		console.log({
			message: 'Pulling Twitter data from URL failed for ' + urlToPull,
			error: e,
		});
	}
	return '';
}

/**
 * Gets the title attribute of a URL.
 * @param  {string} urlToPull URL to query
 * @return {string}           Title of URL
 */
function pullURLTitle(urlToPull) {
	try {
		const response = UrlFetchApp.fetch(urlToPull);
		if (response.getResponseCode() == 200) {
			const contentText = response.getContentText();
			// deprecated but using as it's more forgiving of malformed html vs
			// XmlService
			const documentData = Xml.parse(contentText, true);
			const title = documentData.html.head
				.getElements('title')[0]
				.getText();
			return title.trim();
		}
	} catch (e) {
		console.log({
			message: 'Pulling title from URL failed for ' + urlToPull,
			error: e,
		});
	}
	return '';
}

/**
 * Function to row at the top of the sheet so most recent data is listed first
 * @param  {googleSheet} sheet           Current sheet
 * @param  {[array]} rowDataToInsert     Single array of values to insert in row
 */
function insertData(sheet, rowDataToInsert) {
	sheet.insertRows(2, 1);
	sheet
		.getRange(2, 1, 1, rowDataToInsert.length)
		.setValues([rowDataToInsert]);
}

/**
 * Logs a GAS message object to the Debug sheet. For use when no links could be
 * found.
 *
 * @param      {GAS Message}  message  The message to log info for
 */
function logMessageToDebug(message) {
	const debugSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
		'Debug'
	);
	const body = message.getBody();
	const date = message.getDate();
	const subject = message.getSubject();
	const thread = message.getThread();
	const threadId = thread.getId();
	const threadNum = thread.getMessageCount();
	const isUnread = message.isUnread();
	const formattedDate = Utilities.formatDate(
		date,
		Session.getScriptTimeZone(),
		'MM/dd/yyyy'
	);
	insertData(debugSheet, [
		formattedDate,
		subject,
		body,
		isUnread,
		threadId,
		threadNum,
	]);
}

/**
 * For debugging purposes only. Will pull all messages from the label regardless
 * of read status and add them to Debug sheet.
 */
// function debugGMail() {
// 	const userSetLabel = returnCurrentUserLabelSet();
// 	if (userSetLabel) {
// 		const label = GmailApp.getUserLabelByName(userSetLabel);
// 		if (label !== null) {
// 			const threads = label.getThreads();
// 			threads.forEach((thread) => {
// 				const messages = thread.getMessages();
// 				messages.forEach((message) => {
// 					logMessageToDebug(message);
// 				});
// 				thread.markUnread();
// 			});
// 		}
// 	}
// }

/**
 * Function to be called by user trigger to check user's set GMail label for
 * any new unread messages. Will not check if label is not set. If a new
 * message is found, will push the following to the spreadsheet:
 * - Message date formatted as MM/dd/yyyy
 * - All full line URLs found in message
 * - Any textual tweet data for URLs which are from twitter.com
 * Finally, will mark the message unread.
 */
function pullGMailData() {
	// debugGMail();
	const userSetLabel = returnCurrentUserLabelSet();
	if (userSetLabel) {
		const dataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
			'Link Data'
		);
		const label = GmailApp.getUserLabelByName(userSetLabel);
		if (label !== null) {
			const unreadCount = label.getUnreadCount();
			if (unreadCount > 0) {
				const threads = label.getThreads(0, unreadCount);
				threads.forEach((thread) => {
					const messages = thread.getMessages();
					messages.forEach((message) => {
						const linksArray = matchLinksReturnArray(
							message.getBody().trim()
						);
						if (linksArray.length === 0) {
							logMessageToDebug(message);
						} else {
							let pageData = '';
							let linkData = '';
							linksArray.forEach((link) => {
								let dataPuller = pullURLTitle;
								if (checkIfTwitter(link)) {
									dataPuller = pullTwitterData;
								}
								if (pageData === '') {
									pageData += dataPuller(link);
								} else {
									pageData += '\n---\n' + dataPuller(link);
								}
								if (linkData === '') {
									linkData += link;
								} else {
									linkData += '\n' + link;
								}
							});
							const date = message.getDate();
							const formattedDate = Utilities.formatDate(
								date,
								Session.getScriptTimeZone(),
								'MM/dd/yyyy'
							);
							insertData(dataSheet, [
								formattedDate,
								linkData,
								pageData,
							]);
						}
					});
					thread.markRead();
				});
			}
		}
	}
}
