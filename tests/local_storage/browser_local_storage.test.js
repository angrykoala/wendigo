"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const configUrls = require('../config.json').urls;

describe("Local Storage", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.localStorage);
    });
    afterEach(async() => {
        await browser.localStorage.clear();
    });

    after(async () => {
        await browser.close();
    });

    it("Get Item", async () => {
        const value = await browser.localStorage.getItem("arthur");
        assert.strictEqual(value, "dontpanic");
        const length = await browser.localStorage.length();
        assert.strictEqual(length, 1);
    });

    it("Set New Item", async() => {
        await browser.localStorage.setItem("marvin", "paranoid");
        const value = await browser.localStorage.getItem("marvin");
        assert.strictEqual(value, "paranoid");
        const length = await browser.localStorage.length();
        assert.strictEqual(length, 2);
    });

    it("Update Item", async() => {
        await browser.localStorage.setItem("arthur", "panic");
        const value = await browser.localStorage.getItem("arthur");
        assert.strictEqual(value, "panic");
        const length = await browser.localStorage.length();
        assert.strictEqual(length, 1);
    });

    it("Get Invalid Item", async() => {
        const value = await browser.localStorage.getItem("invalid");
        assert.strictEqual(value, null);
    });

    it("Remove Item", async() => {
        await browser.localStorage.removeItem("arthur");
        const value = await browser.localStorage.getItem("arthur");
        assert.strictEqual(value, null);
        const length = await browser.localStorage.length();
        assert.strictEqual(length, 0);
    });

    it("Remove Invalid Item", async() => {
        await browser.localStorage.removeItem("not-and-item");
        const length = await browser.localStorage.length();
        assert.strictEqual(length, 1);
    });

    it("Clear", async() => {
        await browser.localStorage.clear();
        const length = await browser.localStorage.length();
        assert.strictEqual(length, 0);
    });

    it("Set And Get Item Between Sessions", async() => {
        await browser.localStorage.clear();
        await browser.localStorage.setItem("marvin", "paranoid");
        const length1 = await browser.localStorage.length();
        assert.strictEqual(length1, 1);
        await browser.open(configUrls.localStorage);
        const length2 = await browser.localStorage.length();
        assert.strictEqual(length2, 2); // Added by the web
        const value = await browser.localStorage.getItem("marvin");
        assert.strictEqual(value, "paranoid");
    });

});
