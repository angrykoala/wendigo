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
* [Api](#Api)
    * [Wendigo](#Wendigo)
    * [Browser](#Browser)
    * [Assert](#Assert)
* [Examples](#Examples)
* [Troubleshooting](#Troubleshooting)

# Api


## Wendigo
Wendigo is the main static class exported by the package. It provides the methods necessary to create browsers and disconnect from chrome:

**static createBrowser(settings)**
Will create and return a [Browser](#Browser) instance. It will automatically launch and connect puppeteer and Chrome if an instance is not running.

* _settings_ is an optional object with the settings to build the browser
    * `log (false)`: If true, it will log all the console events of the browser.

**static stop()**
Will stop and disconnect all the browsers. It should be called after finishing all the tests.

## Browser
The Browser instance is and interface with the `page` class of puppeteer.

### Attributes
**page**
Puppeteer [page class](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page), allows access to puppeteer API if needed.

**assert**
Allow access to the [Assertion](#Assert)

**frame**

### Methods
All the methods in Browser return a Promise and can easily be handled by using `async/await`

query()
queryAll()
queryXPath()
class()


open()
close()
text()
click()
title()
html()
url()
wait()
waitFor()
findByText()
findByTextContaining()



## Assert

exists
visible
text
title
class
url

not.exists
not.visible
not.text
not.title
not.url

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

## Acknowledgements

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) and Chrome Headless as base headless browser.
* [ZombieJs](https://github.com/assaf/zombie) as inspiration of the assertion library.
* [NightmareJs](http://www.nightmarejs.org) as inspiration for part of the browser interface.
