# Wendigo

_by @angrykoala_    
[![npm version](https://badge.fury.io/js/wendigo.svg)](https://badge.fury.io/js/wendigo)
[![Build Status](https://travis-ci.org/angrykoala/wendigo.svg?branch=master)](https://travis-ci.org/angrykoala/wendigo)

> A proper monster for front-end testing

**Wendigo** is a wrapper of [Puppeteer](https://github.com/GoogleChrome/puppeteer) with the purpose of making automated testing easier and simpler. Install it with `npm install --save-dev wendigo`

Consider the following example of a test using puppeteer:

```javascript
await page.click(".my-btn");
await page.waitForSelector("#my-modal")
const modalText = await page.evaluate(() => {
    const modalElement = document.querySelector("#my-modal");
    return modalElement.textContent;
})
assert.strictEqual(modalText, "Button Clicked");
```

Using Wendigo, the same test could be written like this:

```javascript
await browser.click(".my-btn");
await page.waitFor("#my-modal");
await browser.assert.text("#my-modal", "Button Clicked");
```

> **Warning:** Wendigo is under early stages of development and its interface may change

**Contents**
* [Api](#api)
    * [Wendigo](#wendigo)
    * [Browser](#browser)
    * [Assert](#assert)
* [Examples](#examples)
* [Troubleshooting](#troubleshooting)
* [Acknowledgements](#acknowledgements)

# Api


## Wendigo
Wendigo is the main static class exported by the package. It provides the methods necessary to create browsers and disconnect from chrome, can be imported with `require('wendigo')`:

**static createBrowser(settings)**   
Will create and return a [Browser](#Browser) instance. It will automatically launch and connect puppeteer and Chrome if an instance is not running.

* _settings_ is an optional object with the settings to build the browser
    * `log: false`: If true, it will log all the console events of the browser.
    * Any settings that can be passed to puppeteer can be passed in createdBrowser, for example:
        * `headless: true`: If true, the browser will run on headless mode.
        * `slowMo: 0`: Slows the execution of commands by given number of milliseconds

> **Warning:** the settings will only take effect the first time a browser page is created, to fully restart the settings you must close the browser connection using `Wendigo.stop()` before executing createBrowser again

Examples:
```js
const Wendigo=require('wendigo');
const browser=Wendigo.createBrowser(); // Using default options
```

```js
const Wendigo=require('wendigo');
const browser=Wendigo.createBrowser({
    headless: false,
    slowMo: 500
}); // Using options to see what's happening
```

**static stop()**   
Will stop and disconnect all the browsers. It should be called after finishing all the tests.

## Browser
The Browser instance is and interface with the `page` class of puppeteer.

### Attributes
**page**   
Puppeteer [page class](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page), allows access to puppeteer API if needed.

```js
await browser.page.evaluate(()=>{
    document.querySelector("h1");
});
```

**assert**   
Allow access to the [Assertion](#Assert) interface.

**frame**   
Puppeteer [frame class](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-frame)

### Methods
All the methods in Browser return a Promise than can easily be handled by using `async/await`.

**open(url)**    
Opens the given url in the browser.

```js
await browser.open("http://localhost:8000");
```

**close()**    
Close the opened page in the browser.

```js
await browser.close();
```

**query(selector)**   
Queries the given css selector and returns a DOM node. If multiple elements are matched, only the first will be returned. Returns null if no element found.

```js
const element = await browser.query("h1");
```

**queryAll(selector)**   
Returns an array with all the DOM elements that match the given css selector.

```js
const elements = await browser.queryAll("h1");
elements.length; // 2
```

> All the Dom elements returned by queryElement and queryAll can be used instead of a selector in other methods and assertions

**queryXPath(xPathSelector)**   
Returns an array with the DOM elements matching the xPath selector.

```js
const elements = await browser.queryXPath('//p[contains(text(),"My first paragraph")]');
elements[0].textContent; // "My first paragraph"
```

**class(selector)**    
Returns and array with the classes of the first element returned from the given css selector. Throws if no element is found.

```js
const classes=await browser.class("div.container.main"); // Returns ["container", "main", "another-class"]
```

Using a dom node:
```js
const node=await browser.query("div.container.main");
const classes=await browser.class(node); // Returns ["container", "main", "another-class"]
```

**value(selector)**   
Returns the value of the first element with given selector. Returns _null_ if no element or value found.

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
Returns an object with all the computed css styles of the first element matching the given selector.

```js
const styles=await browser.styles("h1.my-title");
styles.color; // 'rgb(255, 0, 0)'
```

**text(selector)**   
Returns an array with all text contents of the elements matching the css selector

```js
const texts=await browser.text("p"); // ["My First Paragraph", "My Second Paragraph"]
```

**click(selector, index)**   
Clicks all the elements with the matching css selector, if the index parameter is set, only the nth element will be clicked.

```js
await browser.click("button.btn");
```

**clickText(text)**   
Clicks all the elements matching given text.

```js
await browser.clickText("Click Me!");
```

**title()**   
Returns the page title

**html()**   
Returns the page html as string. It will return the html as it was before performing any actions

**url()**  
Returns the current url of the page

**wait(ms=250)**   
Waits for the given milliseconds.

**waitFor(selector, timeout=500)**   
Waits for given selector to exists and be visible, with the given timeout in milliseconds.

```js
await browser.waitFor(".popup");
```

**waitUntilNotVisible(selector, timeout=500)**   
Waits until the given selector is no longer visible or doesn't exists, with the given timeout in milliseconds.

```js
await browser.waitUntilNotVisible(".toast");
```

**findByText(text)**   
Returns an array with the elements with text content matching the given text.  

```js
const elements = await browser.findByText("My First Paragraph");
elements.length; // 1
```

**findByTextContaining(text)**    
Returns an array with all the elements with a text that contains the given text.

```js
const elements = await browser.findByTextContaining("Paragraph");
elements.length; // 2
```

**type(selector, text)**   
Types given text in the first element matching given selector. If a value is already present, writes the new value at the beginning.


```js
await browser.type("input.my-input", "My Input");
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

> Only Css Selectors supported

**selectedOptions(selector)**
Returns all the selected options of the first element matching the given selector. If no value is set, the text of the option will be returned.

Will throw if no element is found.

> Css, Xpath and Dom Selectors supported

**clearValue(selector)**   
Clears any value that exists in any of the elements matched by the given selector. Setting the value to "".

```js
await browser.clearValue("input.my-input");
```

## Assert
The submodule `browser.assert` provide some out-of-the-box assertions that can be used to easily write tests that are readable without having to specifically query for elements o perform evaluations. All the assertions have a last optional parameter (msg) to define a custom assertion message.

**exists(selector, msg)**   
Asserts that at least one element with given css exists

```js
await browser.assert.exists("h1.main-title");
```

**visible(selector, msg)**   
Asserts that the first element matching the selector is visible.

An element will considered visible if:
* Exists
* The computed style doesn't contain display: none or visibility: hidden

**text(selector, expected, msg)**   
Asserts that at least one element matching the given selector has the expected string or regex.
If expected is an array, all texts in it should match.

```js
await browser.assert.text("p", "My First Paragraph");
```

**textContains(selector, expected, msg)**   
Asserts that at least one element matching the given selector contains the expected text.

```js
await browser.assert.textContains("p", "My First");
```

**title(expected, msg)**   
Asserts that the page title matches the expected string or regex.

**class(selector, expected, msg)**   
Asserts that the first element matching the selector contains the expected class.

```js
await browser.assert.class("div.container.main-div", "container");
```

**url(expected, msg)**   
Asserts that the current url matches the given string.

**value(selector, expected, msg)**   
Asserts that the first element matching the selector has the expected value.

```js
await browser.type("input.my-input", "Dont Panic");
await browser.assert.value("input.my-input", "Dont Panic");
```

**element(selector, msg)**   
Asserts that exactly one element matches given selector. Same as `elements(selector, 1)`.

**elements(selector, count, msg)**   
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

**attribute(selector, attribute, expected, msg)**   
Asserts that the first element matching the given selector contains an attribute matching the expected value. If no expected value is given, any not null value for the attribute will pass.

```js
await browser.assert.attribute(".hidden-class", "class", "hidden-class");
await browser.assert.attribute(".hidden-class", "hidden");
```

To pass a custom message without specifying an expected value, you can pass `undefined`:
```js
await browser.assert.attribute(".hidden-class", "hidden", undefined, "hidden-class doesn't have attribute hidden");
```

You can check an attribute doesn't exists passing `null` as expected argument or using `assert.not.attribute`

If the element doesn't exists, the assertion will fail.

**style(selector, style, expected, msg)**   
Asserts that the first element matching the given selector has an style with the expected value. The assertion will throw an error if no element is found.

```js
await browser.assert.style("h1", "color", "rgb(0, 0, 0)");
```

**href(selector, expected, msg)**   
Asserts that the first element matching the given selector contains an attribute href with expected value.

```js
browser.assert.href("a", "foo.html");
browser.assert.href("link", "styles.css");
```

> Same as `browser.assert.attribute(selector, "href", expected, msg)`

### Negative assertions
Most of the browser assertions have a negative version that can be used with `browser.assert.not`. Most of the "not" assertions are simply the inverse of the positive version.

**not.exists(selector, msg)**   
Asserts that no element matching given selector exists.

```js
await browser.not.exists("h1.foo.bar");
```

**not.visible(selector, msg)**   
Asserts that the first element with given selector is not visible. If no element matches, it will be considered as not visible as well.

**not.text(selector, expected, msg)**   
Asserts that no element matching the given selector matches the expected text.
If expected is an array, no element in it should match any element with given selector

```js
await browser.assert.not.text("p", "This text doesn't exists");
```

**textContains(selector, expected, msg)**   
Asserts that no elements matching the given selector contain the expected text.

```js
await browser.assert.not.textContains("p", "doesn't exis");
```

**not.title(expected, msg)**   
Asserts that the title of the page is not the expected string.

**not.class(selector, expected, msg)**   
Asserts that the first element matching the selector doesn't contain the expected class. It will throw if the element is not found.

**not.url(expected, msgs)**   
Asserts that the url of the page doesn't match the expected string.

**not.value(selector, expected, msg)**    
Asserts that the first element with the given selector doesn't have the expected value.

**not.attribute(selector, attribute, expected, msg)**    
Asserts that the first element matching the given selector doesn't contain an attribute with the expected value. If no expected value is given, any not null value on the attribute will fail.

```js
await browser.assert.not.attribute(".not-hidden-class", "class", "hidden-class");
await browser.assert.not.attribute(".not-hidden-class", "hidden");
```

To pass a custom message without specifying an expected value, you can pass null:
```js
await browser.assert.not.attribute(".hidden-class", "href", null, "hidden-class has attribute href");
```
If the element doesn't exists, the assertion will fail.

**not.style(selector, style, expected, msg)**   
Asserts the first element matching the selector doesn't has a style with given value.

**href(selector, expected, msg)**   
Asserts that the first element matching the given selector doesn't contain an attribute href with the expected value.

> Same as `browser.assert.not.attribute(selector, "href", expected, msg)`

## Examples

**Testing a simple page with Mocha and Wendigo**

```javascript
"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');

describe("My Tests", function() {
    this.timeout(5000); // Recommended for CI
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async () => {
        await browser.close();
        await Wendigo.stop(); // After all tests finished
    });

    it("Page Title", async ()=>{
        await browser.open("http://localhost");
        await browser.assert.text("h1#main-title", "My Webpage");
        await browser.assert.title("My Webpage");
    });

    it("Open Menu", async ()=>{
        await browser.open("http://localhost");
        await browser.assert.not.visible(".menu");   
        await browser.click(".btn.open-menu");
        await browser.assert.visible(".menu");
    });
});
```

## Troubleshooting

### Running Tests With Travis CI
Running tests using puppeteer's require disabling the sandbox running mode. This can easily be achieved by passing the environment variable `NO_SANDBOX=true`, this can be done either as part of the test execution command, as a Travis secret env variable or in the `.travis.yml` file itself:

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
    - npm test

cache:
  directories:
    - node_modules
```
_Example of travis.yml file_

### Running Tests With Gitlab CI

Using gitlab with the default node image requires installing a few dependencies with `apt-get` before installing wendigo. Same as in travis, sandbox mode should be disabled with the env variable `NO_SANDBOX`:

```yml
image: node:8.9.4

variables:
  NO_SANDBOX: "true"

before_script:
    - apt-get update
    - apt-get install -y -q gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
    - npm install

test:
  stage: test
  script:
    - npm test
```
_Example of .gitlab-ci.yml_

> Remember to check [Puppeteer Troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md)

## Acknowledgements

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) and Chrome Headless as base headless browser.
* [ZombieJs](https://github.com/assaf/zombie) as inspiration of the assertion library.
* [NightmareJs](http://www.nightmarejs.org) as inspiration for part of the browser interface.
