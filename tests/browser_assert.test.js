"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');
const utils = require('./utils');
const configUrls = require('./config.json').urls;

describe("Assert", () => {
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        browser.close();
    });

    it("Exists", async () => {
        await browser.open(configUrls.index);
        await browser.assert.exists("h1");
        await browser.assert.exists(".container");
    });

    it("Exists Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.exists("h2");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.exists(".not_container");
        });
    });

    it("Text", async () => {
        await browser.open(configUrls.index);
        await browser.assert.text("h1", "Main Title");
    });
    it("Multiple Texts", async () => {
        await browser.open(configUrls.index);
        await browser.assert.text("p", "My first paragraph");
        await browser.assert.text("p", "My second paragraph");
    });

    it("Text Throws", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.text("h1", "My first paragraph");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.text("h2", "My first paragraph");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.text(".container p", "My seconds paragraph");
        });
    });

    it("Is Visible", async() => {
        assert(browser.assert.visible);
        await browser.open(configUrls.index);
        await browser.assert.visible("h1");
        await browser.assert.visible(".container p");
        await browser.assert.visible("p");
    });

    it("Is Visible Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.visible(".hidden-text");
        });
    });

    it("Is Visible When Styled Hidden", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.visible(".hidden-text2");
        });
    });

    it("Is Visible When Element Not Exists", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.visible(".not-exists");
        });
    });

    it("Title", async() => {
        assert(browser.assert.title);
        await browser.open(configUrls.index);
        await browser.assert.title("Index Test");
    });

    it("Title Default", async() => {
        await browser.open(configUrls.simple);
        await browser.assert.title("");
    });

    it("Title Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.title);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.title("Index Test 2");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.title("");
        });
    });

});
