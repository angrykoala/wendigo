# Wendigo

<img src="https://user-images.githubusercontent.com/5960567/54274028-6641ca80-4587-11e9-9e92-f27daa2e3910.png" align="right" width="150px">

_by @angrykoala_  
[![npm](https://img.shields.io/npm/v/wendigo.svg)](https://www.npmjs.com/package/wendigo)
[![Travis (.org)](https://img.shields.io/travis/angrykoala/wendigo/master.svg?label=travis)](https://travis-ci.org/angrykoala/wendigo)
[![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline/angrykoala/wendigo/master.svg?label=gitlab-ci)](https://gitlab.com/angrykoala/wendigo/pipelines)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/angrykoala/wendigo/test?label=github-actions)](https://github.com/angrykoala/wendigo/actions)

> A proper monster for front-end automated testing.

**Wendigo** (_/wɛndɪɡo/_) simplify your front-end and end-to-end automated testing using [Puppeteer](https://github.com/GoogleChrome/puppeteer). Install it with `npm install --save-dev wendigo`.

> **WARNING:** This documentation refers to Wendigo 2, if you are using previous versions of Wendigo, go [here](https://github.com/angrykoala/wendigo/blob/1.13.1/README.md).

Consider the following example using just Puppeteer:

```javascript
await page.click(".my-btn");
await page.waitForSelector("#my-modal")
const modalText = await page.evaluate(() => {
    const modalElement = document.querySelector("#my-modal");
    return modalElement.textContent;
})
assert.strictEqual(modalText, "Button Clicked");
```

The same test can be written like this with Wendigo:

```javascript
await browser.click(".my-btn");
await browser.waitFor("#my-modal");
await browser.assert.text("#my-modal", "Button Clicked");
```

## Features

* Assertion library built-in.
* Cookies, LocalStorage and WebWorkers handling.
* Requests mocker.
* Plugins!
* Full access to Puppeteer methods.
* Easy and flexible query system with support for CSS selectors and XPath.
* Docker and CI friendly.
* Easy to setup, just node required.
* Authorization helpers.

## Contents

* [Getting Started](#getting-started)
  * [Requirements](#requirements)
  * [Installing Wendigo](#installing-wendigo)
  * [Usage](#usage)
* [Api](#api)
  * [Wendigo](#wendigo-class)
  * [Browser](#browser)
  * [Assert](#assert)
  * [Cookies](#cookies)
  * [Console](#console)
  * [LocalStorage](#localstorage)
  * [Requests](#requests)
  * [Auth](#auth)
  * [Webworkers](#webworkers)
  * [Dialog](#dialog)
  * [Errors](#errors)
  * [Selectors](#selectors)
  * [Injected Scripts](#injected-scripts)
  * [DOM Element](#dom-element)
* [Plugins](#plugins)
  * [Writing A Plugin](#writing-a-plugin)
* [Examples](#examples)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [Acknowledgements](#acknowledgements)
* [License](#license)

## Getting Started

### Requirements
To start using Wendigo for testing or browser automation. Make sure you've got [NodeJS](https://nodejs.org/en/) 8.16.0 or higher and npm installed in your system. You can check if they are installed and their versions with the following commands:

```bash
node -v
```

```bash
npm -v
```

### Installing Wendigo
You should install Wendigo in your npm project (usually as a dev dependency):

```bash
npm install --save-dev wendigo
```

### Usage
You can use it with your favorite test suite or standalone in a JavaScript file

```js
const Wendigo = require('wendigo');

async function getMyPageHeader() {
  const browser = await Wendigo.createBrowser();
  await browser.open("http://my-page");
  const text = await browser.text("h1");
  await browser.close();
  return text;
}

getMyPageHeader().then((text)=>{
  console.log(text);
});
```

#### Queries With Wendigo
Most methods in Wendigo will receive a _selector_ parameter to query for DOM elements on which execute actions or get data. Unless specified these queries can be performed by passing a CSS selector (e.g. `div`, `.container`), an xPath selector (`//*[text()='my text']`) or passing a [DOM Element](#dom-element).

For example:

```js
const myElement = await browser.query(".div");

await browser.text(".div"); // My Element Text
await browser.text(myElement); // My Element Text
```

#### Using Wendigo With TypesScript

Wendigo 2.0 and higher contains typings, so importing it in a TyeScript project is enough for types support:

```typescript
import * as Wendigo from 'wendigo';
```

> If you find any problem, please check our [Troubleshooting](#troubleshooting) for solutions, or fill an [issue](https://github.com/angrykoala/wendigo/issues/new) if it appears to be a bug or lacking feature with Wendigo. More information and guides on how to use Wendigo available at the [wiki](https://github.com/angrykoala/wendigo/wiki)

#### Using Puppeteer directly

Wendigo is intended to be used as a full wrapper of Puppeteer, so usually accessing Puppeteer directly is not needed, however, the browser class provide direct access to Puppeteer classes:

* browser.page
* browser.context
* browser.coreBrowser

Check the API for those properties for more info.

## Api

### Wendigo Class
Wendigo is the only class exported by the package. It provides the methods necessary to create browsers and disconnect from chrome, can be imported with `require('wendigo')`:

**createBrowser(settings)**  
Will create and return a promise to a [Browser](#Browser) instance. It will automatically launch and connect Puppeteer and Chrome.

* _settings_: an optional object with the configuration for the browser
  * `log: false`: If true, it will log all the console events of the browser.
  * `logRequests: false`: If true, all requests made by the browser will be logged in the console.
  * `incognito: false`: If true, the browser will open as an incognito browser.
  * `userAgent`: If defined, the default user agent will be overridden.
  * `noSandbox`: Sets the option `--no-sandbox` when opening Puppeteer. This option will also be set if the env variable `NO_SANDBOX` is set (check [troubleshooting](#troubleshooting)).
  * `timezone`: Sets the browser's timezone (e.g. `UTC`, `Asia/Tokyo`).
  * `bypassCSP: true`: If set to false, puppeteer may fail if Content Security Policy is set in the page.
  * `proxyServer: null`: If defined, Chromium will run with the option `--proxy-server` set to the given address.
  * `defaultTimeout: 500`: Sets the default timeout for "wait" methods, except `browser.wait()`.
  * `cache: true`: If true, requests cache will be enabled.
  * Any settings that can be passed to Puppeteer can be passed to createBrowser, for example:
    * `headless: true`: If true, the browser will run on headless mode.
    * `slowMo: 0`: Slows the execution of commands by given number of milliseconds

Examples:

```js
const browser = await Wendigo.createBrowser(); // Using default options
```

```js
const browser = await Wendigo.createBrowser({
    headless: false,
    slowMo: 500
}); // Using options to see what's happening
```

**stop()**  
Will stop and disconnect all the browsers. It should be called after finishing all the tests.

**registerPlugin(name, plugin?, assertions?)**  
Registers a new plugin, for more information, check [Plugins](#plugins). This must be called before `createBrowser` for the plugins to work.

Optionally an object can be passed with the following options:

* `name`
* `plugin`
* `assertions`

**clearPlugins()**  
Removes all plugins from Wendigo. This will affect all newly created browsers.

### Browser
The Browser instance is and interface with the `page` class of Puppeteer.

#### Attributes
**page**  
Puppeteer [page class](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page), allows access to Puppeteer API if needed.

```js
await browser.page.evaluate(() => {
    document.querySelector("h1");
});
```

**loaded**  
True if the page has already opened and loaded.

**incognito**  
True if the browser is configured as incognito page.

**cache**  
If the requests cache is active.

**context**  
Returns Puppeteer's [BrowserContext](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-browsercontext).

**coreBrowser**
Returns Puppeteers's [Browser](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-browsercontext) class for direct requests.

#### Methods
All the methods in Browser return a Promise than can easily be handled by using `async/await`.

**open(url, options?)**  
Opens the given url in the browser.

```js
await browser.open("http://localhost:8000");
```

The following options can be passed:

* `viewport`: Viewport config to set when opening the browser, uses the same syntax as `setViewport`.
* `queryString`: Querystring to be appended to the url, can be a string or object. Avoid using this parameter if a query string is already present in the url.
* `geolocation`: Options to override geoLocation. Same as using `setGeolocation`.
* `headers`: Sets extra HTTP headers _before_ opening the page.Same as using `requests.setHeaders`.
* `dismissAllDialogs`: This will automatically dismiss any native dialog (`alert`, `prompt`) when appearing.

If no protocol is defined (e.g. `https://`), `http://` will be used.

**openFile(path, options?)**  
Opens the given file. Same options as `open` can be passed. The file will be passed by appending `file://` to the absolute path.

```js
await browser.open("static/index.html");
```

**close()**  
Close the browser, it should be called after finishing using the browser instance. Avoid creating a new browser before closing the previous one if possible. Having multiple open browsers will cause performance degradation in your tests.

```js
await browser.close();
```

**evaluate(cb, ...args)**  
Evaluates given callback in the browser, passing n arguments. Returns the Puppeteer's result of the evaluation.

```js
const selector = "h1";
const elementText = await browser.evaluate((s) => {
    return document.querySelector(s).textContent;
}, selector); // My Title
```

This method, unlike `browser.page.evaluate` will automatically parse any argument if possible:

**query(selector, childSelector?)**  
Queries the given selector (CSS, XPath or DomElement) and returns a [DOMElement](#dom-element). If multiple elements match, only the first will be returned. Returns null if no element found.

```js
const element = await browser.query("h1");
```

Optionally, 2 parameters can be passed. A query will be performed only on the nested elements of the first selector:

```js
const element = await browser.query(".div");
const children = await browser.query(element, "p"); // First paragraph under element .div
```

Note that any result that is not an element node will be filtered for XPath requests.

**queryAll(selector, childSelector?)**  
Returns an array with all the [DOMElement](#dom-element) matching the given selector.

```js
const elements = await browser.queryAll("h1");
elements.length; // 2
```

Optionally, queryAll supports 2 parameters. The query will then be performed only on the elements under the first selector.

Note that any result that is not an element node will be filtered for XPath requests.

**elementFromPoint(x, y)**  
Given the coordinates (in pixels) as two numbers, returns the topmost DomElement in that position or `null` if no element is present.

```js
const element = await browser.elementFromPoint(500, 150);
await browser.text(element); // ["My Title"]
```

**selectPage(index)**  
Selects the given page (a.k.a. tab) to be used by Wendigo. Keep in mind that tabs are **never** changed automatically unless explicitly selected or closed with `closePage`.

```js
await browser.click(".btn.new-tab")
await browser.wait(100); // waits for new tab to be loaded
await browser.pages(); // length is 2
await browser.selectPage(1); // goes to newly opened tab
```

> CSP bypass will not be enabled in the newly opened tabs. If you rely on it, it may be necessary to reload the tab after it has been opened with `browser.refresh`

**closePage(index)**  
Closes the page with given index, if the closed page is the current active page, it will change to the new page with index 0 (reloading it in the process). If no more pages exists, the browser will close with `browser.close()` automatically.

**pages()**  
Returns all Puppeteer's [pages](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page), one per tab or popup.

> **Warning:** All pages related methods are still under revision, and its behavior may heavily change in future releases.

**setContent(html)**  
Sets the page content from a string. Can be used instead of `browser.open`.

```js
await browser.setContent("<h1>Title</h1>");
```

**addScript(scriptPath)**  
Executes the given script in the browser context. Useful to set helper methods and functions. This method must be called after the page is already loaded, if another page is loaded, the scripts won't be re-executed. If these scripts are required for a plugin to work, remember to execute this method on the `_afterOpen` hook.

It is heavily recommended to only use this to load helper functions, and not execute anything that might cause side effects. Anything loaded as a script may interfere with the behavior of the page or Wendigo. It is recommended to **always** check if the object of function you are loading already exists before loading, remember that `WendigoUtils`, `WendigoQuery` and `WendigoPathFinder` objects are required for Wendigo to work and overriding them will cause problems.

**class(selector)**  
Returns and array with the classes of the first element found, throws if no element found.

```js
const classes = await browser.class("div.container.main"); // Returns ["container", "main", "another-class"]
```

Using a DOMElement:

```js
const node = await browser.query("div.container.main");
const classes = await browser.class(node); // Returns ["container", "main", "another-class"]
```

**value(selector)**  
Returns the value of the first element with given selector. Throws if no element or value found.

```js
const value = await browser.value("input.my-input");
```

**attribute(selector, attributeName)**  
Return the attribute value of the first element found with given selector. Throws if no element is found. Returns `""` if the attribute is set but no value is given and `null` if the attribute doesn't exists.

```js
const classAttribute = await browser.attribute(".my-element", "class"); // Returns "my-element another-class"

const hiddentAttr = await browser.attribute(".my-hidden-element", "hidden"); // Returns ""
const hiddentAttr2 = await browser.attribute(".not-hidden-element", "hidden"); // Returns null
```

**styles(selector)**  
Returns an object with all the computed css styles of the first element matching the given selector, throws if no element is found.

```js
const styles = await browser.styles("h1.my-title");
styles.color; // 'rgb(255, 0, 0)'
```

**style(selector, style)**  
Returns the value of the given style of the first element matching the given selector. Returns undefined if the style doesn't exists. Throws if no element found.

```js
const style = await browser.style("h1.my-title", color); // 'rgb(255, 0, 0)'
```

**checked(selector)**  
Returns true if the first element matching the given selector (checkbox) is checked. If the value is not a checkbox and doesn't have checked property set, it will return undefined. Throws if no element is found.

**text(selector)**  
Returns an array with the texts of the elements matching the given selector. Returns the same value as element `textContent` property.

```js
const texts = await browser.text("p"); // ["My First Paragraph", "My Second Paragraph"]
```

**innerHtml(selector)**  
Returns an array with the innerHtml strings of all the elements matching the given selector

```js
await browser.innerHtml("p"); // ["my <b>first</b> paragraph"]
```

**elementHtml(selector)**  
Returns an array with the html strings of all the elements matching the given selector

```js
await browser.elementHtml("p"); // ["<p>my <b>first</b> paragraph</p>"]
```

**title()**  
Returns the page title.

**html()**  
Returns the page HTML as string. It will return the HTML as it was before performing any actions.

**pdf(options)**  
Generates a pdf, if options is a string or contains the value `path` a pdf file will be generated on given path. [Buffer](https://nodejs.org/api/buffer.html) will be returned otherwise.

```js
await browser.pdf("my_page.pdf");
const myBuffer = await browser.pdf();
await browser.pdf({ // Using Puppeteer pdf options
    path: 'page.pdf',
    width: "10cm"
})
```

This methods is just a wrapper on Puppeteer's pdf method, the full list of possible options can be found [here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions)

**frames()**  
Returns all the [frames](https://github.com/GoogleChrome/puppeteer/blob/v1.8.0/docs/api.md#class-frame) attached to the page

**url()**  
Returns the current url of the page.

**click(selector, index?)**  
Clicks all the elements with the matching selector, if the index parameter is set, only the nth element will be clicked. Returns the number of elements clicked.

```js
await browser.click("button.btn");
```

An array of DOMElements is also supported as selector.

Optionally, if two numbers are passed, position x, y (in pixels) will be clicked. In this case, null with be returned instead of the clicked elements.

> **Warning:** Elements are clicked sequentially, if one of them is a link to an external page, subsequent clicks will fail.

**clickText(selector?, text, index?)**  
Clicks all the elements matching given text. Returns the number of elements clicked.

```js
await browser.clickText("Click Me!");
```

Optionally a selector can be passed as first argument to only click elements under the given selector. If an index is passed, only the nth element found will be clicked, be aware of the type passed down to index if selector is not passed:

```js
await browser.clickText("Click Me!", 2); // Clicks the second element
await browser.clickText("Click Me!", "2"); // Will search for an element with selector "Click Me!" and text "2"
await browser.clickText(".container", "Click Me!", 2); // Clicks the second element with given text under the element ".container"
```

**clickTextContaining(selector?, text, index?)**  
Same as clickText, but matches with any text containing the given string.

**clickAndWaitForNavigation(selector, timeout=500)**  
Clicks an element and waits until a navigation event is triggered. Recommended for links to different pages. Keep in mind that not all the clicks will trigger a navigation event.

```js
await browser.url(); // my-page/account
await browser.clickAndWaitForNavigation(".home-button");
await browser.url(); // my-page/home
```

> clickAndWaitForNavigation may delay up to 100ms after the given timeout while waiting for the page to load.

**waitAndClick(selector, timeout=500)**  
Waits for an element to exists and be visible before clicking it. Useful for clicking elements that may have a delay before appearing.

> DomElements selectors not supported.

**waitAndTap(selector, timeout=500)**  
Waits for an element to exists and be visible before tapping it.

> DomElements selectors not supported.

**waitAndType(selector, text, timeout=500)**  
Waits for an element to exists and be visible before typing text in it.

> DomElements selectors not supported.

**waitAndCheck(selector, timeout=500)**  
Waits for an element (checkbox) to exists and be visible before checking it.

> DomElements selectors not supported.

**tap(selector, index?)**  
Performs a touchscreen tap action on all the elements matching the given selector, if the index parameter is set, only the nth element will be tapped. Returns the number of elements tapped. The interface is compatible with browser.click.

If two numbers are passed, the given coordinates are clicked.

**check(selector)**  
Checks the first element matching given selector. Setting its checked property to true. Throws if no element is found.

**uncheck(selector)**  
Unchecks the first element matching given selector. Setting its checked property to false. Throws if no element is found

**focus(selector)**  
Focus the first element matching the given selector.

**blur(selector)**  
Unfocus the first element matching the given selector.

**hover(selector)**  
Hovers over the first element matching the given selector.

**dragAndDrop(source, target)**  
Drags the `source` selector and drops it on `target`.

```js
await browser.dragAndDrop("#my-draggable", "#target");
```

> Note that this method emulates expected events of this behavior instead of emulating mouse interaction

**scroll(value, xValue?)**  
Vertically scrolls the page to the given value on pixels, an optional xValue can be passed for horizontal scrolling. If value is a selector or DomElement, the page will scroll until that element is at view.

**screenshot(options?)**  
Takes a screenshot of the page. This is just a direct interface to [Puppeteer's screenshot method](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagescreenshotoptions) and will use the same options, please check Puppeteer docs for the updated usage. It will return the image as a string (base64) or Buffer depending on the encoding. If an option path is defined, the image will be created on given path.

The possible options (from Puppeteer's docs) are:

* `path`: The file path to save the image to. The screenshot type will be inferred from file extension. If path is a relative path, then it is resolved relative to current working directory. If no path is provided, the image won't be saved to the disk.
* `type`: Specify screenshot type, can be either jpeg or png. Defaults to 'png'.
* `fullPage`: When true, takes a screenshot of the full scrollable page. Defaults to false.
* `clip`: An object which specifies clipping region of the page. Should have the fields x, y, width and height
* `omitBackground`: Hides default white background and allows capturing screenshots with transparency. Defaults to false.
* `encoding`: The encoding of the image, can be either base64 or binary. Defaults to binary.

**screenshotOfElement(selector, options?)**  
Takes a screenshot of the first element matching the given selector. Will fail if the element is not found. The supported options are the same as `screenshot`.

```js
const base64Image = await browser.screenshotOfElement("#my-dashboard", {
    encoding: "base64"
})
```

**type(selector, text, options?)**  
Types given text in the first element matching the selector. If a value is already present, writes the new value at the beginning. Throws if no elements is found.

The following options passed as an object are supported:

* _delay_:  If a delay is given, it will delay the given ms for each key press.

```js
await browser.type("input.my-input", "My Input");
```

**keyPress(key, count?)**  
Press a keyboard key, the key can be the name of any key supporter by [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js)

If an array is passed, all the keys will be pressed consecutively. If count parameter is passed, all the keys will be pressed that given count times.

```js
await browser.keyPress("Enter"); // Press Enter once
await browser.keyPress("Escape", 2); // Press Enter twice

await browser.keyPress(["Enter", "Escape", "Enter"]);
```

**uploadFile(selector, path)**  
Sets the value of an input file element matching given selector. Path can be absolute or relative to the current working directory.

```js
await browser.uploadFile("input.my-file-input", "./my/file/path.txt");
```

**select(selector, value)**  
Will select the given value in the _select_ tag of the first element matching the given selector, removing all previous selections. Returns an array with the values that could be selected correctly.

Value can be a string or an array. If the select is multiple all elements in value will be selected, if not only the first element in the select options will.

Will throw if no elements were found.

```js
await browser.select("select.language-select", ["spanish", "english"]); // Returns ["spanish", "english"]
```

If the option doesn't have a value, the text should be provided.

**clearValue(selector)**  
Clears any value that exists in any of the elements matched by the given selector. Setting the value to `""`.

```js
await browser.clearValue("input.my-input");
```

**setAttribute(selector, attributeName, value)**  
Sets the attribute of given name to a string value. If null is passed, the attribute will be removed from the element.

**addClass(selector, className)**  
Adds the given css class to the element.

**removeClass(selector, className)**  
Removes the given css class from the element if exists.

**wait(ms=250)**  
Waits the given milliseconds.

**waitFor(selector, timeout=500, ...args?)**  
Waits for given selector to exists and be visible, with the given timeout in milliseconds.

```js
await browser.waitFor(".popup");
```

If a function is passed instead of a selector, it will wait for that function to resolve in the browser context to true, the optional arguments are passed to the function.

```js
await browser.waitFor((s) => { // Waits for 2 or more elements to be in the page
    const docs = document.querySelectorAll(s);
    return docs.length > 2;
}, 600, ".my-elements");
```

> DomElements selectors not supported.

**waitUntilNotVisible(selector, timeout=500)**  
Waits until the given selector is no longer visible or doesn't exists, with the given timeout in milliseconds.

```js
await browser.waitUntilNotVisible(".toast");
```

**waitForUrl(url, timeout=500)**  
Waits for the page to have the given url. The url can be a string or a RegExp.

```js
await browser.click("a");
await browser.waitForUrl("my-url");
```

**waitForText(text, timeout=500)**  
Waits for the given text to exists.

```js
await browser.waitForText("Click me!");
await browser.clickText("Click me!");
```

**waitForNavigation(timeout=500)**  
Waits until next page is loaded, recommended after following a link to a different page. Keep in mind that a navigation within a SPA won't necessarily trigger a navigation event.

> waitForNavigation may delay up to 100ms after the given timeout while waiting for the page to load

**waitUntilEnabled(selector, timeout=500)**  
Waits until the first element matching the given selector has the attribute `disabled` set to null.

**waitForPageLoad()**  
Waits until a dom ready event is fired, this method will also wait until Wendigo is ready to perform assertions on the given page.

**findByText(selector?, text)**  
Returns an array with the elements with text content matching the given text.  

```js
const elements = await browser.findByText("My First Paragraph");
elements.length; // 1
```

Optionally, a selector can be passed as first argument to perform a text search on children of that element only.

**findByTextContaining(selector?, text)**  
Returns an array with all the elements with a text that contains the given text.

```js
const elements = await browser.findByTextContaining("Paragraph");
elements.length; // 2
```

Optionally, a selector can be passed as first argument to perform a text search on children of that element only.

**findByAttribute(attributeName, attributeValue?)**  
Returns an array with all elements having an attribute matching the given name and value. If no value is assigned, it will match all elements with that attribute, regardless of the value. Use empty string as value to match all the elements with an attribute without value (e.g. `<div hidden>`).

```js
const hiddenElements = await browser.findByAttribute("hidden"); // Returns all the elements with the hidden attribute
const paswordElements = await browser.findByAttribute("name", "password"); // Find all elements with a name attribute and value password
```

**findByLabelText(labelText)**  
Given a label text, returns all the inputs associated to the label through the `for` attribute:

```html
<label class="label1" for="input1">My Label</label>
<input id="input1">
```

```js
const input = await browser.findByLabelText("My Label"); // Returns an array containing iput #input1
```

**findCssPath(element)**  
Will return the CSS path string (e.g. `body > div > button`) of a DomElement.

```js
const elem = await browser.query(".my-element")
const path = await browser.findCssPath(elem); // body > div > p.my-element
```

**findXPath(element)**  
Will return the xPath string (e.g. `/html/body/div/button`) of a DomElement.

**tag(selector)**  
Returns the tag name of the first element matching the given selector, keep in mind that the tag will **always** be returned lowercase. Returns null if no element was found.

```js
await browser.tag(".my-header"); // "h1"
```

**setValue(selector, value)**  
Sets the given value on all the elements matching the given selector. Returns the number of elements changed, throws if no element found.

```js
await browser.setValue("input", "new val"); // Returns 1
await browser.assert.value("input", "new val");
```

This method won't trigger certain events, use `type` and `select` when possible.

**options(selector)**  
Returns the selector options values of the first element matching the given selector. Throws if no element is found. If the element doesn't have options (i.e. is not a selector) an empty array is returned.

```js
const options = await browser.options("selector.my-selector"); // ["value1", "value2"]
```

**selectedOptions(selector)**  
Returns all the selected options of the first element matching the given selector. If no value is set, the text of the option will be returned. Throws if no element is found.

**back()**  
Navigates to previous page in history.

**forward()**  
Navigates to next page in history.

**refresh()**  
Reloads current page.

**setViewport(viewportConfig)**  
Sets the configuration of the page viewport, using the same config as [Puppeteer method](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport).

```js
await browser.setViewport({width: 300});
```

> Unlike Puppeteer setViewport, the current values will be used for the new viewport for any option not set.

**setTimezone(timezone)**  
Sets browser timezone, valid timezones can be found [here](https://cs.chromium.org/chromium/src/third_party/icu/source/data/misc/metaZones.txt?rcl=faee8bc70570192d82d2978a71e2a615788597d1)

**setMedia(mediaOptions)**  
Sets css media options, options can be a string to define a type or an object with the following properties:

* `type`: Defines media type emulation (can be `print` or `string`), passing `null` disables media emulation.
* `features`: Receives an array of objects containing `name` and `value` of the css media feature to override. Supported names are `prefers-colors-scheme` and `prefers-reduced-motion`.

> This method is a wrapper over Puppeteer's [emulateMediaFeatures](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageemulatemediafeaturesfeatures) and [emulateMediaType](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageemulatemediatypetype)

**triggerEvent(selector, eventName, options?)**  
Creates and dispatch a DOM event in the elements matching the given selector. The event dispatched will have the name given, and all the options will be passed down to the native `Event` constructor, with the options `bubbles`, `cancelable` and composed `supported`

```js
await browser.triggerEvent("button", "click"); // Triggers a click event on all buttons. This won't emulate mouse movement like browser.click
await browser.triggerEvent(".listener", "my-custom-event"); // Triggers a custom event to an element that may have a listener atached
```

**mockDate(date, options?)**  
Mocks the browser's Date object so it returns the expected date instead of current date when using `new Date()` without parameters or `Date.now()`. The first parameter must be a JavaScript Date object. The following options are supported:

* `freeze: true`: if set to true, the new Date objects will always return the given date as current date, if false, the expected date will increase normally as time passes.

```js
await browser.mockDate(new Date(2010,10,6)); // Mocks to 6-sept 2010

await browser.evaluate(() => {
    const d = new Date(); // 6-sept 2010
    const d2 = new Date(2011,10,10); // 10-sept 2011
})
```

```js
await browser.mockDate(new Date(2010,10,6), {
    freeze: false
});

await browser.evaluate(() => {
    const d = new Date(); // 6-sept 2010 plus some milliseconds
});

await browser.wait(1000);

await browser.evaluate(() => {
    const d = new Date(); // 6-sept 2010 plus one second and some milliseconds
})
```

> Keep in mind that there may be different timezones between the browser and Node. Using timestamps is recommended.

**clearDateMock()**  
Clears the date mock, if any, returning to the native Date object.

**setCache(enabled)**  
Enables or disables the requests cache. Keep in mind that this method returns a promise that resolves to when the change is effective.

**setGeolocation(option)**  
Overrides browser's location, options can contain `latitude`, `longitude` and `accuracy` as numbers.

**geolocation()**  
Returns the [current location position](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition) as an object. The object contains the following attributes (if available):

* accuracy
* altitude
* altitudeAccuracy
* heading
* latitude
* longitude
* speed

```js
const location = await browser.geolocation();
location.latitude; // 60
location.longitude; //-20
```

> To access geolocation, you may need to first override the `geolocation` permission.

**overridePermissions(url, permissions)**  
Grants given permissions to given web. Permissions can be a string or array of strings with the options listed [here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#browsercontextoverridepermissionsorigin-permissions).

```js
await browser.overridePermissions("http://myweb.comm", ["geolocation", "accelerometer"]);
```

### Assert
`browser.assert` provide some out-of-the-box assertions to easily write tests that are readable without having to specifically perform evaluations. All the assertions have a last optional parameter to define a custom assertion message. All assertions will return a Promise that will fail if the assertion fails. Unless specified, any selector will support css, xPath and DOMElements.

**assert.exists(selector, msg?)**  
Asserts that at least one element with given selector exists.

```js
await browser.assert.exists("h1.main-title");
```

**assert.visible(selector, msg?)**  
Asserts that the at least one element matching the selector is visible.

An element will considered visible if:

* Exists.
* The computed style doesn't contain display: none or visibility: hidden.
* Opacity is not 0.
* All the parents are visible.

**assert.tag(selector, expected, msg?)**  
Asserts that at least one element matching the given selector has the given tag name.

```js
await browser.assert.tag("my-header", "h1");
```

**assert.text(selector, expected, msg?)**  
Asserts that at least one element matching the given selector has the expected string or regex.
If expected is an array, all texts in it should match. It matches against the value of element `textContent` property.

```js
await browser.assert.text("p", "My First Paragraph");
```

**assert.textContains(selector, expected, msg?)**  
Asserts that at least one element matching the given selector contains the expected text. Expected text can be an array of strings, in this case **all** expected texts should match at least one element.

```js
await browser.assert.textContains("p", "My First");
```

**assert.title(expected, msg?)**  
Asserts that the page title matches the expected string or regex.

**assert.class(selector, expected, msg?)**  
Asserts that the first element matching the selector contains the expected class.

```js
await browser.assert.class("div.container.main-div", "container");
```

**assert.url(expected, msg?)**  
Asserts that the current url matches the given string or RegExp.

**assert.value(selector, expected, msg?)**  
Asserts that the first element matching the selector has the expected value.

```js
await browser.type("input.my-input", "Dont Panic");
await browser.assert.value("input.my-input", "Dont Panic");
```

**assert.element(selector, msg?)**  
Asserts that exactly one element matches given selector. Same as `elements(selector, 1)`.

**assert.elements(selector, count, msg?)**  
Asserts the number of element that matches given selector.

The count parameter can be a number of the exact number of elements expected or an object with the following properties:

* _atLeast_: Expects at least the given number of elements.
* _atMost_: Expects up to the given number of elements.
* _equal_: Expects the exact number of elements.

```html
<p>Paragraph 1</p>
<p class="second">Paragraph 2</p>
```

```js
await browser.assert.elements("p", 2); // Ok
await browser.assert.elements("p", {equal: 2}); // Ok
await browser.assert.elements("p", {atLeast: 1, atMost:3}); // Ok
await browser.assert.elements("p.first", 0); //Ok

await browser.assert.elements("p.second", 2); // Fails
await browser.assert.elements("p.second", {atLeast: 1}); // Ok
```

**assert.attribute(selector, attribute, expected?, msg?)**  
Asserts that at least one element element matching the given selector contains an attribute matching the expected value. If no expected value is given, any not null value for the attribute will pass. The expected value can be a string or regex.

```js
await browser.assert.attribute(".hidden-class", "class", "hidden-class");
await browser.assert.attribute(".hidden-class", "hidden");
```

To pass a custom message without specifying an expected value, you can pass `undefined`:

```js
await browser.assert.attribute(".hidden-class", "hidden", undefined, "hidden-class doesn't have attribute hidden");
```

You can check an attribute doesn't exists passing `null` as expected argument or using `assert.not.attribute`.

If the element doesn't exists, the assertion will fail.

**assert.style(selector, style, expected, msg?)**  
Asserts that the first element matching the given selector has an style with the expected value. The assertion will throw an error if no element is found.

```js
await browser.assert.style("h1", "color", "rgb(0, 0, 0)");
```

**assert.href(selector, expected, msg?)**  
Asserts that the any matching the given selector contains an attribute href with expected value.

```js
browser.assert.href("a", "foo.html");
browser.assert.href("link", "styles.css");
```

> Same as `browser.assert.attribute(selector, "href", expected, msg?)`

**assert.innerHtml(selector, expected, msg?)**  
Asserts that at least one element matching the given selector has the expected innerHtml.
The expected html can be either a _string_ or a _Regex_ value.

The assertion will throw if no element is found.

```js
await browser.assert.innerHtml("p", "my <b>first</b> paragraph");
```

**assert.elementHtml(selector, expected, msg?)**  
Asserts that at least one element matching the given selector has the expected html.
The expected html can be either a _string_ or a _Regex_ value.

The assertion will throw if no element is found.

```js
await browser.assert.elementHtml("p", "<p>my <b>first</b> paragraph</p>");
```

**assert.options(selector, expected, msg?)**  
Assets that the first element with given selector has the expected options value. Expected can be a string, if only one option is given, or an array if multiple options are given. All expected options must match in the same order.

```js
await browser.assert.options("select.my-select", ["value1", "value2"]);
```

**assert.selectedOptions(selector, expected, msg?)**  
Assert that the first element with given selector has the expected options selected. Expected can be a string, if only one option is given or an array. All the selected options must match the expected options in the same order.

**assert.global(key, value?, msg?)**  
Asserts that the global object (window) has the given key with the expected value. If not value (or undefined value) is provided, it will assert that the key exists with a not undefined value.

```js
browser.assert.global("localStorage");
browser.assert.global("my-val", "dontpanic");
```

**assert.checked(selector, msg?)**  
Asserts that the first element matching the given selector has a checked value set to true.

**assert.disabled(selector, msg?)**  
Asserts that the first element matching the given selector is disabled (has attribute disabled).

**assert.enabled(selector, msg?)**  
Asserts that the first element matching the given selector is enabled (doesn't have attribute disabled).

**assert.focus(selector, msg?)**  
Asserts that an element matching the given selector is focused.

```js
browser.click(".btn");
browser.assert.focus(".btn");
```

**assert.redirect(msg?)**  
Asserts that the opened url is a redirection.

#### Negative assertions
Most of assertions have a negative counterpart that can be used with `browser.assert.not`. Most of the "not" assertions are simply the inverse of the positive version.

**assert.not.exists(selector, msg?)**  
Asserts that no element matching given selector exists.

```js
await browser.not.exists("h1.foo.bar");
```

**assert.not.visible(selector, msg?)**  
Asserts that no elements with given selector is visible. If no element matches, it will be considered as not visible as well and will pass.

**assert.not.tag(selector, expected, msg?)**  
Asserts that no element matching the given selector has the given tag name.

```js
await browser.assert.not.tag("my-main-header", "h4");
```

**assert.not.text(selector, expected, msg?)**  
Asserts that no element matching the given selector matches the expected text.
If expected is an array, no text in it should match any element with given selector

```js
await browser.assert.not.text("p", "This text doesn't exists");
await browser.assert.not.text("p", ["This text doesn't exists", "neither do this"]);
```

**assert.not.textContains(selector, expected, msg?)**  
Asserts that no elements matching the given selector contain the expected text. If expected is an array, no text in it should be contained any element with given selector.

```js
await browser.assert.not.textContains("p", "doesn't exist");
```

**assert.not.title(expected, msg?)**  
Asserts that the title of the page is not the given string.

**assert.not.class(selector, expected, msg?)**  
Asserts that the first element matching the selector doesn't contain the expected class. It will throw if no element is found.

**assert.not.url(expected, msgs)**  
Asserts that the url of the page doesn't match the expected string.

**assert.not.value(selector, expected, msg?)**  
Asserts that the first element with the given selector doesn't have the expected value.

**assert.not.element(selector, msg?)**  
Asserts that the number of elements matching the given selector is 0.

**assert.not.attribute(selector, attribute, expected?, msg?)**  
Asserts that no element matching the given selector doesn't contain an attribute with the expected value. If no expected value is given, any not null value on the attribute will fail.

```js
await browser.assert.not.attribute(".not-hidden-class", "class", "hidden-class");
await browser.assert.not.attribute(".not-hidden-class", "hidden");
```

To pass a custom message without specifying an expected value, you can pass undefined:

```js
await browser.assert.not.attribute(".hidden-class", "href", undefined, "hidden-class has attribute href");
```

The assertion will throw if no element is found.

> Keep in mind that passing null as expected value will assert that the attribute exists and it is not recommended.

**assert.not.style(selector, style, expected, msg?)**  
Asserts the first element matching the selector doesn't has a style with given value.

**assert.not.href(selector, expected, msg?)**  
Asserts that no element matching the given selector doesn't contain an attribute href with the expected value.

> Same as `browser.assert.not.attribute(selector, "href", expected, msg?)`

**assert.not.innerHtml(selector, expected, msg?)**  
Asserts that at no element matching the given selector has the expected innerHtml.
The expected HTML can be either a _string_ or a _Regex_ value.

The assertion will throw if no element is found.

```js
await browser.assert.not.innerHtml("p", "not <b>a</b> paragraph");
```

**assert.not.elementHtml(selector, expected, msg?)**  
Asserts that at no element matching the given selector has the expected html.
The expected HTML can be either a _string_ or a _Regex_ value.

The assertion will throw if no element is found.

```js
await browser.assert.not.elementHtml("p", "<div>not <b>a</b> paragraph</div>");
```

**assert.not.selectedOptions(selector, expected, msg?)**  
Assert that the first element with given selector doesn't have the expected options selected. Expected can be a string, if only one option is given or an array. The assertion will only fail if all the expected options match the selected options in the same order.

**assert.not.global(key, value?, msg?)**  
Asserts that the global object (window) doesn't have the given key with the expected value. If not value (or undefined value) is provided, it will assert that the key doesn't exist or it is undefined.

**assert.not.checked(selector, msg?)**  
Asserts that the first element matching the given selector has a checked value set to false.

Note that if the element doesn't have a checked value (i.e. is not a checkbox) this assertion will throw.

**assert.not.disabled(selector, msg?)**  
Asserts that the first element matching the given selector is not disabled (same as assert.enabled).

**assert.not.enabled(selector, msg?)**  
Asserts that the first element matching the given selector is not enabled (same as assert.disabled).

**assert.not.focus(selector, msg?)**  
Asserts that none of the elements matching the given selector is focused.

**assert.not.redirect(msg?)**  
Asserts that the current opened page is not a redirection.

### Cookies
The module `browser.cookies` provides a way to easily handle cookies through Puppeteer's API. All methods return Promises.

Most methods in the cookies module accept or return a [Puppeteer's Cookie object](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagecookiesurls).

**cookies.all()**  
Returns all the cookies in the current page as an object with key being the name and value a string with the cookie value.

```js
const cookies = await browser.cookies.all(); // {username: "arthur_dent", email: "arthur@dent.com"}
```

**cookies.get(name, url?)**  
Returns the cookie object with given name. Returns undefined if the cookie doesn't exists. Cookies from current page will be returned by default.

```js
const cookie = await browser.cookies.get("username");
cookie.name; // "username"
cookie.value; // "arthur_dent"
```

If parameter url is set, cookies from the given url domain will be returned.

**cookies.set(name, value)**  
Sets the value of the cookie with given name. If it already exists it will be replaced. The value can be a string (it will only set the cookie value) or a [cookie object](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagecookiesurls).

```js
await browser.cookies.set("username", "marvin");

await browser.cookies.set("another-cookie", {
    value: "foo",
    secure: false
})
```

The possible parameters of the object are:

* _name_ (required)
* _value_ (required)
* _url_
* _domain_
* _path_
* _expires_ Unix time in seconds.
* _httpOnly_
* _secure_
* _sameSite_ Can be Strict or Lax.

**cookies.delete(name)**  
Deletes the cookie with given name if exists. Optionally an array can be passed and all the cookies will be removed. Won't do anything if the cookie doesn't exists.

```js
await browser.cookies.delete("username");
await browser.cookies.delete(["username", "email"]);
```

Optionally, an object with same interface as [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagedeletecookiecookies) can be passed to delete cookies from different pages. This object can provide the following arguments:

* _name_ (required)
* _domain_
* _path_
* _url_

**cookies.clear()**  
Deletes all the cookies of the current page.

```js
await browser.cookies.clear()
```

#### Cookies Assertions
It is possible to assert the existence or not of a cookie in the current url with the following assertions:

**assert.cookies(name, expected?, msg?)**  
Asserts that the cookie with the given name exists. If the expected parameter is passed, it will check that the cookie has that value.

```js
browser.assert.cookies("username");
browser.assert.cookies("username", "arthur_dent");
```

**assert.not.cookies(name, expected?, msg?)**  
Asserts that the cookie with given name doesn't have the expected value. If no expected value is passed, it will check that the cookie doesn't exists (is undefined).

```js
browser.assert.not.cookies("not-a-cookie");
browser.assert.not.cookies("username", "not-user");
```

### Console
`browser.console` provides a list of all logs generated by the current page (a.k.a `console.*` methods). The logs are returned as an instance of [Log](#log). Note that none of these methods requires the use of async/await.

**console.all()**  
Returns an array with all the logs generated by the page.

```js
const logs = browser.console.all();
logs[0].text; // "Hello World!"
```

**console.clear()**  
Clear all the current logs. Note that logs are cleared when `browser.close()` is called, but not when a new page is opened.

**console.filter(options)**  
Returns an array with all the logs matching the given parameters, options can be:

* `type`: The log type (`log`, `info`, `error`), it must be a string matching [Puppeteer's Console Types](https://pptr.dev/#?product=Puppeteer&version=v1.5.0&show=api-consolemessagetype), some of the most common types are accessible through `browser.console.LogTypes`.
* `text` a string or regex matching the log output

If no options are passed, all the logs will be returned, the options can be used together.

```js
const errorLogs = browser.console.filter({type:browser.console.LogTypes.Error});
errorLogs[0].text; // "Oh No! An Error"
```

```js
const logs = browser.console.filter({text: /Hello/});
logs[0].text; // "Hello World!"
```

#### Console Assertions
The following assertions can be used to check the existence of a console log.

**assert.console(options, count?, msg?)**  
Assets that at least one console event with given options exists, if count is set, asserts that the exact number of events exists. The options can be:

* `text`: Asserts for the console event to have a text matching the given string or regex
* `type`: Asserts that the event is of the given type (log, info, error,...)

```js
await browser.assert.console({
    text: "Hello World!",
    type: browser.console.LogType.log
});
```

> Objects logged will be converted to string using JSON.stringify, if the object fails to be stringified (circular structure) `[object Object]` will be returned

#### Log
The class Log provides an abstraction over Puppeteer's [ConsoleMessage class](https://pptr.dev/#?product=Puppeteer&version=v1.5.0&show=api-class-consolemessage). Log has the following attributes:

* _text_: The Log text, if multiple parameters were passed to console method, these will be concatenated with spaces.
* _type_: The Log type (string).
* _message_: The native Puppeteer Log instance.

##### LogTypes
All the log types are strings, but some of the most common types are accessible in `browser.console.LogTypes`. For more possible types, check [Puppeteer Docs](https://pptr.dev/#?product=Puppeteer&version=v1.5.0&show=api-consolemessagetype):

* _log_
* _debug_
* _info_
* _error_
* _warning_
* _trace_

> Keep in mind that this list **does not** contain all possible log types.

### LocalStorage
The module `browser.localStorage` provides a wrapper around the browser localStorage. All the methods return Promises.

**localStorage.getItem(key)**  
Returns the item with the given key. Returns null if no element exists.

```js
const value = await browser.localStorage.getItem("my-key"); // returns my-value
```

**localStorage.setItem(key, value)**  
Sets a localStorage entry.

```js
await browser.localStorage.setItem("my-key", "my-value");
```

**localStorage.removeItem(key)**  
Removes the item with given key.

**localStorage.clear()**  
Removes all the items on the store.

**localStorage.length()**  
Returns the number of items in the store.

```js
const itemsLength = await browser.localStorage.length(); // 3
```

**localStorage.all()**  
Returns all the items in localStorage as an object.

#### LocalStorage Assertions
Assertions related local storage can be accessed through `browser.assert.localStorage`.

**assert.localStorage.exist(key, msg?)**  
Asserts that the item with given key exists in the localStorage (i.e. not null).

```js
browser.assert.localStorage.exist("my-key");
```

Alternatively, if an array is passed as key, all the elements will be checked.

**assert.localStorage.value(key, expected, msg?)**  
Asserts that the item with given key has the expected value.

```js
browser.assert.localStorage.value("arthur", "dontpanic");
```

Alternatively, an object can be passed instead of key/expected with the elements that should be checked:

```js
browser.assert.localStorage.value({arthur: "dontpanic", marvin:"the paranoid"});
```

**assert.localStorage.length(expected, msg?)**  
Asserts that the localStorage has the expected length.

**assert.localStorage.empty(msg?)**  
Asserts that the localStorage is empty (i.e. length>0).

> All these assertions have the negative `browser.assert.localStorage.not`.

### Requests
The Requests module allows to get, filter and mock the requests made by the browser since the page was opened.

> Returned requests objects are [Puppeteer's Requests](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-request)

**requests.filter**  
Returns a filter over the requests. Check [Filtering Requests](#filtering-requests) for examples.

**requests.all()**  
Returns all requests, ordered by when it was dispatched.

```js
await browser.requests.all();
```

**requests.mock(url, options)**  
Mocks all the requests to an url, sending a fake response instead. If a method (`GET`, `POST`...) is specified, only requests to given method will be mocked. The url can be a full url string (`http://...`) or a regex. If multiple mocks match a requests, the more specific will be used.

The following options are supported:

* `status` Response status code, defaults to 200.
* `headers` Optional response headers.
* `contentType` If set, equals to setting Content-Type response header.
* `body` Optional response body. It can be a string or a json-serializable object.
* `delay` Optional delay to wait for the response to be fullfilled, in ms.
* `auto` if set to false, the request won't be fullfilled automatically and a manual trigger must be defined,default to true.
* `continue` if set to true, the request will be continue to the server and the real response will be returned.
* `method` defines the method (`GET`, `POST`, ...) to mock. Empty to mock any method.
* `queryString`: If set, only requests with the exact query string will be mocked, accepts string or object.
  * By default, all requests with the given url, regardless of the query string will be mocked, unless a querystring is set in the url or in the options.
* `redirectTo`: If set, the mock will return the response of the given url instead of the original call, maintaining the query string, keep in mind that the redirected request won't trigger any mocks. E.g. `requests.mock("http://localhost:8010", {redirectTo: "http://localhost:9010"})` will change the port where all request in the page are sent.

> This object properties will be used with the interface of Puppeteer's [respond method](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestrespondresponse)

```js
// All requests made to /api will return 200 with the given body
browser.requests.mock("http://localhost:8000/api", {
    body: `{result: "ok"}`
});
```

Mock will return a RequestMock object, with the following read-only properties:

* `called`: If the mock has been called.
* `timesCalled`: The times the mock has been called.
* `response` : The response the mock is returning (read only).
* `url`: Mocked url.
* `immediate`: If the mock will return immediately (delay=0).
* `auto`: If the request will be completed automatically.
* `method`: Mock expected method.
* `querystring`: Mock expected querystring, parsed as an object.

And the following methods:

* `waitUntilCalled(timeout=500)`: Waits until the mock is called. It will also add a slight delay to give the browser time to process the response.

```js
const mock = browser.requests.mock("http://localhost:8000/api", {
    body: {result: "ok"}
});
mock.called; // false
mock.timesCalled; // 0
callApi(); //  { result: "ok" }
mock.called; // true
mock.timesCalled; // true
```

The mock will also provide an assertion interface in `mock.assert` with the following assertions:

* `called(times?, msg?)`: asserts that the mock has been called the given number of times, if times parameter is not given, the assertion will throw if no calls were made.
* `postBody(expected, msg?)`: asserts that the mock has been called with the given body in the request, expected can be an string, object, or RegExp.

```js
const mock = browser.requests.mock("http://localhost:8000/api", {
    body: {result: "ok"}
});
await mock.assert.called(0);
callApi("my request"); // POST requests with given body
await mock.assert.called(0);
await mock.assert.postBody("my request");
```

All mocks are removed on `browser.close`.

If the mock is not auto, it can be manually triggered with the method `trigger()`, this method cannot be called with auto mocks:

```js

const mock = browser.requests.mock("http://localhost:8000/api", {
    body: {result: "ok"},
    auto: false
});
callApi();
mock.trigger();
```

Trigger supports an optional response that will be used instead of the mock default response. It uses the same syntax (body, status, ...).

**requests.removeMock(url, options?)**  
Removes the mock with the given url. If the original mock has a method or queryString, these must be provided in options.

**requests.clearRequests()**  
Clears the list of requests.

**requests.clearMocks()**  
Remove all the request mocks.

**requests.getAllMocks()**  
Returns an array with all the current request mocks set in the browser.

**requests.waitForRequest(url, timeout=500)**  
Waits until a request with given url is done. This will resolve immediately if the requests was already made, to wait without taking in account past requests use `waitForNextRequest`. Url can be a string or regexp.

```js
await browser.requests.waitForRequest("my-url");
```

**requests.waitForResponse(url, timeout=500)**  
Waits until a response to the given url is done. This will resolve immediately if the response was already received, to wait without taking in account past requests use `waitForNextResponse`. Url can be a string or regexp.

**requests.waitForNextRequest(url ,timeout=500)**  
Waits until next request with given url is done. If the request was already made, this method will wait until next one. Url can be a string or regexp.

**requests.waitForNextResponse(url ,timeout=500)**  
Waits until next response with given url is received. If the response was already received, this method will wait until next one. Url can be a string or regexp.

**requests.setHeaders(headers)**  
Sends the given headers on every HTTP requests (on top of default headers).

```js
await browser.requests.setHeaders({
    custom: "dontpanic"
});
await browser.open("my-url");
```

> Note that `authorization` header should be set with `auth` module where possible.

#### Filtering Requests
To filter the requests made by the browser, you can use `browser.requests.filter`.

For example, to filter requests with status code of 200:

```js
const filteredRequests = await browser.requests.filter.status(200).requests;
```

The available filters are:

**requests.filter.url(value)**  
Filters by the given url. The url can be a string or a regex.

```js
await browser.requests.filter.url("http://localhost:8002/api").requests;
```

**requests.filter.method(value)**  
Filters by request method (`GET`, `POST`,...)

**requests.filter.status(value)**  
Filters by response status (`200`, `400`)

**requests.filter.fromCache(value=true)**  
Filters whether the response comes from the browser cache or not.

**requests.filter.responseHeaders(headers)**  
Filters requests where the response has all the given headers with the given values. The expected value can be a string or regex.

```js
await browser.requests.filter.responseHeaders({
    'content-type': /html/,
})
```

**requests.filter.ok(isOk=true)**  
Filters request which response are considered successfull (status is between 200 and 299).

Filters can be joined to perform a filter of several fields.

```js
//Filters all the POST requests made to any url with api that are not cached and returned a success code
await browser.filter.url(/api/).method("POST").ok().fromCache(false).requests;
```

**requests.filter.postBody(expected)**  
Filter requests by post body, the body can be a String, Object or regex.

```js
// Filters all DELETE requests made to with json body
await browser.filter.url(/api/).method("DELETE").postBody({id: 5}).requests;
```

**requests.filter.resourceType(resource)**  
Filter requests by given resource type (`xhr`, `fetch`, ...). Possible resource types are defined [here](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestresourcetype).

**requests.filter.resourceType(contentType)**  
Filter responses by content type header (`text/css; charset=UTF-8`, ...). Accepts both string or RegExp.

**requests.filter.pending()**  
Filter requests by pending (response not retrieved).

**requests.filter.responseBody(expected)**  
Filters requests by response body, the body can be a String, Object or regex.

```js
const byResponseFilter = await browser.requests.filter.url(/api/).responseBody({response: 'OK'}).requests;
```

> Keep in mind that some filters like status require the requests to be finished. Use `await browser.waitForResponse()` before filtering to make sure the requests was completed.

#### Requests Assertions
Assertions related requests can be accessed through `browser.assert.requests`.

Like filters, request assertion don't need `await` and can be concatenated. All the assertions will check that at least one request with the given constraints was made.

**assert.requests.url(expected, msg?)**  
Asserts that at least one request is made to the given url. The url can be a string or regex.

```js
await browser.assert.requests.url(/api/);
```

**assert.requests.method(expected, msg?)**  
Asserts that at least one request was made with the given method (`GET`, `POST`, ...).

```js
await browser.assert.requests.method("GET");
```

**assert.requests.status(expected, msg?)**  
Asserts that a response was received with the given status.

```js
await browser.assert.requests.status(200);
```

> Note that this method requires the request to be finished.

**assert.requests.responseHeaders(expected, msg?)**  
Asserts that a response was received with the given headers. The expected variable is an object with one or more key values representing the expected headers. The value can be either a string or regex.

```js
await browser.assert.requests.responseHeaders({
    'content-type': /html/,
})
```

**assert.requests.ok(expected=true, msg?)**  
Asserts that an successful response was received (status is between 200 and 299), or false if false is given.

**assert.requests.postBody(expected, msg?)**  
Asserts that a request contains the given post body (regardless of method). The expected value can be a string, regex or object.

```js
await browser.assert.requests.postBody({status: "OK"});
```

**assert.requests.responseBody(expected, msg?)**  
Asserts that a request response contains the given body. The expected value can be a string, regex or object.

```js
await browser.assert.requests.responseBody({response: "OK"});
```

**assert.requests.pending(msg?)**  
Asserts that at least one request is still pending (no response received).

**assert.requests.resourceType(resourceType, msg?)**  
Asserts that at least one request has the given resource type (`fetch`, `xhr`, ...).

**assert.requests.contentType(expected, msg?)**  
Asserts that at least one response has given content type header (`text/css; charset=UTF-8`, ...). Accepts both string or RegExp.

**assert.requests.exactly(expected, msg?)**  
Asserts that the exact given number of requests match the assertions. Expected can be any positive number or 0.

```js
await browser.assert.requests.url("localhost:800/api"); // asserts that at least one request is made to given url
await browser.assert.requests.url("localhost:800/api").exactly(2); // asserts that 2 requests are made to given url
await browser.assert.requests.url("localhost:800/api").exactly(0); // asserts that no requests are made to given url
```

Concatenating multiple assertions is possible:

```js
// Asserts that a POST method was done to the api endpoint
await browser.assert.requests.method("POST").url("localhost:8000/api");
```

> Negative assertions are not supported for requests

### Auth
The auth module provides some utilities to simplify the process of some standard authorization methods in webpages by setting up an extra Http header `Authorization` on every request. The following methods will setup said header accordingly to the auth method.

**auth.http(credentials?)**  
It will setup a [basic http authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) with the credentials given (`user` and `password`). If no credentials given, it will remove the current auth value.

```js
await browser.auth.http({
    user: "arthur-dent",
    password: "dontpanic42"
})
```

**auth.bearer(token?)**  
Sets the `Bearer` token used in [JWT](https://jwt.io/) and OAuth2 among others.

**auth.clear()**  
Will clear any authorization token currently active, including those not set up by the auth module.

### Webworkers
The webworkers module allows to retrieve all the webworkers in the current page:

**webworkers.all()**  
Returns all the webworkers currently executing in the page. Each webworker will have the following properties:

* _url_: Returns the webworker file url
* _worker_: Returns the [Puppeteer's Worker instance](https://pptr.dev/#?product=Puppeteer&version=v1.5.0&show=api-class-worker)

> Note that this method does not require await

```js
const webworkersList = browser.webworkers.all();
webworkersList.length; // 3
```

#### Webworkers Assertions

**assert.webworker(options, msg?)**  
Assert that at least one webworker is running, the following options can be passes:

* `url`: Matches only the webworkers with given url
* `count`: Matches exactly the given number of webworkers running.

```js
await browser.assert.webworkers({url: "foo.js"}); // At least one webworker with given url running
await browser.assert.webworkers(); // at least one webworker running
await browser.assert.webworkers({count: 0}); // No webworkers running
```

### Dialog
The dialog module allows handling of native dialog such as those created by `alert` and `prompt`:

**dialog.all()**  
Returns the full ordered list of all dialogs triggered since the page was opened.

**dialog.clear()**  
Clears the list of dialogs, it will invalid `dismissLast` and may cause `waitForDialog` to misbehave.

**dialog.waitForDialog(timeout=500)**  
Waits until the next dialog is triggered. Returns a promise with the dialog object. If the dialog was already triggered, it will resolve the promise immediately.

```js
browser.dialog.all().length; // 0
const p = browser.click(".dialog-trigger"); // Note that await is not used yet
const dialog = await browser.dialog.waitForDialog();
dialog.text; // "My Dialog Message"
await dialog.dismiss();
await p; // After the dialog is dissmissed, we can safely await until click event is completed
browser.dialog.all().length; // 1
```

> Keep in mind that until the dialog is dismissed or confirmed, events such as click will be blocked, so await shouldn't be used on events that may trigger an alert unless `dismissAllDialogs` option is set to true.

**dialog.dismissLast()**  
Dismiss the last dialog triggered (if any) and if it is still active. This can safely be used whether a dialog appeared or not or it has already been dismissed. Problems may happen if the alert is dismissed manually (for example, by using the not-headless mode).

### Dialog Objects
Dialog objects are returned by the `all` and `waitForDialog` methods. These provide a wrapper around [Puppeteer's dialog](https://pptr.dev/#?product=Puppeteer&show=api-class-dialog) with the following attributes:

* _text_: The dialog message
* _type_: The dialog type (`alert`, `beforeunload`, `confirm`, `promp`). Same as those provided by Puppeteer.
* _handled_: Whether the dialog has already been handled or not.

**dismiss()**  
Dismisses the dialog, if the dialog is a prompt, `null` will be returned.

**accept(text)**  
Accepts the dialog, if the dialog is a prompt, text will be returned. If not, it will behave just like dismiss.

> Remember that the option `dismissAllDialogs` on browser.open will automatically dismiss any dialog.

### Errors
Wendigo errors can be accessed through `Wendigo.Errors`. These are errors that will be thrown by Wendigo browser:

**AssertionError**  
Extends from Node.js Assertion Error. It will be throw for any assertion.

**QueryError**  
Error defining a problem with a DOM query. Generally Thrown as an unexpected result of a query made in an action or assertion.

**TimeoutError**
Timeout error, it will be thrown in waitFor methods. Keep in mind that this error is **not** the same as [Puppeteer's TimeoutError](https://pptr.dev/#?product=Puppeteer&show=api-class-timeouterror).

**FatalError**  
Defines a Fatal Error with Puppeteer (e.g. a connection error).

**InjectScriptError**
Defines an error injecting scripts on the page. This may be caused on open if the option `bypassCSP` is set to false. This error extends from FatalError.

### Selectors
Most Wendigo methods and assertions will require a selector to localize one or more elements in the DOM, unless specified, any method will accept 3 different kinds of selectors:

* **css**: Such as `#my-id` or `.container`, any selector supported by the standard `document.querySelector`.
* **xpath**: The standard [XML Path Language](https://en.wikipedia.org/wiki/XPath) allowing more complex queries.
* **DomElement**: The result of `browser.query` can be directly used as a selector. Check [DOM Element](#dom-element).

### Injected Scripts
For Wendigo to work properly, it must inject some scripts into the web page within the browser's context at runtime. Usually these scripts will only be used by Wendigo, but you can still access them when using `evaluate` in your code or when writing a plugin. The following objects are declared as global variables:

#### WendigoUtils
Wendigo Utils contain several methods and utilities for wendigo, it can be accessed in the browser's context (in an `evaluate` callback) through the global variable `WendigoUtils` or `window.WendigoUtils`. The following methods are exposed:

* **isVisible(element)**: Returns true if an element is visible.
* **queryElement(selector)**: Returns the first element matching the given selector. The selector can be css, xpath or an element.
* **queryAll(selector)**: Returns all the elements matching the given selector (css, xpath or dom element).
* **xPathQuery(xPath)**: Returns all the elements matching the given xPath selector.
* **getStyles(element)**: Returns all the styles of the given element.
* **mockDate(timestamp, freeze)**: Mocks the browsers date and time. Used by `browser.mockDate`.
* **clearDateMock()**: Clears the Datetime mock (if any). User by `browser.clearDateMock`.
* **findCssPath(node)**: Returns the full CSS path of a DOM node as a string.
* **findXPath(node)**: Returns the full XPath of a DOM node as a string.

#### WendigoQuery
The variable `WendigoQuery` or `window.WendigoQuery` exposes several utilities regarding Wendigo querying system, these shouldn't be used by user's code or plugins as `WendigoUtils` already exposes the methods to perform these queries.

#### WendigoPathFinder
Exposes utilities to find the full CSS path or XPath of an element. This should not be directly accessed as the methods `findCssPath` and `findXPath` in WendigoUtils provide the interface to access these utilities.

### DOM Element
Any query that returns a DOM node will return an instance of DOMElement. This class provides an abstraction over Puppeteer's [ElementHandle](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-elementhandle) and can be used as a selector for other methods and assertions. A DOMElement contains the following attributes:

* **element**: Puppeteer's ElementHandle object.
* **name**: Name to be used when displaying errors.

A DOMElement also provides the following methods:

* **query(selector)**: Performs a css query within the children of the element. Returns the first element matching the selector.
* **queryXPath(selector)**: Performs an XPath query within the children of the element.
* **queryAll(selector)**: Similar to query, returns all the elements matching the given css selector.
* **getAttribute(attributeKey)**: Returns the value of the attribute with given name or null if not defined.
* **click()**: Clicks the given element.
* **tap()**: Taps the given element.
* **toString()**: Returns a readable string of the DOMElement, used for displaying errors.
* **focus()**: Focus the element.
* **hover()**: Hovers the mouse over the element.
* **type(text, options?)**: Types the given text on the element (input element). A _delay_ between keystrokes can be set in the options parameters

## Plugins
Wendigo supports plugins to extends its capabilities with custom features and assertions. These plugins can be added with `registerPlugin`.

* [**wendigo-vue-plugin**](https://github.com/angrykoala/wendigo-vue-plugin)  
This plugin support several methods and assertions to use along with pages using [Vue](https://vuejs.org).

### Writing A Plugin
To write a plugin you must write classes defining the new methods and then registering them in Wendigo with `registerPlugin` before creating a browser.

```js
class MyPlugin {
    constructor(browser) { // The plugin will receive the browser instance in the constructor
        this._browser = browser;
    }

    getHeaderTitle() { // Custom method to find our title
        return this._browser.text("h1.header-title")[0];
    }

    findKoalas() {
        return this._browser.findByTextContaining("koala");
    }

    _beforeOpen(options) { // This hook will be called anytime `browser.open` is executed
        // You can perform actions required for your plugin to run whenever
        // a new page is opened such as setting up cache
        // keep in mind that the page won't be accesible yet
    }

    _beforeClose() { // This hook will be called anytime `browser.close` is executed
        // You can perform actions required for your plugin when the page is
        // close, keep in mind that this will only be called on browser.close and
        // not on any page loading
    }

    _afterOpen(options) { // This hook will be called after the page is opened and loaded
        // You can use this hook to start performing actions with evaluate or
        // adding custom scripts with this._browser.page.addScriptTag
    }
}


class MyPluginAssertions { // The assertions will be under browser.assertions[myPluginName]
    constructor(browser, myPlugin) { // Plugin assertions receive browser and plugin in the constructor
        this._myPlugin = myPlugin;
    }

    thereAreKoalas(count) {
        const koalas = this._myPlugin.findKoalas().length;
        if (!count && koalas === 0) throw new AssertionError("No koalas :("); // node's AssertionError
        else if (count && koalas !== count) throw new AssertionError("No enough koalas :/");
    }

    headerTitle(title) {
        if (this._myPlugin.getHeaderTitle() !== title) throw new AssertionError("Invalid title");
    }
}

Wendigo.registerPlugin("koalafied", MyPlugin, MyPluginAssertions);

const browser=Wendigo.createBrowser();
//... more code ...

browser.koalafied.getHeaderTitle(); // Koalas are great

browser.assert.koalafied.headerTitle("Koalas are great");
browser.assert.koalafied.thereAreKoalas();
```

**Wendigo.registerPlugin** receives 3 parameters:

* **name**: Name to be used to access the plugin, it must be different than other plugins and should not collide with wendigo core modules.
* **plugin**: Class to be used as plugin accessed under `browser.name`, this class will receive `browser` as constructor parameter and 2 methods can be implemented as hooks:
  * **_beforeOpen**: Called when `browser.open` is called, before opening the page.
  * **_beforeClose**: Called when `browser.close` is called, before closing the page.
* **assertion**: Class to be used as plugin's assertions, it can be accessed on `browser.assertion.name` the constructor will receive both the browser and the core plugin as parameters

registerPlugin also accepts a single object containing the data in the following structure:

* `name`
* `plugin`
* `assertion`

Keep in mind that both the plugin and the assertions are optional, but at least one must exists to register the plugin.

Instead of classes, if a plain function is provided as a plugin or assertion, it will be attached directly to browser or browser assertion (without calling `new`), the function will receive the same arguments as the constructor of the plugin, as well as any extra parameter passed to the function:

```js
function myPluginAssertionFunc(browser, myPlugin, count){
    const koalas = myPlugin.findKoalas().length;
    if (!count && koalas === 0) throw new AssertionError("No koalas :("); // node's AssertionError
    else if (count && koalas !== count) throw new AssertionError("No enough koalas :/");
}

Wendigo.registerPlugin("koalafied", MyPlugin, MyPluginAssertions);
browser.assert.koalafied(); // note the assertion is called directly
```

### Publishing a plugin
If you want to create a new plugin and publish it in the npm store. Please, follow these steps:

1. Make sure your package exports a single object compatible with the interface described above to make it easier to import. Do not export the classes individually.
2. Make sure your code is tested using Node.js 8 and above.
3. Set Wendigo as a [peer dependency](https://docs.npmjs.com/files/package.json#peerdependencies) in you package.json.
    * If you are writing tests, also set Wendigo as a dev dependency, **never** as a normal dependency.
4. Wendigo usually follows [semantic versioning](https://semver.org) so your plugin should be compatible with any minor version above the version you wrote it, but a lot of things may break, so it is good to make sure your plugin still works properly in the latest version after a release.
5. Make a PR to update this document withyour plugin.
6. Let people know about it!.

## Examples
These are some examples on how to use Wendigo. More examples can be found [here](https://github.com/angrykoala/wendigo/wiki)

**Testing a simple page with Mocha and Wendigo**

```javascript
const assert = require('assert');
const Wendigo = require('wendigo');

describe("My Tests", function() {
    this.timeout(5000); // Recommended for CI
    let browser;

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
    });

    afterEach(async() => {
        // For more speed, this method could be only executed after all tests pass
        // if your tests do not rely on state changes
        await browser.close();
    });

    after(async() => {
        await Wendigo.stop(); // After all tests finished
    });

    it("Page Title", async() => {
        await browser.open("http://localhost");
        await browser.assert.text("h1#main-title", "My Webpage");
        await browser.assert.title("My Webpage");
    });

    it("Open Menu", async() => {
        await browser.open("http://localhost");
        await browser.assert.not.visible(".menu");
        await browser.click(".btn.open-menu");
        await browser.assert.visible(".menu");
    });
});
```

## Development
These instructions assume node>8.0.0 and npm installed:

1. Clone the git repository (`dev` branch)
2. `npm install`
3. `npm test` to execute the tests
   * `npm run lint` to execute the linting tests
   * `npm run dummy-server` to start the testing server on port 8002

Before doing a commit or PR to the `dev` branch, make sure both the tests and all lint tests pass. This can be checked by running `npm run prepublishOnly`.

### Architecture

* `Wendigo`: The main class exported by the module, provides the base interface to instantiate the browser class.
  * `BrowserFactory`: class takes care of the creation of the browser instance
* `Browser`: Provides all the API to connect, retrieve information and perform assertions on a webpage. The BrowserFactory will compose this class from multiple mixins and modules.
  * `mixins`: A Browser is divided in several mixins (found on the folder with the same name). These will be composed in the final Browser class.
  * `assertions`: All core assertions in the browser class. Module-related assertions exists within each module folder.
* `Modules`: A module represents an object that will be attached to the browser with a given name (e.g. localStorage).
  * Modules are different from mixins in that the modules are attached as a separate class instance whereas mixins are composed into the same class.
  * Note that each module can be composed by 2 parts, one attached to the main browser class and other to the assertion module.
  * Each module and all related code is stored in a separate folder.
* `Injection Scripts`: These scripts will be injected at runtime into the browser, and are required to perform most of Wendigo actions within the browser context, these scripts cannot access other parts of the code, and the rest of the code should not use these scripts out of the browser's context. These scripts can be used in the context of `browser.evaluate` by the user and other plugins.

## Troubleshooting

### Error: Failed to launch chrome! No usable sandbox!
This error may appear when running wendigo on certain systems and in most CI services. The sandbox setup can be bypassed by setting the environment variable `NO_SANDBOX=true`.

For example `NO_SANDBOX=true npm test`.

### MaxListenersExceededWarning: Possible EventEmitter memory leak detected warning
This can be caused by executing `Wendigo.createBrowser` multiple times without calling `browser.close` on previous browsers, causing all of them to be kept open. This may cause performance issues in your tests and it is recommended to close **every** browser after using it.

### Running Tests With Travis CI
Running tests using Puppeteer's require disabling the sandbox running mode. This can easily be achieved by passing the environment variable `NO_SANDBOX=true`, this can be done either as part of the test execution command, as a Travis secret env variable or in the `.travis.yml` file itself. It is recommended to add `travis_retry` to allow travis to execute the tests multiple times, as browser-based setup may fail frequently on travis workers:

```yml
language: node_js
os:
    - linux
node_js:
    - "stable"
sudo: false
env:
  - NO_SANDBOX=true

script:
    - travis_retry npm test

cache:
  directories:
    - node_modules
```

_Example of travis.yml file_

### Running Tests With Gitlab CI

It is recommended to add `retry: 2` to allow the CI to execute the tests multiple times, as browser-based setup may fail frequently on CI workers due to hardware resources needs:

```yml
image: angrykoala/wendigo

before_script:
    - npm install

test:
  stage: test
  retry: 2
  script:
    - npm test
```

_Example of .gitlab-ci.yml_

### Running Tests With GitHub Actions
To run tests with Wendigo on GH actions the default node workflow can be used. Using `npm test || npm test` to add a single retry in case tests fail once.

```yml
name: test

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1
      - uses: actions/setup-node@v1
        with:
          node-version: 12
      - run: npm install
      - name: test
        run: |
          sudo apt-get update
          sudo apt-get install -y libgbm-dev
          npm test || npm test
        env:
          CI: true
```

_Example of .github/workflows/test.yml_

### Using Wendigo with Docker
Wendigo con be running on docker just as any other application using Puppeteer, but an official image is provided to ease the setup, the following is an example of a dockerfile using Node 10 and Wendigo:

```dockerfile
FROM angrykoala/wendigo

COPY package*.json ./
# Installs your up (it must have Wendigo as a dependency)
RUN npm ci
# Copies the rest of your app
COPY . /app

# Runs your tests
CMD ["npm", "test"]

```

> **Warning**: This image is updated and maintained, but it is still an early feature and may not be as stable as using Wendigo directly.

### Assertion failed messages without error
If you are using node@10 and puppeteer 1.4.0 or less, you may experience messages such as `Assertion failed: No node found for selector`, this is due to a change in how `console.assertion` works in node 10 and how puppeteer uses it, these messages won't affect the tests, if the messages are a big problem for you, consider downgrading your node.js version, upgrading puppeteer if possible or overriding console.assert: `console.assert=()=>{}`.

> Remember to check [Puppeteer Troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md)

### Page doesn't work the same way on headless mode
Wendigo runs on headless mode by default, it can be disabled with the options `headless: false`, making it run on a graphical mode. This can cause some inconsistencies as headless and graphical mode won't behave exactly the same way on all scenarios.

These Differences can be caused by multiple reasons. Most commonly graphical mode requires more resources and execute actions slower than headless mode, making it less stable and causing some timeouts and race conditions. Setting the `slowMo` option may help on making headless mode behave more similar to a real browser.

The user-agent provided by Puppeteer is also different when executing in headless browser, some webpages may rely on this to detect bots or to change the display. This can easily be avoided by explicitly setting the user agent on createBrowser:

```js
// This setup will make headless mode run work more like a real browser
const browser = await Wendigo.createBrowser({
    slowMo: 50,
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
});
```

## Acknowledgements

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) and Chrome Headless as base headless browser.
* [ZombieJs](https://github.com/assaf/zombie) as inspiration of the assertion library.
* [NightmareJs](http://www.nightmarejs.org) as inspiration for part of the browser interface.

Some code based on the following:

* <https://github.com/ChromeDevTools/devtools-frontend/blob/master/front_end/elements/DOMPath.js>
* <https://github.com/capaj/proxy-date>

## License

* Wendigo is maintained by @angrykoala under GPL-3.0 License
* Wendigo Old Logo, made by @jbeguna04 is licensed under [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/)
* Wendigo Logo, made by @belenpicazo is licensed under [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/)
