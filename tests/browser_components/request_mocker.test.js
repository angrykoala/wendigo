"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

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

    it("Not Mocked Request", async () => {
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mocked Request", async () => {
        await browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocked Request With String", async () => {
        await browser.requests.mock(configUrls.api, {
            body: JSON.stringify({result: "MOCK"})
        });
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocked Request With Method", async () => {
        await browser.requests.mock(configUrls.api, mockResponse, "GET");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Invalid Mocked Request", async () => {
        await browser.requests.mock("Not API", mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Invalid Mocked Request With Method", async () => {
        await browser.requests.mock(configUrls.api, mockResponse, "POST");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Mocked Request Priority", async () => {
        const mockResponse2 = {
            body: JSON.stringify({result: "DUMMY"})
        };
        await browser.requests.mock(configUrls.api, mockResponse, "GET");
        await browser.requests.mock(configUrls.api, mockResponse2); // Less Priority
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocked Request Priority", async () => {
        const mockResponse2 = {
            body: JSON.stringify({result: "DUMMY"})
        };
        await browser.requests.mock(configUrls.api, mockResponse2);
        await browser.requests.mock(configUrls.api, mockResponse); // Overrides
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocks Clears On Open", async () => {
        await browser.requests.mock(configUrls.api, mockResponse);
        await browser.open(configUrls.requests);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Clear Mocks", async () => {
        await browser.requests.mock(configUrls.api, mockResponse);
        await browser.requests.clearMocks();
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Remove Mock", async () => {
        await browser.requests.mock(configUrls.api, mockResponse, "GET");
        await browser.requests.removeMock(configUrls.api, "GET");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "DUMMY");
    });

    it("Remove Inexisting Mock", async () => {
        await browser.requests.mock(configUrls.api, mockResponse, "GET");
        await browser.requests.removeMock(configUrls.api, "POST");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

    it("Mocker Object", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.called, false);
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
        assert.strictEqual(mock.called, true);
    });

    it("Mocker Object timesCalled", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.timesCalled, 0);
        await browser.clickText("click me");
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
        assert.strictEqual(mock.timesCalled, 2);
    });

    it("Mocker Object Assertion", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        assert.strictEqual(mock.called, false);
        await browser.clickText("click me");
        await browser.wait(100);
        mock.assert.called();
    });

    it("Mocker Object Assertion Throws", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        await utils.assertThrowsAssertionAsync (async () => {
            await mock.assert.called();
        }, `Mock of ${configUrls.api} not called.`);
    });

    it("Mocker Object Assertion Throws With Message", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        await utils.assertThrowsAssertionAsync (async () => {
            await mock.assert.called(undefined, "called throws");
        }, `called throws`);
    });

    it("Mocker Object Assertion Times", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        mock.assert.called(0);
        await browser.clickText("click me");
        await browser.wait(100);
        mock.assert.called(1);
        await browser.clickText("click me");
        await browser.wait(100);
        mock.assert.called(2);
    });

    it("Mocker Object Assertion Times Throws", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);
        await browser.clickText("click me");
        await browser.wait(100);

        await utils.assertThrowsAssertionAsync (async () => {
            await mock.assert.called(2);
        }, `Mock of ${configUrls.api} not called 2 times.`);
    });

    it("Mocker Object Assertion Times Throws", async () => {
        const mock = await browser.requests.mock(configUrls.api, mockResponse);

        await utils.assertThrowsAssertionAsync (async () => {
            await mock.assert.called(2, "called fails");
        }, `called fails`);
    });

    it("Keep Mocks On Open", async () => {
        await browser.requests.mock(configUrls.api, mockResponse);
        await browser.open(configUrls.requests, {clearRequestMocks: false});
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.text("#result", "MOCK");
    });

});
