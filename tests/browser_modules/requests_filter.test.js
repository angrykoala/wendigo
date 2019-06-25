"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe("Requests Filter", function() {
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

    it("All Requests", async() => {
        const requests = browser.requests.all().length;
        await browser.clickText("click me");
        await browser.wait(10);
        assert.strictEqual(browser.requests.all().length, requests + 1);
        await browser.clickText("click me");
        await browser.wait(10);
        assert.strictEqual(browser.requests.all().length, requests + 2);
    });

    it("Request Between Multiple Browsers", async() => {
        const requests = await browser.requests.all().length;
        await browser.close();
        browser = await Wendigo.createBrowser(); // eslint-disable-line require-atomic-updates
        await browser.open(configUrls.requests);
        assert.strictEqual(await browser.requests.all().length, requests);
    });

    it("Requests Filter By URL", async() => {
        const reqs1 = await browser.requests.filter.url("no-match").requests;
        assert.strictEqual(reqs1.length, 0);
        const reqs2 = await browser.requests.filter.url(configUrls.requests).requests;
        assert.strictEqual(reqs2.length, 1);
        await browser.clickText("click me");
        await browser.wait();
        const reqs3 = await browser.requests.filter.url(/api/).requests;
        assert.strictEqual(reqs3.length, 1);
    });

    it("Requests Filter By Method", async() => {
        let req = await browser.requests.filter.url(/api/).requests;
        assert.strictEqual(req.length, 0);
        req = await browser.requests.filter.method("GET").requests;
        assert.strictEqual(req.length, 2);
        req = await browser.requests.filter.method("POST").requests;
        assert.strictEqual(req.length, 0);
        await browser.clickText("click me");
        await browser.wait();
        req = await browser.requests.filter.method("GET").requests;
        assert.strictEqual(req.length, 3);
    });

    it("Requests Filter By Status", async() => {
        const requests = await browser.requests.filter.status(200).requests;
        await browser.clickText("click me");
        await browser.wait();
        let req = await browser.requests.filter.status(200).requests;
        assert.strictEqual(req.length, requests.length + 1);
        req = await browser.requests.filter.status(900).requests;
        assert.strictEqual(req.length, 0);
    });

    it("Requests Filter By Headers", async() => {
        await browser.wait();
        let req = await browser.requests.filter.responseHeaders({
            'content-type': /html/
        }).requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.responseHeaders({
            'content-type': /html/,
            'content-length': '0'
        }).requests;
        assert.strictEqual(req.length, 0);
        req = await browser.requests.filter.responseHeaders({
            'content-type': "text/css; charset=UTF-8"
        }).requests;
        assert.strictEqual(req.length, 1);

        req = await browser.requests.filter.responseHeaders({
            'content-type': /json/
        }).requests;
        assert.strictEqual(req.length, 0);
        await browser.clickText("click me");
        await browser.wait();
        req = await browser.requests.filter.responseHeaders({
            'content-type': /json/
        }).requests;
        assert.strictEqual(req.length, 1);
    });

    it("Requests Filter By OK", async() => {
        const okRequests = await browser.requests.filter.ok().requests;
        const notOkRequests = await browser.requests.filter.ok(false).requests;
        await browser.clickText("click me");
        await browser.wait();

        let req = await browser.requests.filter.ok().requests;
        assert.strictEqual(req.length, okRequests.length + 1);
        req = await browser.requests.filter.ok(false).requests;
        assert.strictEqual(req.length, notOkRequests.length);
    });

    it("Multiple Requests Filters", async() => {
        await browser.clickText("click me");
        await browser.wait();
        let req = await browser.requests.filter.url(/api/).method("GET").requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.url(/api/).method("POST").requests;
        assert.strictEqual(req.length, 0);
    });


    it("Filter Mock By Body", async() => {
        const body = JSON.stringify({
            data: "example data"
        });
        await browser.click(".post");
        await browser.wait();
        let req = await browser.requests.filter.url(/api/).method("GET").requests;
        assert.strictEqual(req.length, 0);
        req = await browser.requests.filter.url(/api/).method("POST").requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.url(/api/).postBody(body).requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.url(/api/).postBody("not body").requests;
        assert.strictEqual(req.length, 0);
    });

    it("Filter Mock By Object Body", async() => {
        const body = {
            data: "example data"
        };
        await browser.click(".post");
        await browser.wait();
        let req = await browser.requests.filter.url(/api/).method("POST").requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.url(/api/).postBody(body).requests;
        assert.strictEqual(req.length, 1);
    });

    it("Filter Mock By Regex Body", async() => {
        await browser.click(".post");
        await browser.wait();
        let req = await browser.requests.filter.url(/api/).method("POST").requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.url(/api/).postBody(/example\sdata/).requests;
        assert.strictEqual(req.length, 1);
        req = await browser.requests.filter.url(/api/).postBody(/notbody/).requests;
        assert.strictEqual(req.length, 0);
    });

    it("Filter Mock By Response Body", async() => {
        const body = {result: "DUMMY"};
        await browser.clickText("click me");
        await browser.wait();
        const afterFilter = await browser.requests.filter.url(/api/).responseBody(body).requests;
        assert.strictEqual(afterFilter.length, 1);
        const afterFilter2 = await browser.requests.filter.url(/api/).responseBody("not response").requests;
        assert.strictEqual(afterFilter2.length, 0);
    });

    it("Filter By Pending", async() => {
        const response = Object.assign({
            auto: false,
            body: {result: "DUMMY"}
        });
        const mock = browser.requests.mock(configUrls.api, response);
        const pending1 = await browser.requests.filter.pending().requests;
        assert.strictEqual(pending1.length, 0);

        await browser.clickText("click me");
        await browser.wait(10);
        const pending2 = await browser.requests.filter.pending().requests;
        assert.strictEqual(pending2.length, 1);
        mock.trigger();
        await browser.wait(10);
        const pending3 = await browser.requests.filter.pending().requests;
        assert.strictEqual(pending3.length, 0);
    });

    it("Filter By Resource Type", async() => {
        const pending2 = await browser.requests.filter.resourceType("fetch").requests;
        assert.strictEqual(pending2.length, 0);
        const docReqs = await browser.requests.filter.resourceType("document").requests;
        assert.strictEqual(docReqs.length, 1);
        const styleReqs = await browser.requests.filter.resourceType("stylesheet").requests;
        assert.strictEqual(styleReqs.length, 1);
    });

    it("Filter By Resource Type Multiple Fetch Requests", async() => {
        const pending1 = await browser.requests.filter.resourceType("fetch").requests;
        assert.strictEqual(pending1.length, 0);

        await browser.clickText("click me");
        await browser.clickText("click me");
        await browser.wait(10);
        const pending2 = await browser.requests.filter.resourceType("fetch").requests;
        assert.strictEqual(pending2.length, 2);
    });
});
