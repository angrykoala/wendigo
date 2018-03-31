"use strict";

const process = require('process');
const deepEqual = require('deep-equal');
const BrowserFactory = require('./browser_factory');
const puppeteer = require('puppeteer');
const Errors = require('./errors/errors');


const defaultSettings = {
    log: false,
    headless: true,
    args: [],
    slowMo: 0
};

const components = {
    "cookies": require('./modules/browser_cookies'),
    "localStorage": require('./modules/browser_local_storage'),
    "requests": require('./modules/browser_requests')
};

const assertComponents = {
    "not": require('./modules/assertions/browser_not_assertions'),
    "localStorage": require('./modules/assertions/local_storage_assertions'),
    "requests": require('./modules/assertions/request_assertions')
};

module.exports = class Wendigo {

    static async createBrowser(settings = {}) {
        settings = Object.assign(defaultSettings, settings);
        if(!deepEqual(this._lastSettings, settings)) {
            this._clearInstance();
        }
        this._lastSettings = settings;
        await this._setInstance(settings);
        const page = await this.instance.newPage();
        return BrowserFactory.createBrowser(page, settings, components, assertComponents);
    }

    static async stop() {
        if(this.instance) {
            await this.instance.close();
            this.instance = null;
        }
    }

    static get Errors() {
        return Errors;
    }

    static _clearInstance() {
        this.instance = null;
        BrowserFactory.clearCache();
    }

    static async _setInstance(settings) {
        if(process.env["NO_SANDBOX"]) {
            settings.args = settings.args.concat(['--no-sandbox', '--disable-setuid-sandbox']); // Required to run in travis
        }
        if(!this.instance) this.instance = await puppeteer.launch(settings);
    }


};
