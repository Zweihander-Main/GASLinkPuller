# GASLinkPuller

A Google Apps Script project for pulling URLs from emails in a user-selected GMail label and adding those URLs to a Google Spreadsheet. Most useful when combined with 'memo' apps that hook into Android/iOS sharing functionality.

## Features

-   Easy GUI for selecting GMail label to check
-   Turn hourly checking of the label on and off
-   Find all major URLs in a message from a memo-like sharing action and ignore unimportant URLs
-   Pull in Tweet textual data if a URL points to Twitter
-   Facilitates seamless link sharing between 2 or more parties

## Usage

On the opening of a Google Spreadsheet with this script installed, a 'Link Puller' menu item is added. Under this item are 3 options:

### Select GMail Label

Allows the user to select which GMail label the link puller will be checking:
![Label Demo](/docs/LabelDemo.gif)

It's recommended to combine this with an incoming messages filter on the GMail side for maximum automation.

### Control Mail Checking

Turns automatic hourly checking of the GMail label on and off. If a new message is found, it will be parsed for URLs which will be added to the Spreadsheet.

### Manually Pull Messages

## Installation

This project uses gulp in combination with [google/clasp](https://github.com/google/clasp#pull) to make seamless building easy. After logging in to `clasp`, it's recommended you `create` a new project. Do an initial build using `gulp buildLocal` and then execute `npx clasp push` to update the manifest of the project. After that, you can simply run `gulp build` for all subsequent runs and the project will be built and pushed to your spreadsheet.

## Sample spreadsheet

A sample spreadsheet that can be used with this script is available [here](https://docs.google.com/spreadsheets/d/1nOMRU7PeyXAnY7Z7d2En_jVV2ItrJE0RqHGFLGYAeR0/edit#gid=0). Feel free to copy it and adapt it to your purposes!

## Todo

-   Nothing right now.

## Available for Hire

I'm available for freelance, contracts, and consulting both remotely and in the Hudson Valley, NY (USA) area. [Some more about me](https://www.zweisolutions.com/about.html) and [what I can do for you](https://www.zweisolutions.com/services.html).

Feel free to drop me a message at:

```
hi [a+] zweisolutions {●} com
```

## License

[MIT](./LICENSE)
