"use strict";

const assert = require('assert');
const Wendigo = require('../..');
const configUrls = require('../config.json').urls;
const utils = require('../test_utils');


describe("Dialog Alerts", function() {
    this.timeout(5000);
    let browser;

    before(async() => {
        browser = await Wendigo.createBrowser();
    });

    beforeEach(async() => {
        await browser.open(configUrls.dialogAlert);
    });

    after(async() => {
        await browser.close();
    });

    it("List Alerts", async() => {
        const emptyAlerts = browser.dialog.all();
        assert.strictEqual(emptyAlerts.length, 0);
        const p = browser.click(".alert-btn");
        const dialog = await browser.dialog.waitForDialog();
        assert.ok(dialog);
        dialog.dismiss();
        const alerts = browser.dialog.all();
        assert.strictEqual(alerts.length, 1);
        await p;
    });

    it("Confirm Alerts", async() => {
        const emptyAlerts = browser.dialog.all();
        assert.strictEqual(emptyAlerts.length, 0);
        const p = browser.click(".alert-btn"); // await here will freeze node until the alert is closed
        const dialog = await browser.dialog.waitForDialog();
        assert.ok(dialog);
        dialog.accept();
        const alerts = browser.dialog.all();
        assert.strictEqual(alerts.length, 1);
        await p;
    });

    it("Dialog Object And Dismiss", async() => {
        const p = browser.click(".alert-btn");
        const dialog = await browser.dialog.waitForDialog();
        dialog.dismiss();
        assert.strictEqual(dialog.text, "an alert");
        assert.strictEqual(dialog.type, "alert");
        await p;
    });

    it("Multiple Alerts", async() => {
        const p1 = browser.click(".alert-btn");
        const dialog = await browser.dialog.waitForDialog();
        const p2 = browser.click(".alert-btn");
        assert.ok(dialog);
        await dialog.dismiss();
        const dialog2 = await browser.dialog.waitForDialog();
        await dialog2.dismiss();
        const alerts = browser.dialog.all();
        assert.strictEqual(alerts.length, 2);
        await p1;
        await p2;
    });

    it("Dimiss Last", async() => {
        const p = browser.click(".alert-btn");
        await browser.dialog.waitForDialog();
        await browser.dialog.dismissLast();
        await p;
    });

    it("Dimiss Last Empty", async() => {
        await browser.dialog.dismissLast();
    });

    it("Dimiss Twice", async() => {
        const p = browser.click(".alert-btn");
        const dialog = await browser.dialog.waitForDialog();
        await dialog.dismiss();
        await browser.dialog.dismissLast();
        await p;
    });

    it("Clear Alerts", async() => {
        const p = browser.click(".alert-btn");
        const dialog = await browser.dialog.waitForDialog();
        dialog.dismiss();
        const alerts = browser.dialog.all();
        assert.strictEqual(alerts.length, 1);
        browser.dialog.clear();
        const clearedAlerts = browser.dialog.all();
        assert.strictEqual(clearedAlerts.length, 0);
        await p;
    });


    it("Prompt Accept", async() => {
        const p = browser.click(".prompt-btn");
        const dialog = await browser.dialog.waitForDialog();
        assert.strictEqual(dialog.type, "prompt");
        assert.strictEqual(dialog.text, "a prompt");
        await dialog.accept("nice text");
        await p;
        await browser.assert.text(".prompt-result", "nice text");
    });

    it("Prompt Dismiss", async() => {
        const p = browser.click(".prompt-btn");
        const dialog = await browser.dialog.waitForDialog();
        assert.strictEqual(dialog.type, "prompt");
        assert.strictEqual(dialog.text, "a prompt");
        await dialog.dismiss();
        await p;
        await browser.assert.not.text(".prompt-result", "nice text");
    });

    it("WaitForDialog Timeout", async() => {
        // browser.click(".alert-btn");

        await utils.assertThrowsAsync(async() => {
            await browser.dialog.waitForDialog(10);
        }, `TimeoutError: Wait for dialog, timeout of 10ms exceeded.`);
    });

    it("Dismiss All Dialogs", async() => {
        await browser.open(configUrls.dialogAlert, {
            dismissAllDialogs: true
        });
        const emptyAlerts = browser.dialog.all();
        assert.strictEqual(emptyAlerts.length, 0);
        await browser.click(".alert-btn");
        const dialog = await browser.dialog.waitForDialog();
        assert.ok(dialog);
        const alerts = browser.dialog.all();
        assert.strictEqual(alerts.length, 1);
    });
});
