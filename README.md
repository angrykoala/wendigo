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
    * `headless: true`: If true, the browser will run on headless mode.

Example:
```js
const Wendigo=require('wendigo');
const browser=Wendigo.createBrowser(); // Using default options
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
Returns and array with the classes of the first element returned from the given css selector.

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
const value=await browser.value("input.my-input");
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
Waits for given css selector to exists, with the given timeout in milliseconds.

```js
await browser.waitFor(".popup");
```

**findByText(text)**   
Returns an array with the elements with text content matching the given text.  

```js
const elements=await browser.findByText("My First Paragraph");
elements.length; // 1
```

**findByTextContaining(text)**    
Returns an array with all the elements with a text that contains the given text.

```js
const elements=await browser.findByTextContaining("Paragraph");
elements.length; // 2
```

**type(selector, text)**
Types given text (as element value) in all the elements (input) with given selector. If a value is already present, appends the new text at the end.


```js
await browser.type("input.my-input", "My Input");
```

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
Asserts that at least one element matching the given selector has the expected text.

```js
await browser.assert.text("p", "My First Paragraph");
```

**textContains(selector, expected, msg)**   
Asserts that at least one element matching the given selector contains the expected text.

```js
await browser.assert.text("p", "My First");
```

**title(expected, msg)**   
Asserts that the page title matches the expected string.

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
browser.assert.elements("p", 2); // Ok
browser.assert.elements("p", {equal: 2}); // Ok
browser.assert.elements("p", {atLeast: 1, atMost:3}); // Ok
browser.assert.elements("p.first", 0); //Ok

browser.assert.elements("p.second", 2); // Fails
browser.assert.elements("p.second", {atLeast: 1}); // Ok
```


### Negative assertions
Most of the browser assertions have a negative version that can be used with `browser.assert.not`. Most of the behaviours of the "not" assertions are simply the inverse of the positive version.

**not.exists(selector, msg)**   
Asserts that no element matching given selector exists.

```js
await browser.not.exists("h1.foo.bar");
```

**not.visible(selector, msg)**   
Asserts that the first element with given selector is not visible. If no element matches, it will be considered as not visible as well.

**not.text(selector, expected, msg)**   
Asserts that no element matching the given selector matches the expected text.

```
await browser.assert.not.text("p", "This text doesn't exists");
```

**not.title(expected, msg)**   
Asserts that the title of the page is not the expected string.

**not.url(expected, msgs)**   
Asserts that the url of the page doesn't match the expected string.

**not.value(selector, expected, msg)**
Asserts that the first element with the given selector doesn't have the expected value.


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

```ỳml
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

## Acknowledgements

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) and Chrome Headless as base headless browser.
* [ZombieJs](https://github.com/assaf/zombie) as inspiration of the assertion library.
* [NightmareJs](http://www.nightmarejs.org) as inspiration for part of the browser interface.
