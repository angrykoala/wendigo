"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Requests Redirect", function() {
    this.timeout(5000);
    let browser;

    beforeEach(async() => {
        browser = await Wendigo.createBrowser({log: true});
        await browser.open(configUrls.requestsFake);
    });

    afterEach(async() => {
        await browser.close();
    });

    it("Redirect Requests", async() => {
        const mock = await browser.requests.mock(configUrls.fakeApi, {
            redirectTo: configUrls.api
        });
        await browser.clickText("click me");
        await browser.wait(100);
        await mock.assert.called();
        await browser.assert.text("#result", "DUMMY");
    });


    it("Redirect Requests With QueryString", async() => {
        const redirectMock = await browser.requests.mock(configUrls.fakeApi, {
            redirectTo: configUrls.api
        });
        await browser.clickText("query");
        await browser.wait(100);
        await redirectMock.assert.called();
        await browser.assert.text("#result", "QUERY");
    });
});
