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
	const foundArray = stringToMatch.match(urlMatchingRegex);
	if (foundArray.length === 0) {
		Logger.log('No URL found in: ' + stringToMatch);
		return [];
	} else {
		return foundArray;
	}
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
	const response = UrlFetchApp.fetch(
		'https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=' +
			urlToPull
	);
	if (response.getResponseCode() == 200) {
		const responseObject = JSON.parse(response.getContentText());
		const html = responseObject.html;
		return html.replace(/<[^>]+>/g, '').trim();
	} else {
		return '';
	}
}

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
							message.getBody()
						);
						let twitterData = '';
						let linkData = '';
						linksArray.forEach((link) => {
							if (checkIfTwitter(link)) {
								if (twitterData === '') {
									twitterData += pullTwitterData(link);
								} else {
									twitterData +=
										'\n---\n' + pullTwitterData(link);
								}
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
						dataSheet.appendRow([
							formattedDate,
							linkData,
							twitterData,
						]);
					});
					thread.markRead();
				});
			}
		}
	}
}
