"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Wait For Request", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.requests);
    });

    after(async() => {
        await browser.close();
    });

    it("Wait For Request", async() => {
        setTimeout(() => {
            browser.clickText("click me");
        }, 100);
        await browser.assert.requests.url(/api/).exactly(0);
        await browser.requests.waitForRequest("http://localhost:3456/api");
        await browser.assert.requests.url(/api/);
    });

    it("Wait For Request Already Made", async() => {
        await browser.clickText("click me");
        await browser.wait(10);
        await browser.assert.requests.url(/api/).exactly(1);
        await browser.requests.waitForRequest("http://localhost:3456/api");
        await browser.assert.requests.url(/api/).exactly(1);
    });

    it("Wait For Request With Mock", async() => {
        await browser.requests.mock("http://localhost:3456/api");
        setTimeout(() => {
            browser.clickText("click me");
        }, 100);
        await browser.assert.requests.url(/api/).exactly(0);
        await browser.requests.waitForRequest("http://localhost:3456/api");
        await browser.assert.requests.url(/api/);
    });

    it("Wait For Response With Mock", async() => {
        await browser.requests.mock("http://localhost:3456/api", {
            delay: 500,
            body: "test"
        });
        await browser.clickText("click me");
        await browser.wait(10);
        await browser.assert.requests.url(/api/).exactly(1);
        await browser.assert.requests.url(/api/).responseBody("test").exactly(0);
        await browser.requests.waitForResponse("http://localhost:3456/api", 1000);
        await browser.assert.requests.url(/api/).responseBody("test");
    });

    it("Wait For Response Already Made", async() => {
        await browser.requests.mock("http://localhost:3456/api", {
            body: "test"
        });
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.requests.url(/api/).exactly(1);
        await browser.assert.requests.url(/api/).responseBody("test").exactly(1);
        await browser.requests.waitForResponse("http://localhost:3456/api");
        await browser.assert.requests.url(/api/).responseBody("test").exactly(1);
    });

    it("Wait For Request Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.requests.waitForRequest("http://localhost:3456/api", 10);
        }, `TimeoutError: [waitForRequest] Waiting for request "http://localhost:3456/api", timeout of 10ms exceeded.`);
    });

    it("Wait For Response Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.requests.waitForResponse("http://localhost:3456/api", 10);
        }, `TimeoutError: [waitForResponse] Waiting for response "http://localhost:3456/api", timeout of 10ms exceeded.`);
    });

    it("Wait For Next Request", async() => {
        setTimeout(() => {
            browser.clickText("click me");
        }, 100);
        await browser.assert.requests.url(/api/).exactly(0);
        await browser.requests.waitForNextRequest("http://localhost:3456/api");
        await browser.assert.requests.url(/api/);
    });

    it("Wait For Next Request Already Made", async() => {
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.requests.url(/api/).exactly(1);
        await utils.assertThrowsAsync(async() => {
            await browser.requests.waitForNextRequest("http://localhost:3456/api", 10);
        }, `TimeoutError: [waitForNextRequest] Waiting for request "http://localhost:3456/api", timeout of 10ms exceeded.`);
    });

    it("Wait For Next Response With Mock", async() => {
        await browser.requests.mock("http://localhost:3456/api", {
            delay: 500,
            body: "test"
        });
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.requests.url(/api/).exactly(1);
        await browser.assert.requests.url(/api/).responseBody("test").exactly(0);
        await browser.requests.waitForNextResponse("http://localhost:3456/api", 1000);
        await browser.assert.requests.url(/api/).responseBody("test");
    });

    it("Wait For Next Response Already Made", async() => {
        await browser.requests.mock("http://localhost:3456/api", {
            body: "test"
        });
        await browser.clickText("click me");
        await browser.wait(100);
        await browser.assert.requests.url(/api/).exactly(1);
        await browser.assert.requests.url(/api/).responseBody("test").exactly(1);
        await utils.assertThrowsAsync(async() => {
            await browser.requests.waitForNextResponse("http://localhost:3456/api", 10);
        }, `TimeoutError: [waitForNextResponse] Waiting for response "http://localhost:3456/api", timeout of 10ms exceeded.`);
        await browser.assert.requests.url(/api/).responseBody("test").exactly(1);
    });
});
