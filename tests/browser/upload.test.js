"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');
const path = require('path');

const filePath = path.join(__filename, '..', 'dummy_file');

describe("Upload", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.forms);
    });

    after(async() => {
        await browser.close();
    });

    it.skip("File Input Set Relative Path", async() => {
        await browser.uploadFile(".input3", "../dummy_file");
        await browser.assert.value(".input3", "C:\\fakepath\\dummy_file");
    });

    it("File Input Set Absolute Path", async() => {
        await browser.uploadFile(".input3", filePath);
        await browser.assert.value(".input3", "C:\\fakepath\\dummy_file");
    });

    it("File Input Missing Element", async() => {
        await utils.assertThrowsAsync(async() => {
            await browser.uploadFile(".missing", filePath);
        }, `QueryError: [uploadFile] Selector ".missing" doesn't match any element to upload file.`);
    });
});
