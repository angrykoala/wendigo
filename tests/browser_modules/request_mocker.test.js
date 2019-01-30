"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Requests Mocker", function() {
    this.timeout(5000);
    let browser;
    const mockResponse = {
        body: {result: "MOCK"}
    };

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
    });

    afterEach(async() => {
        await browser.close();
    });

    it("Not Mocked Request", async() => {
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mocked Request", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("click me");
        await mock.waitUntilCalled();
        await browser.wait(1); // Delay between response and update
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocked Request With String", async() => {
        const mock = await browser.requests.mock(configUrls.api, {
            body: JSON.stringify({result: "MOCK"})
        });
        await browser.clickText("click me");
        await mock.waitUntilCalled();
        await browser.wait(1); // Delay between response and update
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocked Request With Method", async() => {
        const response = Object.assign({}, mockResponse, {method: "GET"});
        const mock = await browser.requests.mock(configUrls.api, response);
        await browser.clickText("click me");
        await mock.waitUntilCalled();
        await browser.assert.text("#result", "MOCK");
    });

    it("Invalid Mocked Request Url", () => {
        assert.throws(() => {
            browser.requests.mock("Not API", mockResponse);
        });
    });

    it("Unmatched Mocked Request", async() => {
        await browser.requests.mock(`${configUrls.api}/noturl`, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Invalid Mocked Request With Method", async() => {
        const response = Object.assign({}, mockResponse, {method: "POST"});
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mocked Request Priority", async() => {
        const mockResponse2 = {
            body: JSON.stringify({result: "DUMMY"})
        };
        const response1 = Object.assign({}, mockResponse, {method: "GET"});
        browser.requests.mock(configUrls.api, response1);
        browser.requests.mock(configUrls.api, mockResponse2); // Less Priority
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocked Request Override", async() => {
        const mockResponse2 = {
            body: JSON.stringify({result: "DUMMY"})
        };
        browser.requests.mock(configUrls.api, mockResponse2);
        browser.requests.mock(configUrls.api, mockResponse); // Overrides
        assert.strictEqual(browser.requests._requestMocker._mockedRequests.length, 1);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocks Clears On Open", async() => {
        await browser.requests.mock(configUrls.api, mockResponse);
        await browser.open(configUrls.requests);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Clear Mocks", async() => {
        await browser.requests.mock(configUrls.api, mockResponse);
        await browser.requests.clearMocks();
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Remove Mock", async() => {
        const response = Object.assign({}, mockResponse, {method: "GET"});
        browser.requests.mock(configUrls.api, response);
        await browser.requests.removeMock(configUrls.api, {method: "GET"});
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Remove Mock Without Exact Match", async() => {
        const response = Object.assign({}, mockResponse, {method: "GET"});
        browser.requests.mock(configUrls.api, response);
        await browser.requests.removeMock(configUrls.api);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Remove Inexisting Mock", async() => {
        const response = Object.assign({}, mockResponse, {method: "GET"});
        browser.requests.mock(configUrls.api, response);
        await browser.requests.removeMock(configUrls.api, {method: "POST"});
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Keep Mocks On Open", async() => {
        browser.requests.mock(configUrls.api, mockResponse);
        await browser.open(configUrls.requests, {clearRequestMocks: false});
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Interceptor Is Ready After Close", async() => {
        await browser.close();
        assert.strictEqual(browser.requests._interceptorReady, true);
    });

    it("Mock With Delay", async() => {
        const response = Object.assign({
            delay: 400
        }, mockResponse);
        const mock = browser.requests.mock(configUrls.api, response);
        assert.strictEqual(mock.immediate, false);
        await browser.clickText("click me");
        await browser.assert.not.text("#result", "MOCK");
        await browser.wait(100);
        await browser.assert.not.text("#result", "MOCK");
        await browser.wait(400);
        await browser.assert.text("#result", "MOCK");
    });


    it("Mock With QueryString", async() => {
        browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With Explicit QueryString", async() => {
        const response = Object.assign({
            queryString: "query=hi"
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With Explicit QueryString Object", async() => {
        const response = Object.assign({
            queryString: {query: "hi"}
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With Explicit QueryString Fails", async() => {
        const response = Object.assign({
            queryString: "query=not"
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mock With Explicit QueryString Fails Object", async() => {
        const response = Object.assign({
            queryString: {query: "not"}
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mock With Explicit QueryString Fails Multiple Elements", async() => {
        const response = Object.assign({
            queryString: {query: "hi",
                user: "dent"}
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mock With Explicit Empty QueryString", async() => {
        const response = Object.assign({
            queryString: {}
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mock With Explicit Empty QueryString String", async() => {
        const response = Object.assign({
            queryString: ""
        }, mockResponse);
        browser.requests.mock(configUrls.api, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mock With Explicit QueryString In Url", async() => {
        browser.requests.mock(`${configUrls.api}?query=hi`, mockResponse);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With 2 Explicit QueryString", async() => {
        const response = Object.assign({
            queryString: "query=hi"
        }, mockResponse);
        browser.requests.mock(`${configUrls.api}?query=hi`, response);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With Explicit QueryString Priority", async() => {
        const response = {
            queryString: "query=hi",
            body: {result: "MOCK2"}
        };
        browser.requests.mock(configUrls.api, response);
        browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("query");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK2");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With Regex", async() => {
        browser.requests.mock(/api/, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mock With Regex Fails", async() => {
        browser.requests.mock(/not-api/, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mock With Regex Priority", async() => {
        const response = {
            body: {result: "MOCK2"}
        };
        browser.requests.mock(configUrls.api, response);
        browser.requests.mock(/api/, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK2");
    });

    it("Get All Mocks", async() => {
        const initialMocks = browser.requests.getAllMocks();
        assert.strictEqual(initialMocks.length, 0);
        const mock = browser.requests.mock(/api/, mockResponse);
        assert.strictEqual(initialMocks.length, 0);
        assert.strictEqual(browser.requests.getAllMocks().length, 1);
        assert.strictEqual(browser.requests.getAllMocks()[0], mock);
    });
});
