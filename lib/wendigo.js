"use strict";

const process = require('process');
const Browser = require('./browser');
const puppeteer = require('puppeteer');


module.exports = class Wendigo {

    static async createBrowser(settings = {}) {
        await this._setInstance();
        const page = await this.instance.newPage();
        return new Browser(page, settings);
    }

    static async stop() {
        if(this.instance) {
            await this.instance.close();
            this.instance = null;
        }
    }

    static async _setInstance() {
        let args = [];
        if(process.env["NO_SANDBOX"]) {
            args = ['--no-sandbox', '--disable-setuid-sandbox']; // Required to run in travis
        }
        if(!this.instance) this.instance = await puppeteer.launch({headless: true, args: args});
    }

};
