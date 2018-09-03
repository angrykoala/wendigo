"use strict";

const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Webworkers", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.webworker);
    });

    after(async() => {
        await browser.close();
    });

    it("Assert Webworker", async() => {
        await browser.assert.webworker({
            count: 0
        });
        await browser.clickText("Start Worker");
        await browser.wait();
        await browser.assert.webworker();
        await browser.assert.webworker({
            count: 1
        });
    });

    it("Assert Webworkers Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.webworker();
        }, `Expected at least 1 webworker running, 0 found.`);
    });

    it("Assert Webworkers Count Throws", async() => {
        await browser.clickText("Start Worker");
        await browser.wait();
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.webworker({
                count: 2
            });
        }, `Expected 2 webworkers running, 1 found.`);
    });

    it("Assert Webworker Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.webworker(null, "ww fails");
        }, `ww fails`);
    });

    it("Assert Webworker Url", async() => {
        await browser.clickText("Start Worker");
        await browser.wait();
        await browser.assert.webworker({
            count: 1,
            url: "http://localhost:3456/worker.js"
        });
    });

    it("Assert Webworker Url Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.webworker({
                count: 1,
                url: "http://localhost:3456/worker.js"
            });
        }, `Expected 1 webworkers running with url "http://localhost:3456/worker.js", 0 found.`);
    });
    it("Assert Webworker Url Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.webworker({
                count: 1,
                url: "http://localhost:3456/worker.js"
            }, "ww fails");
        }, `ww fails`);
    });
});
