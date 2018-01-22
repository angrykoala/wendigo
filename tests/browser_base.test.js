"use strict";

const Wendigo = require('../lib/wendigo');
const assert = require('assert');

describe("Browser Base", () => {
    let browser;
    beforeEach(async () => {
        browser = await Wendigo.createBrowser({log: true});
    });

    it("Query", async () => {
        await browser.open("http://localhost:3456/index.html");
        const element = await browser.query("h1");
        assert(element);
        assert.strictEqual(element.textContent, "Main Title");
    });

    it("Query Multiple Elements", async () => {
        await browser.open("http://localhost:3456/index.html");
        const element = await browser.query("p");
        assert(element);
        assert.strictEqual(element.textContent, "My first paragraph");
    });

    it("QueryAll", async () => {
        await browser.open("http://localhost:3456/index.html");
        const elements = await browser.queryAll("p");
        assert.strictEqual(elements.length, 2);
        assert.strictEqual(elements[0].textContent, "My first paragraph");
        assert.strictEqual(elements[1].textContent, "My second paragraph");
    });

    it("QueryAll One Element", async () => {
        await browser.open("http://localhost:3456/index.html");
        const elements = await browser.queryAll(".container p");
        assert.strictEqual(elements.length, 1);
        assert.strictEqual(elements[0].textContent, "My first paragraph");
    });

    it("XPath Query", async() => {
        await browser.open("http://localhost:3456/index.html");
        const elements = await browser.queryXPath('//p[contains(text(),"My first paragraph")]');
        assert.strictEqual(elements.length, 1);
        assert.strictEqual(elements[0].textContent, "My first paragraph");
    });


});
