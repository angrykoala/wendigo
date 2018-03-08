"use strict";

const assert = require('assert');
const Wendigo = require('../../lib/wendigo');
const utils = require('../utils');
const configUrls = require('../config.json').urls;

describe("Assert Class", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async () => {
        await browser.open(configUrls.index);
    });

    after(async () => {
        await browser.close();
    });

    it("Class", async () => {
        await browser.assert.class("div", "container");
        await browser.assert.class("div", "extra-class");
    });

    it("Class Throws", async () => {
        assert(browser.assert.class);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.class("div", "not-my-class");
        }, `Expected element "div" to contain class "not-my-class", "container extra-class" found.`);
    });

    it("Class Throws Element With No Classes", async () => {
        assert(browser.assert.class);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.class("h1", "not-my-class");
        }, `Expected element "h1" to contain class "not-my-class", no classes found.`);
    });

    it("Class Throws Element Not Found", async () => {
        assert(browser.assert.class);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.class("div.not-exists", "not-my-class");
        }, `Error: Selector "div.not-exists" doesn't match any elements.`);
    });

    it("Class Throws With Custom Message", async () => {
        assert(browser.assert.class);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.class("div", "not-my-class", "class failed");
        }, `class failed`);
    });

    it("Class From Node", async () => {
        const node = await browser.query("div");
        await browser.assert.class(node, "container");
        await browser.assert.class(node, "extra-class");
    });

    it("Class From Xpath", async () => {
        await browser.assert.class("//div", "container");
        await browser.assert.class("//div", "extra-class");
    });

    it("Not Class", async () => {
        await browser.assert.not.class("div", "not-my-class");
    });

    it("Not Class Throws", async () => {
        assert(browser.assert.class);
        await utils.assertThrowsAssertionAsync (async () => {
            await browser.assert.not.class("div", "container");
        }, `Expected element "div" not to contain class "container".`);
    });

    it("Not Class Throws Element Not Found", async () => {
        assert(browser.assert.not.class);
        await utils.assertThrowsAsync (async () => {
            await browser.assert.not.class("div.not-exists", "not-my-class");
        }, `Error: Selector "div.not-exists" doesn't match any elements.`);
    });

});
