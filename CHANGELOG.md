0.5.1 / ####-##-##
==================

  * Checked, check and uncheck methods
  * Checked and not checked assertions
  * Browser.requests
  * Browser.assert.requests
  * Fixed SubqueryXpath Problem
  * Compositer updated to 1.1.0

0.5.0 / 2018-03-31
==================

  * Added optional selector to findByTextContaining
  * WaitFor support for functions and xPath
  * Back, forward and refresh methods
  * Settings updated if changed between browser creation
  * Fixed bug with error messages expect and actual values
  * Support for node 8.0.0
  * Remove unnecessary files from pack
  * Major code refactor
  * Mixwith, compositer and deep-equal dependencies added

0.4.6 / 2018-03-24
==================

  * Browser.assert.cookie
  * Cookies submodule
  * Remove default assertions errors

0.4.5 / 2018-03-24
==================

  * Added selector support for findByText and clickText
  * Browser.assert.global
  * Added custom errors
  * Assertion error improvements
  * Error thrown when trying to perform actions before opening url
  * Open error handled
  * Dependencies update

0.4.4 / 2018-03-23
==================

  * Browser.evaluate
  * Options and selectedOptions assertions
  * Browser.options
  * Browser.keyPress
  * LocalStorage assertions
  * Browser.setValue

0.4.3 / 2018-03-19
==================

  * LocalStorage submodule
  * Browser.innerHtml and assertions
  * Query and QueryAll support optionally 2 parameters for subqueries
  * Assert text and not text now support arrays of expected strings
  * Minor tests cleanup
  * Puppeteer updated to 1.2.0

0.4.2 / 2018-03-06
==================

  * Select and selectedOptions methods
  * Text and title assertions now support regex expectations
  * Not class assertion
  * Class method now throws if no element is found
  * Injected query method now accepts xpath,
  * Browser.uploadFile method
  * Puppeteer updated to 1.1.1
  * Assert.attribute now allows using null as expected value

0.4.1 / 2018-02-23
==================

  * Browser.waitUntilNotVisible method
  * Href and not href assertions
  * Waitfor now waits until the element is visible
  * Fixed bug where url wasn't updated by window history

0.4.0 / 2018-02-21
==================

  * Browser style and not style assertions
  * Browser.styles will return the computed css styles
  * Type will trigger the keyboard events
  * Type behaviour changed
  * Readme improvements

0.3.2 / 2018-02-16
==================

  * Attribute and not attribute assertions
  * Browser.attribute method
  * Browser.click and browser.clickText throws if no element is found, return the number of elements
  * Puppeteer settings are now passed down in createBrowser, including slowMo
  * Minor improvements in assertion messages

0.3.1 / 2018-02-09
==================

  * Method browser.clickText
  * Find by text fixed to return valid html elements

0.3.0 / 2018-02-07
==================

  * Support for DOM Node as selector in all methods
  * Assert textContains
  * Click now supports index and clicks all elements
  * Headless option to set browser's headless mode
  * All query methods now return a puppeteer's DOM Node
  * Browser.type types on all elements and apending the value
  * Removed jsdom dependency

0.2.2 / 2018-02-01
==================

  * Value assertion
  * Element and elements assertions
  * Browser methods value, clearValue and type
  * Node version set in package.json

0.2.1 / 2018-01-29
==================

  * Browser.class and browser.assert.class
  * Url getters and assertions
  * Documentation in the readme file

0.2.0 / 2018-01-27
==================

  * Using chrome headless and puppeteer instead of Phantomjs
  * "not" assertions reimplemented
  * Added default assertion error messages

0.1.0 / 2018-01-22
==================

  * XPath query support
  * Added "not" assertions
  * Assertions support
  * Basic tests
