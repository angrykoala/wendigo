"use strict";

const process = require('process');
const Browser = require('./browser');
const puppeteer = require('puppeteer');


const defaultSettings = {
    log: false,
    headless: true
};

module.exports = class Wendigo {

    static async createBrowser(settings = {}) {
        settings = Object.assign(defaultSettings, settings);
        await this._setInstance(settings);
        const page = await this.instance.newPage();
        return new Browser(page, settings);
    }

    static async stop() {
        if(this.instance) {
            await this.instance.close();
            this.instance = null;
        }
    }

    static async _setInstance(settings) {
        let args = [];
        if(process.env["NO_SANDBOX"]) {
            args = ['--no-sandbox', '--disable-setuid-sandbox']; // Required to run in travis
        }
        if(!this.instance) this.instance = await puppeteer.launch({headless: settings.headless, args: args});
    }

};
