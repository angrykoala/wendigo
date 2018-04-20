"use strict";

const Wendigo = require('../../lib/wendigo');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Requests Filter", function() {
    this.timeout(5000);
    let browser;


    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
    });

    afterEach(async() => {
        await browser.close();
    });

    it("All Requests", async () => {
        const requests = await browser.requests.all.length;
        await browser.clickText("click me");
        await browser.wait(10);
        assert.strictEqual(await browser.requests.all.length, requests + 1);
        await browser.clickText("click me");
        await browser.wait(10);
        assert.strictEqual(await browser.requests.all.length, requests + 2);
    });

    it("Request Between Multiple Browsers", async () => {
        const requests = await browser.requests.all.length;
        await browser.close();
        browser = await Wendigo.createBrowser();
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.all.length, requests);
    });

    it("Requests Filter By URL", async () => {
        assert.strictEqual(await browser.requests.filter.url("no-match")._requests.length, 0);
        assert.strictEqual(await browser.requests.filter.url(configUrls.requests)._requests.length, 1);
        await browser.clickText("click me");
        await browser.wait();
        assert.strictEqual(await browser.requests.filter.url(/api/)._requests.length, 1);
    });

    it("Requests Filter By Method", async () => {
        assert.strictEqual(await browser.requests.filter.method("GET")._requests.length, 2);
        assert.strictEqual(await browser.requests.filter.method("POST")._requests.length, 0);
        await browser.clickText("click me");
        await browser.wait();
        assert.strictEqual(await browser.requests.filter.method("GET")._requests.length, 3);
    });

    it("Requests Filter By Status", async () => {
        const requests = await browser.requests.filter.status(200)._requests.length;
        await browser.clickText("click me");
        await browser.wait();
        assert.strictEqual(await browser.requests.filter.status(200)._requests.length, requests + 1);
        assert.strictEqual(await browser.requests.filter.status(900)._requests.length, 0);
    });


    it("Requests Filter By Headers", async () => {
        await browser.wait();
        assert.strictEqual(await browser.requests.filter.responseHeaders({
            'content-type': /html/
        })._requests.length, 1);
        assert.strictEqual(await browser.requests.filter.responseHeaders({
            'content-type': /html/,
            'content-length': '0'
        })._requests.length, 0);
        assert.strictEqual(await browser.requests.filter.responseHeaders({
            'content-type': "text/css; charset=UTF-8"
        })._requests.length, 1);

        assert.strictEqual(await browser.requests.filter.responseHeaders({
            'content-type': /json/
        })._requests.length, 0);
        await browser.clickText("click me");
        await browser.wait();
        assert.strictEqual(await browser.requests.filter.responseHeaders({
            'content-type': /json/
        })._requests.length, 1);
    });

    it("Requests Filter By OK", async () => {
        const okRequests = await browser.requests.filter.ok()._requests.length;
        const notOkRequests = await browser.requests.filter.ok(false)._requests.length;
        await browser.clickText("click me");
        await browser.wait();

        assert.strictEqual(await browser.requests.filter.ok()._requests.length, okRequests + 1);
        assert.strictEqual(await browser.requests.filter.ok(false)._requests.length, notOkRequests);
    });

    it("Multiple Requests Filters", async () => {
        await browser.clickText("click me");
        await browser.wait();
        assert.strictEqual(await browser.requests.filter.url(/api/).method("GET")._requests.length, 1);
        assert.strictEqual(await browser.requests.filter.url(/api/).method("POST")._requests.length, 0);
    });
});
