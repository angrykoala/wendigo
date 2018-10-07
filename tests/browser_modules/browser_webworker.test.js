"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Webworkers", function() {
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

    it("Get All Webworkers", async() => {
        let workers = browser.webworkers.all();
        assert.strictEqual(workers.length, 0);
        await browser.clickText("Start Worker");
        await browser.wait();
        workers = browser.webworkers.all();
        assert.strictEqual(workers.length, 1);
    });

    it("Stop Webworkers", async() => {
        let workers = browser.webworkers.all();
        assert.strictEqual(workers.length, 0);
        await browser.clickText("Start Worker");
        await browser.wait();
        await browser.clickText("Stop Worker");
        await browser.wait();
        workers = browser.webworkers.all();
        assert.strictEqual(workers.length, 0);
    });

    it("Webworker Url", async() => {
        await browser.clickText("Start Worker");
        await browser.wait();
        const workers = browser.webworkers.all();
        assert.strictEqual(workers[0].url, "http://localhost:3456/worker.js");
    });
});
