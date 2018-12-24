"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Date Mock", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser({log: true});
    });

    beforeEach(async() => {
        await browser.open(configUrls.date);
    });

    after(async() => {
        await browser.close();
    });

    it("Mock Date Freezing Clock", async() => {
        await browser.mockDate(new Date(2010, 11, 10)); // 10 Dec 2010
        await browser.click(".btn");
        await browser.wait();
        await browser.assert.text(".date-text", "12/10/2010::0-0-0"); // MM/DD/YYYY::h-m-s
        await browser.wait(1000);
        await browser.click(".btn");
        await browser.assert.text(".date-text", "12/10/2010::0-0-0");
    });

    it("Mock Twice", async() => {
        await browser.mockDate(new Date(2010, 11, 10));
        await browser.click(".btn");
        await browser.assert.text(".date-text", "12/10/2010::0-0-0");
        await browser.mockDate(new Date(2011, 11, 10));
        await browser.click(".btn");
        await browser.assert.text(".date-text", "12/10/2011::0-0-0");
    });


    it("Mock Date Without Freezing Clock", async() => {
        await browser.mockDate(new Date(2010, 11, 10), {
            freeze: false
        });
        await browser.click(".btn");
        await browser.assert.text(".date-text", "12/10/2010::0-0-0");
        await browser.wait(1000);
        await browser.click(".btn");
        await browser.assert.not.text(".date-text", "12/10/2010::0-0-0");
        await browser.assert.text(".date-text", /12\/10\/2010::0-\d\d?-\d\d?/);
    });

    it("Clear Date Mock", async() => {
        await browser.mockDate(new Date(2010, 11, 10), {
            freeze: false
        });
        await browser.click(".btn");
        await browser.assert.text(".date-text", "12/10/2010::0-0-0");
        await browser.clearDateMock();
        await browser.click(".btn");
        await browser.assert.not.text(".date-text", "12/10/2010::0-0-0");
    });

    it("Mock Date And User Date Object With Specific Date", async() => {
        await browser.mockDate(new Date(2010, 11, 10));
        await browser.click(".btn");
        const expectedDate = await browser.evaluate(() => {
            return new Date(2008, 1, 1).getTime();
        });
        assert.strictEqual(expectedDate, 1201820400000);
    });

    it.skip("Using Date as function", async() => { // NOT SUPPORTED
        await browser.mockDate(new Date(2010, 11, 10));
        await browser.click(".btn");
        const currentDates = await browser.evaluate(() => {
            return [Date(), String(new Date())];
        });
        assert.strictEqual(currentDates[0], currentDates[1]);
        await browser.assert.text(".date-text", "12/10/2010::0-0-0");
    });
});
