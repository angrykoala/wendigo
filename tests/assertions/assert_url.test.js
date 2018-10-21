"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const utils = require('../test_utils');
const configUrls = require('../config.json').urls;


describe("Assert Url", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Url", async() => {
        await browser.open(configUrls.index);
        await browser.assert.url(configUrls.index);
    });

    it("Url With Regex", async() => {
        await browser.open(configUrls.index);
        await browser.assert.url(/index/);
    });

    it("Url Throws", async() => {
        const invalidUrl = "http://localhost/not_the_url";
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.url(invalidUrl);
        }, `Expected url to be "${invalidUrl}", "${configUrls.index}" found`, configUrls.index, invalidUrl);
    });

    it("Url With Regex Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.url(/not-url/);
        }, `Expected url to be "/not-url/", "${configUrls.index}" found`, configUrls.index, "/not-url/");
    });

    it("Url Throws With Custom Message", async() => {
        const invalidUrl = "http://localhost/not_the_url";
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.url(invalidUrl, "invalid url");
        }, `invalid url`, configUrls.index, invalidUrl);
    });

    it("Not Url", async() => {
        const invalidUrl = "http://localhost/invalid_url";
        await browser.open(configUrls.index);
        await browser.assert.not.url(invalidUrl);
    });

    it("Not Url Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.url);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.url(configUrls.index);
        }, `Expected url not to be "${configUrls.index}"`);
    });

    it("Not Url Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.url);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.url(configUrls.index, "not url failed");
        }, `not url failed`);
    });

    it("Redirect", async() => {
        await browser.open(configUrls.redirect);
        await browser.assert.url(configUrls.index);
        await browser.assert.redirect();
    });

    it("Redirect Throws", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.redirect();
        }, "Expected current url to be a redirection.");
    });

    it("Redirect Throws Custom Message", async() => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.redirect("redirect fails");
        }, "redirect fails");
    });

    it("Not Redirect", async() => {
        await browser.open(configUrls.index);
        await browser.assert.url(configUrls.index);
        await browser.assert.not.redirect();
    });

    it("Not Redirect Throws", async() => {
        await browser.open(configUrls.redirect);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.redirect();
        }, "Expected current url not to be a redirection.");
    });

    it("Not Redirect Throws Custom Message", async() => {
        await browser.open(configUrls.redirect);
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.redirect("not redirect fails");
        }, "not redirect fails");
    });
});
