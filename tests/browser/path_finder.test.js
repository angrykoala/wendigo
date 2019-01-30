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

    it("Find CssPath Duplicate Elements", async() => {
        await browser.open(configUrls.duplicateElements);
        const elements = await browser.queryAll("p"); // TODO: with .p error is thrown, related to #270
        const path1 = await browser.findCssPath(elements[0]);
        const path2 = await browser.findCssPath(elements[1]);

        assert.strictEqual(path1, 'body > p:nth-child(1)');
        assert.strictEqual(path2, 'body > p:nth-child(2)');
    });

    it("Find CssPath Of Input Node By Type", async() => {
        await browser.open(configUrls.duplicateElements);
        const elements = await browser.queryAll("input");
        const path1 = await browser.findCssPath(elements[0]);
        const path2 = await browser.findCssPath(elements[1]);
        assert.strictEqual(path1, 'body > input[type="text"]:nth-child(3)');
        assert.strictEqual(path2, 'body > input[type="number"]:nth-child(4)');
    });

    it("Find CssPath With Id", async() => {
        await browser.open(configUrls.duplicateElements);
        const element = await browser.query("h1");
        const path = await browser.findCssPath(element);
        assert.strictEqual(path, '#title');
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

    it("Find xPath Duplicate Elements", async() => {
        await browser.open(configUrls.duplicateElements);
        const elements = await browser.queryAll("p");
        const path1 = await browser.findXPath(elements[0]);
        const path2 = await browser.findXPath(elements[1]);
        assert.strictEqual(path1, '/html/body/p[1]');
        assert.strictEqual(path2, '/html/body/p[2]');
    });

    it("Find xPath Of Input Node By Type", async() => {
        await browser.open(configUrls.duplicateElements);
        const elements = await browser.queryAll("input");
        const path1 = await browser.findXPath(elements[0]);
        const path2 = await browser.findXPath(elements[1]);
        assert.strictEqual(path1, '/html/body/input[1]');
        assert.strictEqual(path2, '/html/body/input[2]');
    });

    it("Find xPath With Id", async() => {
        await browser.open(configUrls.duplicateElements);
        const element = await browser.query("h1");
        const path = await browser.findXPath(element);
        assert.strictEqual(path, '//*[@id="title"]');
    });
});
