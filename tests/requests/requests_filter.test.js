"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Requests Filter", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    beforeEach(async() => {
        await browser.open(configUrls.requests);
    });

    it("Favicon Loads Only On First Open", async() => {
        await Wendigo.stop();
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.filter.url(/favicon/).length, 0); // 0 if headless, else 1
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.filter.url(/favicon/).length, 0);
    });

    it("Requests Filter By URL", async () => {
        assert.strictEqual(await browser.requests.all.length, 2);
        assert.strictEqual(await browser.requests.filter.url("no-match").length, 0);
        assert.strictEqual(await browser.requests.filter.url(/html/).length, 1);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.all.length, 3);
    });

    it("Requests Filter By Method", async () => {
        assert.strictEqual(await browser.requests.filter.method("GET").length, 2);
        assert.strictEqual(await browser.requests.filter.method("POST").length, 0);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.filter.method("GET").length, 3);
    });

    it("Requests Filter By ResourceType", async () => {
        assert.strictEqual(await browser.requests.filter.resourceType("document").length, 1);
        assert.strictEqual(await browser.requests.filter.resourceType("stylesheet").length, 1);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.filter.resourceType("xhr").length, 1);
    });

    it("Requests Filter By Status", async () => {
        assert.strictEqual(await browser.requests.filter.status(200).length, 2);
    });

    it("Requests Filter By FromCache", async () => {
        assert.strictEqual(await browser.requests.filter.fromCache(false).length, 2);
        assert.strictEqual(await browser.requests.filter.fromCache().length, 0);
        await browser.clickText("click me");
        assert.strictEqual(await browser.requests.filter.fromCache(false).length, 2);
    });

    it("Requests Filter By FromCache", async () => {
        assert.strictEqual(await browser.requests.filter.headers({
            'content-type': /html/,
            'content-length': '312'
        }).length, 1);
        assert.strictEqual(await browser.requests.filter.headers({
            'content-type': /html/,
            'content-length': '0'
        }).length, 0);
        assert.strictEqual(await browser.requests.filter.headers({
            'content-type': "text/css; charset=UTF-8"
        }).length, 1);
    });

    it("Requests Filter By OK", async () => {
        assert.strictEqual(await browser.requests.filter.ok(false).length, 0);
        assert.strictEqual(await browser.requests.filter.ok().length, 2);
    });
});
