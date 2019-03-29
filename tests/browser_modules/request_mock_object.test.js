"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Requests Mock Object", function() {
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

    it("Mocker Object", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.called, false);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
        assert.strictEqual(mock.called, true);
        assert.strictEqual(mock.auto, true);
    });

    it("Mocker Object timesCalled", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.timesCalled, 0);
        await browser.clickText("click me");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
        assert.strictEqual(mock.timesCalled, 2);
    });

    it("Mocker Object Assertion", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.called, false);
        await browser.clickText("click me");
        await browser.wait(100);
        mock.assert.called();
    });

    it("Mocker Object Assertion Throws", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await utils.assertThrowsAssertionAsync(async() => {
            await mock.assert.called();
        }, `[assert.called] Mock of ${configUrls.api} not called.`);
    });

    it("Mocker Object Assertion Throws With Message", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await utils.assertThrowsAssertionAsync(async() => {
            await mock.assert.called(undefined, "called throws");
        }, `[assert.called] called throws`);
    });

    it("Mocker Object Assertion Times", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        mock.assert.called(0);
        await browser.clickText("click me");
        await browser.wait(100);
        mock.assert.called(1);
        await browser.clickText("click me");
        await browser.wait(100);
        mock.assert.called(2);
    });

    it("Mocker Object Assertion Times Throws", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);

        await utils.assertThrowsAssertionAsync(async() => {
            await mock.assert.called(2);
        }, `[assert.called] Mock of ${configUrls.api} not called 2 times.`);
    });

    it("Mocker Object Assertion Times Throws Custom Message", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.immediate, true);
        await utils.assertThrowsAssertionAsync(async() => {
            await mock.assert.called(2, "called fails");
        }, `[assert.called] called fails`);
    });

    it("Mock With Trigger", async() => {
        const response = Object.assign({
            auto: false
        }, mockResponse);
        const mock = browser.requests.mock(configUrls.api, response);
        assert.strictEqual(mock.auto, false);
        await browser.clickText("click me");
        await browser.assert.not.text("#result", "MOCK");
        mock.trigger();
        await browser.wait(20);
        await browser.assert.text("#result", "MOCK");
    });

    it("Auto Mock With Trigger", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await utils.assertThrowsAsync(async() => {
            await mock.trigger();
        }, `FatalError: [trigger] Cannot trigger auto request mock.`);
    });

    it("Wait Until Mock Called", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        setTimeout(() => {
            browser.clickText("click me");
        }, 300);
        await browser.assert.not.text("#result", "MOCK");
        await mock.waitUntilCalled();
        await browser.assert.text("#result", "MOCK");
    });

    it("Wait After Mock Called", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("click me");
        await browser.wait(50);
        await browser.assert.text("#result", "MOCK");
        await mock.waitUntilCalled();
        await browser.assert.text("#result", "MOCK");
    });

    it("Wait Until Mock Called Timeout", async() => {
        const mock = browser.requests.mock(configUrls.api, mockResponse);
        await browser.assert.not.text("#result", "MOCK");
        await utils.assertThrowsAsync(async() => {
            await mock.waitUntilCalled(10);
        }, `TimeoutError: [waitUntilCalled] Wait until mock of "${configUrls.api}" is called, timeout of 10ms exceeded.`);
    });

    it("Mock Assert Post Body", async() => {
        const mock = browser.requests.mock(configUrls.api, {
            method: "POST"
        });
        await browser.clickText("post");
        await mock.waitUntilCalled();
        await mock.assert.postBody({
            data: "example data"
        });
    });
    it("Mock Assert Post Body With Regex", async() => {
        const mock = browser.requests.mock(configUrls.api, {
            method: "POST"
        });
        await browser.clickText("post");
        await mock.waitUntilCalled();
        await mock.assert.postBody(/example/);
    });
    it("Mock Assert Post Body Throws", async() => {
        const mock = browser.requests.mock(configUrls.api, {
            method: "POST"
        });
        await browser.clickText("post");
        await mock.waitUntilCalled();
        await utils.assertThrowsAssertionAsync(async() => {
            await mock.assert.postBody({
                data: "example Fake data"
            });
        }, `[assert.postBody] Expected mock to be called with body "{"data":"example Fake data"}".`);
    });

    it("Mock Assert Post Body Throws Custom Message", async() => {
        const mock = browser.requests.mock(configUrls.api, {
            method: "POST"
        });
        await browser.clickText("post");
        await mock.waitUntilCalled();
        await utils.assertThrowsAssertionAsync(async() => {
            await mock.assert.postBody({
                data: "example Fake data"
            }, "postbody fails");
        }, `[assert.postBody] postbody fails`);
    });

    it("Mock With Trigger And Response", async() => {
        const response = Object.assign({
            auto: false
        }, mockResponse);
        const mock = browser.requests.mock(configUrls.api, response);
        assert.strictEqual(mock.auto, false);
        await browser.clickText("click me");
        await browser.assert.not.text("#result", "MOCK");
        mock.trigger({
            body: {result: "MOCK2"}
        });
        await browser.wait(20);
        await browser.assert.text("#result", "MOCK2");
        assert.strictEqual(mock._response.body, JSON.stringify({result: "MOCK"}));
    });
});
