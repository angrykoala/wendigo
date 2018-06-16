"use strict";

const path = require('path');
const ErrorFactory = require('./errors/error_factory');
const config = require('../config');

const injectionScriptsPath = config.injectionScripts.path;
const injectionScripts = config.injectionScripts.files;

const defaultOpenOptions = {
    clearRequestMocks: true
};

function pageLog(log) {
    console[log._type](log._text); // eslint-disable-line
}

module.exports = class BrowserCore {
    constructor(page, settings, components) {
        this.page = page;
        this._settings = settings;
        this._loaded = false;
        this._initialResponse = null;
        this._components = components;
        if(this._settings.log) {
            this.page.on("console", pageLog);
        }
        if(this._settings.userAgent) {
            this.page.setUserAgent(this._settings.userAgent);
        }

        this.page.on('load', () => {
            if(this._loaded) return this._afterPageLoad().catch(() => {}); // Will fail if browser is closed
        });
    }

    open(url, options) {
        options = Object.assign({}, defaultOpenOptions, options);
        return this._beforeOpen(options).then(() => {
            return this.page.goto(url).then((response) => {
                this._initialResponse = response;
                return this._afterPageLoad();
            });
        }).catch(() => {
            return Promise.reject(ErrorFactory.generateFatalError(`Failed to open ${url}.`));
        });
    }

    close() {
        if(this._loaded === false) return Promise.resolve();
        this._loaded = false;
        this._initialResponse = null;
        this._originalHtml = undefined;
        return this._beforeClose().then(() => {
            return this.page.close().catch(() => {
                return Promise.reject(ErrorFactory.generateFatalError(`Failed to close browser.`));
            });
        });
    }

    evaluate(cb, ...args) {
        this._failIfNotLoaded();
        return this.page.evaluate(cb, ...args);
    }

    _beforeClose() {
        return Promise.all(this._components.map((c) => {
            return this[c]._beforeClose();
        }));
    }

    _beforeOpen(options) {
        return Promise.all(this._components.map((c) => {
            return this[c]._beforeOpen(options);
        }));
    }

    _failIfNotLoaded() {
        if(!this._loaded) {
            throw ErrorFactory.generateFatalError(`Cannot perform action before opening a page.`);
        }
    }

    _afterPageLoad() {
        return this.page.content().then((content) => {
            this._originalHtml = content;
            return this._addJsScripts().then(() => {
                this._loaded = true;
            });
        });
    }

    _addScript(key, scriptPath) {
        return this.page.evaluate((key) => {
            return Boolean(window[key]);
        }, key).then((exists) => {
            if(exists) return Promise.resolve();
            return this.page.addScriptTag({path: path.join(injectionScriptsPath, scriptPath)});
        });
    }

    _addJsScripts() {
        const scripts = Object.keys(injectionScripts);
        const promises = scripts.map((s) => {
            return this._addScript(s, injectionScripts[s]);
        });
        return Promise.all(promises);
    }
};
