"use strict";

const Wendigo = require('../..');
const configUrls = require('../config.json').urls;

describe("Trigger Event", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.triggerEvent);
    });

    after(async() => {
        await browser.close();
    });

    it("Custom Event", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent(".ev-result", "my-event");
        await browser.assert.text(".ev-result", "custom-event");
    });

    it("Custom Click Event", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent(".ev-result", "click");
        await browser.assert.text(".ev-result", "click-event");
    });

    it("Custom Event Without Listener", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent(".ev-result", "not-an-event");
        await browser.assert.text(".ev-result", "default");
    });

    it("Trigger Event With XPath Selector", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent('//p[@class="ev-result"]', "my-event");
        await browser.assert.text(".ev-result", "custom-event");
    });

    it("Trigger Event With DOM Selector", async() => {
        const element = await browser.query(".ev-result");
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent(element, "my-event");
        await browser.assert.text(".ev-result", "custom-event");
    });

    it("Trigger Event With Invalid Selector", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent(".not-ev-result", "my-event");
        await browser.assert.text(".ev-result", "default");
    });

    it("Trigger Event With Options", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent(".ev-result", "my-event", {
            bubbles: true
        });
        await browser.assert.text(".ev-result", "custom-eventdiv-event1div-event2");
    });

    it("Trigger Events On Multiple Elements", async() => {
        await browser.assert.text(".ev-result", "default");
        await browser.triggerEvent("div", "my-event");
        await browser.assert.text(".ev-result", "defaultdiv-event2div-event1");
    });
});
