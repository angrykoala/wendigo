"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Requests", function() {
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

    it("Assert Requests By URL", async() => {
        await browser.assert.requests.url(configUrls.requests);
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.url(/api/);
    });

    it("Assert Requests By URL Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(/api/);
        }, `[assert.requests.url] Expected request with url "/api/" to exist.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url("wagablabla");
        }, `[assert.requests.url] Expected request with url "wagablabla" to exist.`);
    });

    it("Assert Requests By URL Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(/api/, "url fails");
        }, `[assert.requests.url] url fails`);
    });

    it("Assert Requests By Method", async() => {
        await browser.assert.requests.method("GET");
    });

    it("Assert Requests By Method Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.method("POST");
        }, `[assert.requests.method] Expected request with method "POST" to exist.`);
    });

    it("Assert Requests By Method Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.method("POST", "method fails");
        }, `[assert.requests.method] method fails`);
    });

    it("Assert Requests By Status", async() => {
        await browser.assert.requests.status(200);
    });

    it("Assert Requests By Status Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.status(900);
        }, `[assert.requests.status] Expected request with status "900" to exist.`);
    });

    it("Assert Requests By Status Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.status(900, "status fails");
        }, `[assert.requests.status] status fails`);
    });

    it("Assert Requests By Response Headers", async() => {
        await browser.assert.requests.responseHeaders({
            'content-type': /html/
        });
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.responseHeaders({
            'content-type': /json/
        });
    });

    it("Assert Requests By Response Headers Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.responseHeaders({
                'content-type': /html/,
                'content-length': '0'
            });
        }, `[assert.requests.responseHeaders] Expected response with headers "content-type: /html/, content-length: 0" to exist.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.responseHeaders({
                'content-type': /json/
            });
        }, `[assert.requests.responseHeaders] Expected response with headers "content-type: /json/" to exist.`);
    });

    it("Assert Requests By Response Headers Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.responseHeaders({
                'content-type': /html/,
                'content-length': '0'
            }, "headers fail");
        }, `[assert.requests.responseHeaders] headers fail`);
    });

    it("Assert Requests By Ok", async() => {
        await browser.assert.requests.ok();
    });

    it("Assert Requests By Ok Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.ok(false);
        }, `[assert.requests.ok] Expected not ok request to exist.`);
    });

    it("Assert Requests By Ok Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.ok(false, "ok fails");
        }, `[assert.requests.ok] ok fails`);
    });

    it("Assert Requests With Multiple Filters", async() => {
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.url(configUrls.requests).method("GET");
    });

    it("Assert Requests With Multiple Filters Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(configUrls.requests).method("POST");
        }, `[assert.requests.method] Expected request with method "POST" to exist.`);
    });

    it("Assert Requests With Multiple Nested Filters Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(configUrls.requests).method("GET").method("POST");
        }, `[assert.requests.method] Expected request with method "POST" to exist.`);
    });

    it("Assert Requests With Multiple Filters Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(configUrls.requests, "url error").method("POST", "method error");
        }, `[assert.requests.method] method error`);
    });

    it("Assert Requests With Multiple Filters Throws On First Filter", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url("wagablabla").method("GET");
        }, `[assert.requests.url] Expected request with url "wagablabla" to exist.`);
    });

    it("Assert Request By Body", async() => {
        const body = JSON.stringify({
            data: "example data"
        });
        await browser.click(".post");
        await browser.wait();
        await browser.assert.requests.postBody(body);
    });

    it("Assert Request By Body Object", async() => {
        const body = {
            data: "example data"
        };
        await browser.click(".post");
        await browser.wait();
        await browser.assert.requests.postBody(body);
    });

    it("Assert Request By Body Regex", async() => {
        await browser.click(".post");
        await browser.wait();
        await browser.assert.requests.postBody(/example\sdata/);
    });

    it("Assert Request By Body Throws", async() => {
        await browser.click(".post");
        await browser.wait();
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.postBody(/notbody/);
        }, `[assert.requests.postBody] Expected request with body "/notbody/" to exist.`);
    });

    it("Assert Request By Body Throws Custom Message", async() => {
        await browser.click(".post");
        await browser.wait();
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.postBody(/notbody/, "post body error");
        }, `[assert.requests.postBody] post body error`);
    });

    it("Assert Request By Response Body", async() => {
        const body = {result: "DUMMY"};
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.responseBody(body);
    });

    it("Assert Request By Response Body Throws", async() => {
        const body = {result: "DUMMY"};

        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.responseBody(body);
        }, `[assert.requests.responseBody] Expected request with response body "{"result":"DUMMY"}" to exist.`);
    });

    it("Assert Request By Response Body Throws Custom Message", async() => {
        const body = {result: "DUMMY"};

        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.responseBody(body, "responseBody fails");
        }, `[assert.requests.responseBody] responseBody fails`);
    });

    it("Assert Request By Response Body Regex", async() => {
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.responseBody(/DUMMY/);
    });

    it("Assert Requests By Number", async() => {
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.url(/api/).exactly(1);
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.url(/api/).exactly(2);
    });

    it("Assert Requests By Number Zero", async() => {
        await browser.assert.requests.url(/api/).exactly(0);
    });

    it("Assert Requests By Number Throws", async() => {
        await browser.clickText("click me");
        await browser.wait();
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(/api/).exactly(2);
        }, `[assert.requests.exactly] Expected exactly 2 requests, 1 found.`);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(/api/).exactly(0);
        }, `[assert.requests.exactly] Expected exactly 0 requests, 1 found.`);
    });

    it("Assert Requests By Number Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.requests.url(/api/).exactly(2, "exactly fails");
        }, `[assert.requests.exactly] exactly fails`);
    });

    it("Assert Requests By Number In Chain", async() => {
        await browser.clickText("click me");
        await browser.wait();
        await browser.assert.requests.method("GET").exactly(3).url(/api/);
    });
});
