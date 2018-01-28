"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');
const utils = require('./utils');
const configUrls = require('./config.json').urls;

describe("Assertions", function() {
    this.timeout(5000);
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
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
        }, `Expected element "h2" to exists`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.exists(".not_container");
        }, `Expected element ".not_container" to exists`);
    });

    it("Exists Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.exists("h2", "test failed");
        }, `test failed`);
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
        }, `Expected element "h1" to have text "My first paragraph", "Main Title" found`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.text("h2", "My first paragraph");
        }, `Expected element "h2" to have text "My first paragraph", no text found`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.text(".container p", "My second paragraph");
        }, `Expected element ".container p" to have text "My second paragraph", "My first paragraph" found`);
    });

    it("Text Throws With Custom Message", async () => {
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.text("h1", "My first paragraph", "text failed");
        }, `text failed`);
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
        }, `Expected element ".hidden-text" to be visible`);
    });

    it("Is Visible When Styled Hidden", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.visible(".hidden-text2");
        }, `Expected element ".hidden-text2" to be visible`);
    });

    it("Is Visible When Element Not Exists", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.visible(".not-exists");
        }, `Expected element ".not-exists" to be visible`);
    });

    it("Is Visible Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.visible(".hidden-text", "visible test failed");
        }, `visible test failed`);
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
        }, `Expected page title to be "Index Test 2", "Index Test" found`);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.title("");
        }, `Expected page title to be "", "Index Test" found`);
    });

    it("Title Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.title);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.title("Index Test 2", "title test failed");
        }, `title test failed`);
    });

    it("Class", async() => {
        await browser.open(configUrls.index);
        await browser.assert.class("div", "container");
        await browser.assert.class("div", "extra-class");
    });

    it("Class Throws", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.class);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.class("div", "not-my-class");
        }, `Expected element "div" to contain class "not-my-class", "container extra-class" found`);
    });

    it("Class Throws Element Not Found", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.class);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.class("div.not-exists", "not-my-class");
        }, `Expected element "div.not-exists" to contain class "not-my-class", no classes found`);
    });

    it("Class Throws With Custom Message", async() => {
        await browser.open(configUrls.index);
        assert(browser.assert.class);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.class("div", "not-my-class", "class failed");
        }, `class failed`);
    });

    it("Url", async() => {
        await browser.open(configUrls.index);
        await browser.assert.url(configUrls.index);
    });

    it("Url Throws", async() => {
        const invalidUrl = "http://localhost/not_the_url";
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.url(invalidUrl);
        }, `Expected url to be "${invalidUrl}", "${configUrls.index}" found`);
    });

    it("Url Throws With Custom Message", async() => {
        const invalidUrl = "http://localhost/not_the_url";
        await browser.open(configUrls.index);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.url(invalidUrl, "invalid url");
        }, `invalid url`);
    });

});
