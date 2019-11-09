"use strict";

const path = require('path');
const fs = require('fs');
const Wendigo = require('../..');
const assert = require('assert');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');

describe("Pdf", function() {
    this.timeout(5000);
    const minFileSize = 10000;
    const filePath = path.join(__dirname, "test.pdf");

    function assertFile(expectedPath, minSize) {
        return new Promise((resolve, reject) => {
            fs.stat(expectedPath, (err, stats) => {
                if (err && err.code === 'ENOENT') return reject(new Error(`File ${expectedPath} does not exists.`));
                else if (err) return reject(err);
                else if (minSize && stats.size < minSize) return reject(new Error(`File is smaller than expected size.`));
                else return resolve();
            });
        });
    }

    let browser;
    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.index);
    });

    afterEach((done) => {
        fs.unlink(filePath, () => {
            done();
        });
    });

    after(async() => {
        await browser.close();
    });

    it("Generate Pdf Buffer", async() => {
        const buffer = await browser.pdf();
        assert.ok(buffer.length > minFileSize);
    });

    it("Generate Pdf File", async() => {
        await browser.pdf({path: filePath});
        await assertFile(filePath, minFileSize);
    });

    it("Generate Pdf With Path Parameter", async() => {
        await browser.pdf(filePath);
        await assertFile(filePath, minFileSize);
    });

    it("Generate Pdf Buffer Before Open", async() => {
        const browser2 = await Wendigo.createBrowser();

        await utils.assertThrowsAsync(async() => {
            await browser2.pdf();
        }, `FatalError: [pdf] Cannot perform action before opening a page.`);
        await browser2.close();
    });
});
