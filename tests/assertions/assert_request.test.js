"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Requests", function() {
    this.timeout(5000);
    let browser;


    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
    });

    afterEach(async() => {
        await browser.close();
    });

    it("Assert Requests By URL", async () => {
        browser.assert.request.url(configUrls.requests);
        await browser.clickText("click me");
        await browser.wait();
        browser.assert.request.url(/api/);
    });

    it("Assert Requests By URL Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.url(/api/);
        }, `Expected request with url "/api/" to exist.`);
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.url("wagablabla");
        }, `Expected request with url "wagablabla" to exist.`);
    });

    it("Assert Requests By URL Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.url(/api/, "url fails");
        }, `url fails`);
    });

    it("Assert Requests By Method", async () => {
        browser.assert.request.method("GET");
    });

    it("Assert Requests By Method Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.method("POST");
        }, `Expected request with method "POST" to exist.`);
    });

    it("Assert Requests By Method Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.method("POST", "method fails");
        }, `method fails`);
    });

    it("Assert Requests By Status", async () => {
        browser.assert.request.status(200);
    });

    it("Assert Requests By Status Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.status(900);
        }, `Expected request with status "900" to exist.`);
    });

    it("Assert Requests By Status Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.status(900, "status fails");
        }, `status fails`);
    });

    it("Assert Requests By Response Headers", async () => {
        browser.assert.request.responseHeaders({
            'content-type': /html/
        });
        await browser.clickText("click me");
        await browser.wait();
        browser.assert.request.responseHeaders({
            'content-type': /json/
        });
    });

    it("Assert Requests By Response Headers Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.responseHeaders({
                'content-type': /html/,
                'content-length': '0'
            });
        }, `Expected response with headers "content-type: /html/, content-length: 0" to exist.`);
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.responseHeaders({
                'content-type': /json/
            });
        }, `Expected response with headers "content-type: /json/" to exist.`);
    });

    it("Assert Requests By Response Headers Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.responseHeaders({
                'content-type': /html/,
                'content-length': '0'
            }, "headers fail");
        }, `headers fail`);
    });

    it("Assert Requests By Ok", async () => {
        browser.assert.request.ok();
    });

    it("Assert Requests By Ok Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.ok(false);
        }, `Expected not ok request to exist.`);
    });

    it("Assert Requests By Ok Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.ok(false, "ok fails");
        }, `ok fails`);
    });

    it("Assert Requests With Multiple Filters", async () => {
        await browser.clickText("click me");
        await browser.wait();
        browser.assert.request.url(configUrls.requests).method("GET");
    });

    it("Assert Requests With Multiple Filters Throws", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.url(configUrls.requests).method("POST");
        }, `Expected request with method "POST" to exist.`);
    });

    it("Assert Requests With Multiple Filters Throws Custom Message", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.url(configUrls.requests, "url error").method("POST", "method error");
        }, `method error`);
    });

    it("Assert Requests With Multiple Filters Throws On First Filter", async () => {
        await utils.assertThrowsAssertionAsync(async () => {
            browser.assert.request.url("wagablabla").method("GET");
        }, `Expected request with url "wagablabla" to exist.`);
    });
});
