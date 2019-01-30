"use strict";

const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;

describe.only("Path Finder", function() {
    this.timeout(5000);

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    after(async() => {
        await browser.close();
    });

    it("Find CssPath", async() => {
        await browser.open(configUrls.index);
        const element = await browser.query(".hidden-text");
        const path = await browser.findCssPath(element);
        assert.strictEqual(path, 'body > i');
    });

    it("Find CssPath Nested", async() => {
        await browser.open(configUrls.waitAndClick);
        const element = await browser.query(".btn");
        const path = await browser.findCssPath(element);
        assert.strictEqual(path, 'body > div > button');
    });

    it("Find CssPath Multiple Buttons", async() => {
        await browser.open(configUrls.requestsFake);
        const element = await browser.query(".btn.post");
        const element2 = await browser.query(".btn.query");
        const path = await browser.findCssPath(element);
        const path2 = await browser.findCssPath(element2);
        assert.strictEqual(path, 'body > button.btn.post');
        assert.strictEqual(path2, 'body > button.btn.query');
    });

    it("Find xPath", async() => {
        await browser.open(configUrls.index);
        const element = await browser.query(".hidden-text");
        const path = await browser.findXPath(element);
        assert.strictEqual(path, '/html/body/i');
    });

    it("Find xPath Nested", async() => {
        await browser.open(configUrls.waitAndClick);
        const element = await browser.query(".btn");
        const path = await browser.findXPath(element);
        assert.strictEqual(path, '/html/body/div/button');
    });

    it("Find xPath Multiple Buttons", async() => {
        await browser.open(configUrls.requestsFake);
        const element = await browser.query(".btn.post");
        const element2 = await browser.query(".btn.query");
        const path = await browser.findXPath(element);
        const path2 = await browser.findXPath(element2);
        assert.strictEqual(path, '/html/body/button[2]');
        assert.strictEqual(path2, '/html/body/button[3]');
    });
});
