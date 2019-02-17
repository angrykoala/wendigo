"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Assert Cookie", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.storage);
    });

    afterEach(async() => {
        await browser.localStorage.clear();
        await browser.cookies.clear();
    });

    after(async() => {
        await browser.close();
    });

    it("Assert Cookie", async() => {
        await browser.assert.cookies("username");
        await browser.assert.cookies("username", "arthur_dent");
    });

    it("Assert Cookie Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.cookies("not-exists");
        }, `[assert.cookies] Expected cookie "not-exists" to exist.`);
    });

    it("Assert Cookie Throws Invalid Value", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.cookies("username", "marvin");
        }, `[assert.cookies] Expected cookie "username" to have value "marvin", "arthur_dent" found.`, "arthur_dent", "marvin");
    });

    it("Assert Cookie Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.cookies("username", "marvin", "cookie fails");
        }, `[assert.cookies] cookie fails`, "arthur_dent", "marvin");
    });

    it("Assert Not Cookie", async() => {
        await browser.assert.not.cookies("not-exists");
        await browser.assert.not.cookies("username", "marvin");
    });

    it("Assert Not Cookie Throws", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.cookies("username");
        }, `[assert.not.cookies] Expected cookie "username" to not exist.`);
    });

    it("Assert Not Cookie Throws Invalid Value", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.cookies("username", "arthur_dent");
        }, `[assert.not.cookies] Expected cookie "username" to not have value "arthur_dent".`);
    });

    it("Assert Not Cookie Throws Custom Message", async() => {
        await utils.assertThrowsAssertionAsync(async() => {
            await browser.assert.not.cookies("username", "arthur_dent", "not cookie fails");
        }, `[assert.not.cookies] not cookie fails`);
    });
});
