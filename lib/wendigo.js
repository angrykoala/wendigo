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
    slowMo: 0,
    incognito: false,
    noSandbox: false
};

const components = {
    "cookies": require('./modules/browser_cookies'),
    "localStorage": require('./modules/browser_local_storage'),
    "requests": require('./modules/browser_requests'),
    "console": require('./modules/browser_console'),
    "webworkers": require('./modules/browser_webworkers')
};

const assertComponents = {
    "not": require('./modules/assertions/browser_not_assertions'),
    "localStorage": require('./modules/assertions/local_storage_assertions')
};

module.exports = class Wendigo {

    static createBrowser(settings = {}) {
        settings = Object.assign({}, defaultSettings, settings);
        let p = Promise.resolve();
        if (!deepEqual(this._lastSettings, settings)) {
            p = this.stop();
        }
        return p.then(() => {
            this._lastSettings = settings;
            return this._setInstance(settings).then(() => {
                return this.instance.newPage().then((page) => {
                    return BrowserFactory.createBrowser(page, settings, components, assertComponents);
                });
            });
        });
    }

    static stop() {
        if (this.instance) {
            return this.instance.close().then(() => {
                this._clearInstance();
            });
        } else return Promise.resolve();
    }

    static get Errors() {
        return Errors;
    }

    static _clearInstance() {
        this.instance = null;
        BrowserFactory.clearCache();
    }

    static _setInstance(settings) {
        if (process.env["NO_SANDBOX"] || settings.noSandbox) {
            settings.args = settings.args.concat(['--no-sandbox', '--disable-setuid-sandbox']); // Required to run on some systems
        }
        if (!this.instance) {
            return puppeteer.launch(settings).then((instance) => {
                this.instance = instance;
                if (settings.incognito) {
                    return this.instance.createIncognitoBrowserContext().then((context) => {
                        this.instance = context;
                    });
                }
            });
        } else return Promise.resolve();
    }
};
