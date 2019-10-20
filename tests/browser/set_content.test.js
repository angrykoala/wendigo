"use strict";

const path = require('path');
const fs = require('fs');
const Wendigo = require('../..');
const filePath = "tests/dummy_server/static/html_simple.html";
const absolutePath = path.join(__dirname, "../..", filePath);

describe("Set Content", function() {
    this.timeout(5000);
    let browser;
    let content;

    before((done) => {
        fs.readFile(absolutePath, 'utf8', (err, res) => {
            if (err || !res) throw err;
            content = res;
            done();
        });
    });

    beforeEach(async() => {
        browser = await Wendigo.createBrowser();
    });

    afterEach(async() => {
        await browser.close();
    });


    it("Set Html Content And Perform Actions", async() => {
        await browser.setContent(content);
        await browser.assert.text("p", "html_test");
    });
});
