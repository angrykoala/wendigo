"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe.only("Date Mock", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
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
        await browser.wait(1);
        const currentTimestamp = await browser.evaluate(() => {
            const d = new Date();
            return d.getTime();
        });
        console.log(currentTimestamp);
        assert(currentTimestamp > 1291935600000);
        assert(currentTimestamp < 1291935605000);
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
            return new Date(1201820400000).getTime();
        });
        assert.strictEqual(expectedDate, 1201820400000);
    });

    it.skip("Using Date As Function", async() => { // NOT SUPPORTED
        await browser.mockDate(new Date(2010, 11, 10));
        await browser.click(".btn");
        const currentDates = await browser.evaluate(() => {
            return [Date(), String(new Date())];
        });
        assert.strictEqual(currentDates[0], currentDates[1]);
        await browser.assert.text(".date-text", "12/10/2010::0-0-0");
    });


    it("Date.now", async() => {
        await browser.mockDate(new Date(2010, 11, 10));
        await browser.click(".btn");
        const currentTimestamp = await browser.evaluate(() => {
            return Date.now();
        });
        assert.strictEqual(currentTimestamp, 1291935600000);
    });


    it("Date.now Without Freezing Clock", async() => {
        await browser.mockDate(new Date(2010, 11, 10), {
            freeze: false
        });
        await browser.wait(1);
        const currentTimestamp = await browser.evaluate(() => {
            return Date.now();
        });
        console.log(currentTimestamp);
        assert(currentTimestamp > 1291935600000);
        assert(currentTimestamp < 1291935605000);
    });
});
