"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Requests Filter", function() {
    this.timeout(5000);
    let browser;

    afterEach(async() => {
        await browser.close();
        await Wendigo.stop();
    });

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
    });

    it("Favicon Loads Only On First Open", async() => {
        await Wendigo.stop();
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.filter.url(/favicon/)._requests.length, 0); // 0 if headless, else 1 (favicon is not loaded on headless)
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.filter.url(/favicon/)._requests.length, 0);
    });

    it("Requests Filter By URL", async () => {
        assert.strictEqual(await browser.requests.all.length, 2);
        assert.strictEqual(await browser.requests.filter.url("no-match")._requests.length, 0);
        assert.strictEqual(await browser.requests.filter.url(/html/)._requests.length, 1);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.all.length, 3);
    });

    it("Requests Filter By Method", async () => {
        assert.strictEqual(await browser.requests.filter.method("GET")._requests.length, 2);
        await browser.wait(500);
        assert.strictEqual(await browser.requests.filter.method("POST")._requests.length, 0);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.filter.method("GET")._requests.length, 3);
    });

    it("Requests Filter By ResourceType", async () => {
        assert.strictEqual(await browser.requests.filter.resourceType("document")._requests.length, 1);
        await browser.wait(500);
        assert.strictEqual(await browser.requests.filter.resourceType("stylesheet")._requests.length, 1);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.filter.resourceType("xhr")._requests.length, 1);
        assert.strictEqual(await browser.requests.filter.resourceType("koala")._requests.length, 0);
    });

    it("Requests Filter By Status", async () => {
        assert.strictEqual(await browser.requests.filter.status(200)._requests.length, 2);
        assert.strictEqual(await browser.requests.filter.status(900)._requests.length, 0);
    });

    it("Requests Filter By FromCache", async () => {
        assert.strictEqual(await browser.requests.filter.fromCache(false)._requests.length, 2);
        assert.strictEqual(await browser.requests.filter.fromCache()._requests.length, 0);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.filter.fromCache(false)._requests.length, 2);
    });

    it("Requests Filter By Headers", async () => {
        assert.strictEqual(await browser.requests.filter.headers({
            'content-type': /html/,
            'content-length': '312'
        })._requests.length, 1);
        assert.strictEqual(await browser.requests.filter.headers({
            'content-type': /html/,
            'content-length': '0'
        })._requests.length, 0);
        assert.strictEqual(await browser.requests.filter.headers({
            'content-type': "text/css; charset=UTF-8"
        })._requests.length, 1);
    });

    it("Requests Filter By OK", async () => {
        assert.strictEqual(await browser.requests.filter.ok(false)._requests.length, 0);
        assert.strictEqual(await browser.requests.filter.ok()._requests.length, 2);
    });
});
