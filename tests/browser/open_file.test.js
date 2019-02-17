"use strict";

const path = require('path');
const Wendigo = require('../..');
const utils = require('../test_utils');
const filePath = "tests/dummy_server/static/html_simple.html";
const absolutePath = path.join(__dirname, "../..", filePath);

describe("Open File", function() {
    this.timeout(5000);
    let browser;

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
    });

    afterEach(async() => {
        await browser.close();
    });


    it("Open Html From File Url", async() => {
        await browser.open(`file://${absolutePath}`);
        await browser.assert.text("p", "html_test");
    });

    it("Open Html From File Relative Path", async() => {
        await browser.openFile(filePath);
        await browser.assert.text("p", "html_test");
    });

    it("Open Html From File Absolute Path", async() => {
        await browser.openFile(absolutePath);
        await browser.assert.text("p", "html_test");
    });

    it("Open File Invalid Path", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.openFile("Invalid Path");
        }, `FatalError: [openFile] Failed to open "Invalid Path". File not found.`);
    });
});
