"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');
const utils = require('./utils');
const configUrls = require('./config.json').urls;

describe("Not Assertions", () => {
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Not Exists", async () => {
        await browser.open(configUrls.index);
        await browser.assert.not.exists("h2");
        await browser.assert.not.exists(".not-container");
    });

    it("Not Exists Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.exists("h1");
        }, `Expected element "h1" to not exists`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.exists(".container");
        }, `Expected element ".container" to not exists`);
    });

    it("Not Text", async () => {
        await browser.open(configUrls.index);
        await browser.assert.not.text("h1", "Not Main Title");
    });

    it("Not Text Not Exists", async () => {
        await browser.open(configUrls.index);
        await browser.assert.not.text("h2", "Not Main Title");
    });

    it("Not Multiple Texts", async () => {
        await browser.open(configUrls.index);
        await browser.assert.not.text("p", "not a paragraph");
    });

    it("Not Multiple Texts Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.text("p", "My first paragraph");
        }, `Expected element "p" not to have text "My first paragraph"`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.text("p", "My second paragraph");
        }, `Expected element "p" not to have text "My second paragraph"`);
    });

    it("Not Is Visible", async() => {
        assert(browser.assert.not.visible);
        await browser.open(configUrls.index);
        await browser.assert.not.visible(".hidden-text");
        await browser.assert.not.visible(".hidden-text2");
    });

    it("Not Is Visible Not Exists", async() => {
        assert(browser.assert.not.visible);
        await browser.open(configUrls.index);
        await browser.assert.not.visible(".imaginary-text");
    });

    it("Not Is Visible Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.visible("p");
        }, `Expected element "p" to not be visible`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.visible("h1");
        }, `Expected element "h1" to not be visible`);
    });

    it("Not Title", async() => {
        assert(browser.assert.not.title);
        await browser.open(configUrls.index);
        await browser.assert.not.title("Not Index Test");
    });

    it("Not Title Default", async() => {
        await browser.open(configUrls.simple);
        await browser.assert.not.title("Test title");
    });

    it("Not Title Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.not.title);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.title("Index Test");
        }, `Expected page title not to be "Index Test"`);
    });

});
