/**
 * Creates HTML templates from given html file
 * @param  {.html file} dialogToGenerate HTML template to create from
 * @return {html UI element for GAS}
 */
function generateDialog(dialogToGenerate) {
	const html = HtmlService.createTemplateFromFile(dialogToGenerate);
	return html.evaluate();
}

/**
 * Allows template HTML files to include other template files. Useful for
 * separating JS and CSS.
 * @param  {string} filename name of HTML file
 * @return {html content}          content of file
 */
function include(filename) {
	return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
