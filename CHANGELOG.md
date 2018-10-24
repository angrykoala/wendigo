1.6.1 / ####-##-##
==================

  * Position click supported
  * clickAndWaitForNavigation now returns the same result as click
  * clickAndWaitForNavigation now waits until the page and wendgio finished loading

1.6.0 / 2018-10-22
==================

  * Wait for navigation
  * Click and wait for navigation
  * RegExp support for assert.url
  * Browsers now are independent chromium instances
  * Fixed bug where changing settings will disable previous browsers
  * Dependency deep-equal no longer needed

1.5.2 / 2018-10-18
==================

  * Browser timezone option

1.5.1 / 2018-10-15
==================

  * Fixed compositer dependency

1.5.0 / 2018-10-14
==================

  * Browser.loaded
  * Mock redirectTo option
  * Options passed to beforeOpen and afterOpen hooks
  * Mock waitUntilCalled will now wait until the response has been sent

1.4.2 / 2018-10-14
==================

  * AddScript method
  * After Open hook fix
  * Minor improvements to some error messages

1.4.1 / 2018-10-13
==================

  * After Open hook

1.4.0 / 2018-10-09
==================

  * Plugin system for Wendigo browser
  * Mock assert postBody
  * Logs parse js objects correctly in console module
  * Fixed bug regarding multiple browsers on no-sandbox mode
  * Puppeteer updated to 1.9.0
  * Browser.assert.cookie and browser.assert.webworker deprecated in favor of cookies and webworkers
  * Other dependencies updated
  * Minor improvements in mock handling
  * Minor code improvements on browserFactory and Modules

1.3.0 / 2018-10-01
==================

  * WaitForRequest and waitForResponse will resolve if the request was already made
  * WaitForNextRequest and waitForNextResponse added with the past behavior of waitForRequest/Response
  * Mock WaitUntilCalled method

1.2.0 / 2018-09-29
==================

  * Support for index in clickText
  * Now TimeoutError will be thrown on timeouts
  * Changed default viewport res to 1440x9000
  * Browser.frames
  * Puppeteer updated to 1.8
  * Error handling improved

1.1.0 / 2018-09-05
==================

  * Viewport option on browser.open
  * WaitForRequest and waitForResponse methods
  * Assert.visible will pass if any visible element is found
  * NoSandbox option in createBrowser
  * KeyPress count parameter
  * Request.mock without options supported
  * Not.element assertion
  * Potential bug in request mocker fixed
  * Fixed potential bug when filtering by request response
  * Code style changed with more strict rules

1.0.0 / 2018-08-18
==================

  * Browser.openFile method
  * Added extra information to browser.open and browser.close errors
  * Fixed a bug which caused so browsers not to close
  * Some performance and stability improvements

0.9.2 / 2018-08-17
==================

  * Incognito browser option
  * Fixed bug where Wendigo options weren't updated properly
  * Puppeteer updated to 1.7.0
  * Removed async/await from core code to increase compatibility

0.9.1 / 2018-07-04
==================

  * Webworker module and assertions
  * Bug with request mocks remove and override fixed
  * Logo link fixed in readme

0.9.0 / 2018-06-24
==================

  * Updated requests mocks interface
  * Requests mocks now support regex and queryStrings
  * Console module
  * Console assertion
  * Exactly assertion in requests
  * Browser.scroll method
  * DomElement object to interface with Puppeteer's elementhandle

0.8.1 / 2018-06-16
==================

  * Delay option for request mocks
  * Auto option for request mocks
  * Trigger method for request mocks
  * UserAgent option in createBrowser settings

0.8.0 / 2018-06-15
==================

  * ResponseBody request filter and assertion
  * Regex support for expected value of assert.attribute
  * Major refactor in request filter and request assertions

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

  * Browser.assert.cookies
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
