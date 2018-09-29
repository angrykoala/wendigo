"use strict";

const Wendigo = require('../../lib/wendigo');
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
        await browser.assert.request.url(/api/).exactly(0);
        await browser.waitForRequest("http://localhost:3456/api");
        await browser.assert.request.url(/api/);
    });

    it("Wait For Request With Mock", async() => {
        await browser.requests.mock("http://localhost:3456/api");
        setTimeout(() => {
            browser.clickText("click me");
        }, 100);
        await browser.assert.request.url(/api/).exactly(0);
        await browser.waitForRequest("http://localhost:3456/api");
        await browser.assert.request.url(/api/);
    });

    it("Wait For Response With Mock", async() => {
        await browser.requests.mock("http://localhost:3456/api", {
            delay: 500,
            body: "test"
        });
        await browser.clickText("click me");
        await browser.wait(10);
        await browser.assert.request.url(/api/).exactly(1);
        await browser.assert.request.url(/api/).responseBody("test").exactly(0);
        await browser.waitForResponse("http://localhost:3456/api");
        await browser.assert.request.url(/api/).responseBody("test");
    });

    it("Wait For Request Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.waitForRequest("http://localhost:3456/api", 10);
        }, `TimeoutError: Waiting for request "http://localhost:3456/api", timeout of 10ms exceeded.`);
    });

    it("Wait For Response Timeout", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.waitForResponse("http://localhost:3456/api", 10);
        }, `TimeoutError: Waiting for response "http://localhost:3456/api", timeout of 10ms exceeded.`);
    });
});
