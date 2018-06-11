# Wendigo

_by @angrykoala_    
[![npm version](https://badge.fury.io/js/wendigo.svg)](https://badge.fury.io/js/wendigo)
[![Build Status](https://travis-ci.org/angrykoala/wendigo.svg?branch=master)](https://travis-ci.org/angrykoala/wendigo)

> A proper monster for front-end automated testing

**Wendigo** is a wrapper of [Puppeteer](https://github.com/GoogleChrome/puppeteer) with the purpose of making automated testing easier and simpler. Install it with `npm install --save-dev wendigo`

Consider the following example of a test using Puppeteer:

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
    * [Cookies](#cookies)
    * [LocalStorage](#localstorage)
    * [Requests](#requests)
    * [Errors](#errors)
* [Examples](#examples)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [Acknowledgements](#acknowledgements)

# Api


## Wendigo
Wendigo is the main static class exported by the package. It provides the methods necessary to create browsers and disconnect from chrome, can be imported with `require('wendigo')`:

**static createBrowser(settings)**   
Will create and return a [Browser](#Browser) instance. It will automatically launch and connect Puppeteer and Chrome if an instance is not running.

* _settings_ is an optional object with the settings to build the browser
    * `log: false`: If true, it will log all the console events of the browser.
    * Any settings that can be passed to Puppeteer can be passed in createdBrowser, for example:
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
The Browser instance is and interface with the `page` class of Puppeteer.

### Attributes
**page**   
Puppeteer [page class](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page), allows access to Puppeteer API if needed.

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

**open(url, options?)**    
Opens the given url in the browser.

```js
await browser.open("http://localhost:8000");
```

The following options can be passed:

* `clearRequestMocks` (default: true): Clears all previous mocks in the requests module


**close()**    
Close the opened page in the browser.

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

> This is a wrapper around browser.page.evaluate

**query(selector, childSelector?)**   
Queries the given css selector and returns a DOM node. If multiple elements are matched, only the first will be returned. Returns null if no element found.

```js
const element = await browser.query("h1");
```

Optionally, query supports 2 parameters, the first being a DOMElement and the selector as the second one. The query will then be performed only on the elements under the parent.

**queryAll(selector, childSelector?)**   
Returns an array with all the DOM elements that match the given css selector.

```js
const elements = await browser.queryAll("h1");
elements.length; // 2
```

Optionally, queryAll supports 2 parameters, the first being a DOMElement and the selector as the second one. The query will then be performed only on the elements under the parent.

> All the Dom elements returned by queryElement and queryAll can be used instead of a selector in other methods and assertions.

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

**style(selector, style)**    
Returns the value of the given style of the first element matching the give nselector. Returns undefined if the style doesn't exists. Throws if the element is not found.

```js
const style=await browser.style("h1.my-title", color); // 'rgb(255, 0, 0)'
```

**checked(selector)**   
Returns true if the first element matching the given selector (checkbox) is checked. If the value is not a checkbox and doesn't have checked property set, it will return undefined.


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

**clickText(selector?, text)**   
Clicks all the elements matching given text.

```js
await browser.clickText("Click Me!");
```

Optionally a selector can be passed as first argument to only click elements under the given selector.

**check(selector)**    
Checks the first element matching given selector. Setting its checked property to true.

**uncheck(selector)**    
Unchecks the first element matching given selector. Setting its checked property to false.

**title()**   
Returns the page title

**html()**   
Returns the page html as string. It will return the html as it was before performing any actions

**url()**  
Returns the current url of the page

**wait(ms=250)**   
Waits for the given milliseconds.

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

> Css and Xpath selectors supported

**waitUntilNotVisible(selector, timeout=500)**   
Waits until the given selector is no longer visible or doesn't exists, with the given timeout in milliseconds.

```js
await browser.waitUntilNotVisible(".toast");
```

**waitForUrl(url, timeout=500)**    
Waits for page url to be the given url.

```js
await browser.click("a");
await browser.waitForUrl("my-url");
```


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

Otionally, a selector can be passed as first argument to perform a text search on children of that element only.

**type(selector, text)**   
Types given text in the first element matching given selector. If a value is already present, writes the new value at the beginning.


```js
await browser.type("input.my-input", "My Input");
```

**keyPress(key)**    
Press a keyboard key, the key can be the name of any key supporter by [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js)

```js
await browser.keyPress("Enter");
```

If an array is passed, all the keys will be pressed consecutively.

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

**clearValue(selector)**   
Clears any value that exists in any of the elements matched by the given selector. Setting the value to "".

```js
await browser.clearValue("input.my-input");
```

**innerHtml(selector)**    
Returns an array with the innerHtml strings of all the elements matching the given selector

```js
await browser.innerHtml("p"); // ["my <b>first</b> paragraph"]
```

> Css, Xpath and Dom selectors supported

**setValue(selector, value)**    
Sets the given value on all the elements matching the given selector. Returns the number of elements changed, throws if no element found.
```js
await browser.setValue("input", "new val"); // Returns 1
await browser.assert.value("input", "new val");
```
This method won't trigger certain events, use `type` and `select` when possible.

> Css, Xpath and Dom selectors supported

**options(selector)**    
Returns the selector options values of the first element matching the given selector. Throws if no element is found. If the element doesn't have options (i.e. is not a selector) an empty array is returned.

```js
const options=await browser.options("selector.my-selector"); // ["value1", "value2"]
```

> Css, Xpath and Dom selectors supported

**selectedOptions(selector)**    
Returns all the selected options of the first element matching the given selector. If no value is set, the text of the option will be returned.

Will throw if no element is found.

> Css, Xpath and Dom selectors supported

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

> Unlike Puppeteer setViewport, no parameter is required, as the current values will be used for the new viewport.

**focus(selector)**    
Focus the first element matching the given selector.

> Only CSS selectors supported

**hover(selector)**    
Hovers over the first element matching the given selector.

> Only CSS selectors supported

## Assert
The submodule `browser.assert` provide some out-of-the-box assertions that can be used to easily write tests that are readable without having to specifically query for elements o perform evaluations. All the assertions have a last optional parameter (msg?) to define a custom assertion message.

**exists(selector, msg?)**   
Asserts that at least one element with given css exists

```js
await browser.assert.exists("h1.main-title");
```

**visible(selector, msg?)**   
Asserts that the first element matching the selector is visible.

An element will considered visible if:
* Exists
* The computed style doesn't contain display: none or visibility: hidden
* All the parents are visible

**text(selector, expected, msg?)**   
Asserts that at least one element matching the given selector has the expected string or regex.
If expected is an array, all texts in it should match.

```js
await browser.assert.text("p", "My First Paragraph");
```

**textContains(selector, expected, msg?)**   
Asserts that at least one element matching the given selector contains the expected text.

```js
await browser.assert.textContains("p", "My First");
```

**title(expected, msg?)**   
Asserts that the page title matches the expected string or regex.

**class(selector, expected, msg?)**   
Asserts that the first element matching the selector contains the expected class.

```js
await browser.assert.class("div.container.main-div", "container");
```

**url(expected, msg?)**   
Asserts that the current url matches the given string.

**value(selector, expected, msg?)**   
Asserts that the first element matching the selector has the expected value.

```js
await browser.type("input.my-input", "Dont Panic");
await browser.assert.value("input.my-input", "Dont Panic");
```

**element(selector, msg?)**   
Asserts that exactly one element matches given selector. Same as `elements(selector, 1)`.

**elements(selector, count, msg?)**   
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

**attribute(selector, attribute, expected?, msg?)**   
Asserts that at least one element element matching the given selector contains an attribute matching the expected value. If no expected value is given, any not null value for the attribute will pass.

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

**style(selector, style, expected, msg?)**   
Asserts that the first element matching the given selector has an style with the expected value. The assertion will throw an error if no element is found.

```js
await browser.assert.style("h1", "color", "rgb(0, 0, 0)");
```

**href(selector, expected, msg?)**   
Asserts that the any matching the given selector contains an attribute href with expected value.

```js
browser.assert.href("a", "foo.html");
browser.assert.href("link", "styles.css");
```

> Same as `browser.assert.attribute(selector, "href", expected, msg?)`

**innerHtml(selector, expected, msg?)**    
Asserts that at least one element matching the given selector has the expected innerHtml.
The expected html can be either a _string_ or a _Regex_ value.

The assertion will throw if no element is found.

```js
await browser.assert.innerHtml("p", "my <b>first</b> paragraph");
```

> Css, Xpath and Dom selectors supported

**options(selector, expected, msg?)**    
Assets that the first element with given selector has the expected options value. Expected can be a string, if only one option is given, or an array if multiple options are given. All expected options must match in the same order.

```js
await browser.assert.options("select.my-select", ["value1", "value2"]);
```

> Css, Xpath and Dom selectors supported

**selectedOptions(selector, expected, msg?)**   
Assert that the first element with given selector has the expected options selected. Expected can be a string, if only one option is given or an array. All the selected options must match the expected options in the same order.

> Css, Xpath and Dom selectors supported

**global(key, value?, msg?)**    
Asserts that the global object (window) has the given key with the expected value. If not value (or undefined value) is provided, it will assert that the key exists with a not undefined value.

```js
browser.assert.global("localStorage");
browser.assert.global("my-val", "dontpanic");
```

> Assertions related to LocalStorage can be found under each section

**cookie(name, expected?, msg?)**   
Asserts that the cookie with the given name exists. If the expected parameter is passed, it will check that the cookie has that value.

```js
browser.assert.cookie("username");
browser.assert.cookie("username", "arthur_dent");
```

**checked(selector, msg?)**   
Asserts that the first element matching the given selector has a checked value set to true.

> Css, Xpath and Dom selectors supported

**disabled(selector, msg?)**    
Asserts that the first element matching the given selector is disabled (has attribute disabled).

> Css, Xpath and Dom selectors supported

**enabled(selector, msg?)**    
Asserts that the first element matching the given selector is enabled (doesn't have attribute disabled).

> Css, Xpath and Dom selectors supported

**focus(selector, msg?)**    
Asserts that an element matching the given selector is focused.

```js
browser.click(".btn");
browser.assert.focus(".btn");
```

> Css, Xpath and Dom selectors supported

**redirect(msg?)**    
Asserts that the opened url is a redirection.

### Negative assertions
Most of the browser assertions have a negative version that can be used with `browser.assert.not`. Most of the "not" assertions are simply the inverse of the positive version.

**not.exists(selector, msg?)**   
Asserts that no element matching given selector exists.

```js
await browser.not.exists("h1.foo.bar");
```

**not.visible(selector, msg?)**   
Asserts that the first element with given selector is not visible. If no element matches, it will be considered as not visible as well.

**not.text(selector, expected, msg?)**   
Asserts that no element matching the given selector matches the expected text.
If expected is an array, no element in it should match any element with given selector

```js
await browser.assert.not.text("p", "This text doesn't exists");
```

**not.textContains(selector, expected, msg?)**   
Asserts that no elements matching the given selector contain the expected text.

```js
await browser.assert.not.textContains("p", "doesn't exis");
```

**not.title(expected, msg?)**   
Asserts that the title of the page is not the expected string.

**not.class(selector, expected, msg?)**   
Asserts that the first element matching the selector doesn't contain the expected class. It will throw if the element is not found.

**not.url(expected, msgs)**   
Asserts that the url of the page doesn't match the expected string.

**not.value(selector, expected, msg?)**    
Asserts that the first element with the given selector doesn't have the expected value.

**not.attribute(selector, attribute, expected?, msg?)**    
Asserts that no element matching the given selector doesn't contain an attribute with the expected value. If no expected value is given, any not null value on the attribute will fail.

```js
await browser.assert.not.attribute(".not-hidden-class", "class", "hidden-class");
await browser.assert.not.attribute(".not-hidden-class", "hidden");
```

To pass a custom message without specifying an expected value, you can pass undefined:
```js
await browser.assert.not.attribute(".hidden-class", "href", undefined, "hidden-class has attribute href");
```
If the element doesn't exists, the assertion will fail.

> Keep in mind that passing null as expected value will assert that the attribute exists and it is not recommended

**not.style(selector, style, expected, msg?)**   
Asserts the first element matching the selector doesn't has a style with given value.

**not.href(selector, expected, msg?)**   
Asserts that no element matching the given selector doesn't contain an attribute href with the expected value.

> Same as `browser.assert.not.attribute(selector, "href", expected, msg?)`

**not.innerHtml(selector, expected, msg?)**    
Asserts that at least no element matching the given selector has the expected innerHtml.
The expected html can be either a _string_ or a _Regex_ value.

The assertion will throw if no element is found.

```js
await browser.assert.not.innerHtml("p", "not <b>a</b> paragraph");
```

> Css, Xpath and Dom selectors supported

**not.selectedOptions(selector, expected, msg?)**   
Assert that the first element with given selector doesn't have the expected options selected. Expected can be a string, if only one option is given or an array. The assertion will only fail if all the expected options match the selected options in the same order.

> Css, Xpath and Dom selectors supported

**not.global(key, value?, msg?)**    
Asserts that the global object (window) doesn't have the given key with the expected value. If not value (or undefined value) is provided, it will assert that the key doesn't exist or it is undefined.

**not.cookie(name, expected?, msg?)**    
Asserts that the cookie with given name doesn't have the expected value. If no expected value is passed, it will check that the cookie doesn't exists (is undefined).

```js
browser.assert.not.cookie("not-a-cookie");
browser.assert.not.cookie("username", "not-user");
```

> Assertions related to LocalStorage can be found under each section


**not.checked(selector, msg?)**   
Asserts that the first element matching the given selector has a checked value set to false.

Note that if the element doesn't have a checked value (i.e. is not a checkbox) this assertion will throw.

> Css, Xpath and Dom selectors supported

**not.disabled(selector, msg?)**    
Asserts that the first element matching the given selector is not disabled (same as assert.enabled).

> Css, Xpath and Dom selectors supported

**not.enabled(selector, msg?)**    
Asserts that the first element matching the given selector is not enabled (same as assert.disabled).

> Css, Xpath and Dom selectors supported

**not.focus(selector, msg?)**    
Asserts that none of the elements matching the given selector is focused.

> Css, Xpath and Dom selectors supported

**not.redirect(msg?)**    
Asserts that the current opened page is not a redirection.


## Cookies
The module `browser.cookies` provides a way to easily handle cookies through Puppeteer's api. All methods return Promises.

**all()**    
Returns all the cookies in the current page as an object

```js
const cookies = await browser.cookies.all(); // {username: "arthur_dent", email: "arthur@dent.com"}
```

**get(name)**    
Returns the value of the cookie with given name. Returns undefined if the cookie doesn't exists

```js
const cookie = await browser.cookies.get("username"); // "arthur_dent"
```

**set(name, value)**    
Sets the value of the cookie with given name. If it already exists it will be replaced.

```js
await browser.cookies.set("username", "marvin");
```

**delete(name)**   
Deletes the cookie with given name if exists. Optionally an array can be passed and all the cookies will be removed. Won't do anything if the cookie doesn't exists.

```js
await browser.cookies.delete("username");
await browser.cookies.delete(["username", "email"]);
```

**clear()**    
Deletes all the cookies of the current page.

```js
await browser.cookies.clear()
```

## LocalStorage
The module `browser.localStorage` provides a simple wrapper around the browser localStorage. All the methods return Promises.

**getItem(key)**    
Returns the item with the given key. If no item exists return null.

```js
const value=await browser.localStorage.getItem("my-key"); // returns my-value
```

**setItem(key, value)**    
Sets the given key with the given value.

```js
await browser.localStorage.setItem("my-key", "my-value");
```

**removeItem(key)**   
Removes the item with given key.

**clear()**   
Removes all the items on the store.

**length()**   
Returns the number of items in the store.

```js
const itemsLength = await browser.localStorage.length(); // 3
```

### LocalStorage Assertions
Assertions related local storage can be accessed through `browser.assert.localStorage`.

**exist(key, msg?)**    
Asserts that the item with given key exists in the localStorage (i.e. not null).

```js
browser.assert.localStorage.exist("my-key");
```

Alternatively, if an array is passed as key, all the elements will be checked.

**value(key, expected, msg?)**    
Asserts that the item with given key has the expected value.

```js
browser.assert.localStorage.value("arthur", "dontpanic");
```

Alternatively, an object can be passed instead of key/expected with the elements that should be checked:

```js
browser.assert.localStorage.value({arthur: "dontpanic", marvin:"the paranoid"});
```

**length(expected, msg?)**    
Asserts that the localStorage has the expected length.

**empty(msg?)**    
Asserts that the localStorage is empty (i.e. length>0)

> All these assertions have the negative `browser.assert.localStorage.not`.

## Requests
The Requests module allows to get and filter the requests made by the browser since the page was opened.

> All the requests objects are [Puppeteer's Requests](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-request)

**all**    
Returns all requests, ordered by when it was dispatched.
```js
await browser.requests.all;
```

**filter**    
Returns a filter over the requests. Check [Filtering Requests](#filtering-requests) for examples.

**mock(url, response, method?)**    
Mocks all the requests to the given url, sending the given response instead. If a method (`GET`, `POST`...) is specified, only requests to given method will be mocked.

Response is an object with the following attributes:

* `status` Response status code, defaults to 200.
* `headers` Optional response headers.
* `contentType` If set, equals to setting Content-Type response header.
* `body` Optional response body. It can be a string or a json-serializable object


> This object matches the interface with Puppeteer's [respond method](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestrespondresponse)

```js
// All requests made to /api will return 200 with the given body
browser.requests.mock("http://localhost:8000/api", {
    body: `{result: "ok"}`
});
```

Mock will return a RequestMock object, with the following properties:

* `called`: If the mock has been called
* `timesCalled`: The times the mock has been called
* `response` : The response the mock is returning (read only)
* `url`: Mocked url
* `assert.called(times?)`: asserts that the mock has been called the given number of times, if times parameter is not given, the assertion will throw if no calls were made

```js
const mock=browser.requests.mock("http://localhost:8000/api", {
    body: {result: "ok"}
});
mock.called; // false
mock.timesCalled; // 0
callApi(); //  { result: "ok" }
mock.called; // true
mock.timesCalled; // true
```


All mocks are removed when opening a different page with `browser.open` unless the option `clearRequestMocks` is set to false.

**removeMock(url, method?)**    
Removes the mock with the given url and method. If the original mock has a method, removeMock must provide the same method.

**clearRequests()**    
Clears the list of requests.

**clearMocks()**    
Remove all the request mocks.

### Filtering Requests
To filter the requests made by the browser, you can use `browser.request.filter`.

For example, to filter requests with status code of 200:

```js
const filteredRequests = browser.requests.filter.status(200).requests;
```

The available filters are:

**url(value)**    
Filters by the given url. The url can be a string or a regex.

```js
browser.requests.filter.url("http://localhost:8002/api").requests;
```

**method(value)**    
Filters by request method (`GET`, `POST`,...)

**status(value)**    
Filters by response status (`200`, `400`)

**fromCache(value=true)**    
Filters whether the response comes from the browser cache or not.

**responseHeaders(headers)**   
Filters requests where the response has all the given headers with the given values. The expected value can be a string or regex.

```js
browser.requests.filter.responseHeaders({
    'content-type': /html/,
})
```

**ok(isOk=true)**    
Filters request which response are considered successfull (status is between 200 and 299).


Filters can be joined to perform a filter of several fields.

```js
//Filters all the POST requests made to any url with api that are not cached and returned a success code
browser.filter.url(/api/).method("POST").ok().fromCache(false).requests;
```

Not how filtering requests don't require the use of `await`.

> Keep in mind that some filters like status require the requests to be finished. Use `await browser.wait()` before filtering to make sure the requests was completed.

### Requests Assertions
Assertions related requests can be accessed through `browser.assert.request`. Note that in assertions, request is singular.

Like filters, request assertion don't need `await` and can be concatenated. All the assertions will check that at least one request with the given constraints was made.

**url(expected, msg?)**    
Asserts that at least one request is made to the given url. The url can be a string or regex.

```js
browser.assert.request.url(/api/);
```

**method(expected, msg?)**    
Asserts that at least one request was made with the given method (`GET`, `POST`, ...).

```js
browser.assert.request.method("GET");
```

**status(expected, msg?)**    
Asserts that a response was received with the given status.

```js
browser.assert.request.status(200);
```

> Note that this method requires the request to be finished.

**responseHeaders(expected, msg?)**    
Asserts that a response was received with the given headers. The expected variable is an object with one or more key values representing the expected headers. The value can be either a string or regex.

```js
browser.requests.assert.responseHeaders({
    'content-type': /html/,
})
```

**ok(expected=true, msg?)**    
Asserts that an successful response was received (status is between 200 and 299), or false if false is given.


Concatenating multiple assertions is possible:

```js
// Asserts that a POST method was done to the api endpoint
browser.assert.request.method("POST").url("localhost:8000/api");
```

> Negative assertions are not supported for requests

## Errors
Wendigo errors can be accessed through `Wendigo.Errors`. These Errors will be thrown by Wendigo browser:

**AssertionError**   
Same as Node.js Assertion Error. It will be throw for any assertion.

**QueryError**    
Error defining a problem with a DOM query. Generally Thrown as an unexpected result of a query made in an action or assertion.

**FatalError**    
Defines a Fatal Error with Puppeteer (e.g. a connection error)

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

## Development
These instructions assume node>8.0.0 and npm installed:

1. Clone the git repository (`dev` branch)
2. `npm install`
3. `npm test` to execute the tests
  * `npm run lint` to execute the linting tests

Before doing a commit or PR to the `dev` branch, make sure both the tests and lint tests pass.

### Architecture

* `Wendigo`: The main class exported by the module, provides the base interface to instantiate the browser class.
  * `BrowserFactory`: class takes care of the creation of the browser instance
* `Browser`: Provides all the API to connect, retrieve information and perform assertions on a webpage. The BrowserFactory will compose this class from multiple mixins and modules.
  * `mixins`: A Browser is divided in several mixins (found on the folder with the same name). These will be composed in the Browser class at runtime.
* `Modules`: A module represents an object that will be attached to the browser at runtime with a given name (e.g. assert or localStorage). All modules inherit from BrowserModule.
  * Modules are different from mixins in that the modules are attached as a separate class instance whereas mixins are composed into the same class.
  * Note that the assertion module is a composed module as well.

## Troubleshooting

### Error: Failed to launch chrome! No usable sandbox!
This error may appear when running wendigo on certain systems and in most CI services. The sandbox setup can be bypassed by setting the environment variable `NO_SANDBOX=true`.

For example `NO_SANDBOX=true npm test`.

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

Using gitlab with the default node image requires installing a few dependencies with `apt-get` before installing wendigo. Same as in travis, sandbox mode should be disabled with the env variable `NO_SANDBOX`. It is recommended to add `retry: 2` to allow the CI to execute the tests multiple times, as browser-based setup may fail frequently on CI workers:

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
  retry: 2
  script:
    - npm test
```
_Example of .gitlab-ci.yml_

### Assertion failed messages without error
If you are using node@10 and puppeteer 1.4.0 or less, you may experience messages such as `Assertion failed: No node found for selector`, this is due to a change in how `console.assertion` works in node 10 and how puppeteer uses it, these messages won't affect the tests, if the messages are a big problem for you, consider downgrading your node.js version, upgrading puppeteer if possible or overriding console.assert: `console.assert=()=>{}`.

> Remember to check [Puppeteer Troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md)

## Acknowledgements

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) and Chrome Headless as base headless browser.
* [ZombieJs](https://github.com/assaf/zombie) as inspiration of the assertion library.
* [NightmareJs](http://www.nightmarejs.org) as inspiration for part of the browser interface.
