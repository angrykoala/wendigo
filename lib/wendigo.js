"use strict";

// const phantom = require('phantom');
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
        if(!this.instance) this.instance = await puppeteer.launch();
    }

};
