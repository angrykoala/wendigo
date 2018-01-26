"use strict";

const assert = require('assert');
const Wendigo = require('../lib/wendigo');
const utils = require('./utils');

describe("Assert", () => {
    let browser;

    before(async () => {
        browser = await Wendigo.createBrowser({log: true});
    });

    after(async() => {
        browser.close();
    });

    it("Not Exists", async () => {
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.exists("h2");
        await browser.assert.not.exists(".not-container");
    });

    it("Not Exists Throws", async () => {
        await browser.open("http://localhost:3456/index.html");
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.exists("h1");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.exists(".container");
        });
    });

    it("Not Text", async () => {
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.text("h1", "Not Main Title");
    });

    it("Not Text Not Exists", async () => {
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.text("h2", "Not Main Title");
    });

    it("Not Multiple Texts", async () => {
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.text("p", "not a paragraph");
    });

    it("Not Multiple Texts Throws", async () => {
        await browser.open("http://localhost:3456/index.html");
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.text("p", "My first paragraph");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.text("p", "My second paragraph");
        });
    });

    it("Not Is Visible", async() => {
        assert(browser.assert.not.visible);
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.visible(".hidden-text");
        await browser.assert.not.visible(".hidden-text2");
    });

    it("Not Is Visible Not Exists", async() => {
        assert(browser.assert.not.visible);
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.visible(".imaginary-text");
    });

    it("Not Is Visible Throws", async() => {
        await browser.open("http://localhost:3456/index.html");
        assert(browser.assert.not.visible);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.visible("p");
        });
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.visible("h1");
        });
    });

    it("Not Title", async() => {
        assert(browser.assert.not.title);
        await browser.open("http://localhost:3456/index.html");
        await browser.assert.not.title("Not Index Test");
    });

    it("Not Title Default", async() => {
        await browser.open("http://localhost:3456/html_simple.html");
        await browser.assert.not.title("Test title");
    });

    it("Not Title Throws", async() => {
        await browser.open("http://localhost:3456/index.html");
        assert(browser.assert.not.title);
        await utils.assertThrowsAsync(async () => {
            await browser.assert.not.title("Index Test");
        });
    });

});
