"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Cookies", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.storage);
    });

    afterEach(async() => {
        await browser.cookies.clear();
    });

    after(async() => {
        await browser.close();
    });

    it("Get All Cookies", async() => {
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 1);
        assert.strictEqual(cookies.username, "arthur_dent");
    });

    it("Get Cookie", async() => {
        const cookie = await browser.cookies.get("username");
        assert.strictEqual(cookie, "arthur_dent");
    });

    it("Get Cookie Fails", async() => {
        const cookie = await browser.cookies.get("not-cookie");
        assert.strictEqual(cookie, undefined);
    });

    it("Set Cookie", async() => {
        await browser.cookies.set("android", "marvin");
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 2);
        assert.strictEqual(cookies.username, "arthur_dent");
        assert.strictEqual(cookies.android, "marvin");
    });

    it("Delete Cookie", async() => {
        await browser.cookies.delete("username");
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 0);
        assert.strictEqual(cookies.username, undefined);
    });

    it("Delete Cookie Throws", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.cookies.delete();
        }, `Error: [cookies.delete] Delete cookie name missing`);
    });

    it("Delete Multiple Cookies", async() => {
        await browser.cookies.set("android", "marvin");
        await browser.cookies.delete(["username", "android"]);
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 0);
    });

    it("Delete Invalid Cookie", async() => {
        await browser.cookies.delete("android");
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 1);
        assert.strictEqual(cookies.username, "arthur_dent");
    });

    it("Clear Cookies", async() => {
        await browser.cookies.clear();
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 0);
        assert.strictEqual(cookies.username, undefined);
    });

    it("Clear Multiple Cookies", async() => {
        await browser.cookies.set("android", "marvin");
        await browser.cookies.clear();
        const cookies = await browser.cookies.all();
        assert.strictEqual(Object.keys(cookies).length, 0);
    });
});
