0.7.6 / 2018-06-13
==================

  * Fixed request interceptor unhandled error

0.7.5 / 2018-06-12
==================

  * Request filter and assertion by postBody
  * RequestMock object with assertion
  * Browser.waitForPageLoad
  * Mocks cleared on close
  * BeforeClose hook in components
  * ClearRequestMocks on open option
  * Assert.redirect

0.7.4 / 2018-06-07
==================

  * Browser.focus
  * Browser.hover
  * Assert.focus
  * Minor bugs in tests fixed
  * Request mock supports objects as response method
  * Fixed bug where navigation to a different page breaks some methods

0.7.3 / 2018-06-01
==================

  * Assert.enabled and assert.disabled
  * WaitForUrl
  * Fixed assert.attribute with null expected
  * Dependencies update

0.7.2 / 2018-05-03
==================

  * Requests.removeMock
  * Requests list now restarted on each opened page
  * Fixed bug where request module was not properly cleared

0.7.1 / 2018-04-23
==================

  * Request mocks
  * Browser.style
  * Components improved, race condition warning fixed

0.7.0 / 2018-04-20
==================

  * Assert.request module
  * Assert.visible now checks every parent node is visible
  * Browser.setViewport
  * Assert.attribute and assert.not.attribute now match any element
  * Assert.href and assert.not.href now match any element
  * Assert.visible message is now different when the element doesn't exist
  * WaitFor message changed when waiting for a function

0.6.0 / 2018-04-13
==================

  * Checked, check and uncheck methods
  * Checked and not checked assertions
  * Browser.requests module
  * Fixed SubqueryXpath Problem
  * Compositer updated to 1.1.0
  * Puppeteer updated to 1.3.0

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
