"use strict";

const path = require('path');
const {
    FatalError
} = require('./errors');
const WendigoConfig = require('../config');
const DomElement = require('./models/dom_element');
const utils = require('./utils');

const injectionScriptsPath = WendigoConfig.injectionScripts.path;
const injectionScripts = WendigoConfig.injectionScripts.files;

const defaultOpenOptions = {
    clearRequestMocks: true,
    viewport: {
        width: 1440,
        height: 900,
        isMobile: false
    }
};

function pageLog(log) {
    utils.stringifyLogText(log).then(text => {
        log._text = text;
        console[log._type](log._text); // eslint-disable-line
    });
}

module.exports = class BrowserCore {
    constructor(page, settings, components) {
        this.page = page;
        this._settings = settings;
        this._loaded = false;
        this._initialResponse = null;
        this._components = components;
        if (this._settings.log) {
            this.page.on("console", pageLog);
        }

        this.page.on('load', () => {
            if (this._loaded) return this._afterPageLoad().catch(() => {
                // Will fail if browser is closed
            });
        });
    }

    open(url, options) {
        options = Object.assign({}, defaultOpenOptions, options);
        return this._beforeOpen(options).then(() => {
            return this.page.goto(url).then((response) => {
                this._initialResponse = response;
                return this._afterPageLoad();
            });
        }).catch((err) => {
            return Promise.reject(new FatalError(`Failed to open "${url}". ${err.message}`));
        });
    }

    openFile(filepath, options) {
        const absolutePath = path.resolve(filepath);
        return this.open(`file:${absolutePath}`, options).catch(() => {
            return Promise.reject(new FatalError(`Failed to open "${filepath}". File not found.`));
        });
    }

    close() {
        if (this._loaded === false) return Promise.resolve();
        this._loaded = false;
        this._initialResponse = null;
        this._originalHtml = undefined;
        return this._beforeClose().then(() => {
            return this.page.close().catch((err) => {
                return Promise.reject(new FatalError(`Failed to close browser. ${err.message}`));
            });
        });
    }

    evaluate(cb, ...args) {
        this._failIfNotLoaded();
        args = args.map((e) => {
            if (e instanceof DomElement) return e.element;
            else return e;
        });
        return this.page.evaluate(cb, ...args);
    }

    setViewport(config = {}) {
        config = Object.assign({}, this.page.viewport(), config);
        return this.page.setViewport(config);
    }

    frames() {
        return this.page.frames();
    }

    addScript(scriptPath) {
        this._failIfNotLoaded();
        return this.page.addScriptTag({
            path: scriptPath
        });
    }

    _beforeClose() {
        return this._callComponentsMethod("_beforeClose");
    }

    _beforeOpen(options) {
        let p = Promise.resolve();
        if (this._settings.userAgent) {
            p = this.page.setUserAgent(this._settings.userAgent);
        }
        return p.then(() => {
            return this.setViewport(options.viewport).then(() => {
                return this._callComponentsMethod("_beforeOpen", options);
            });
        });
    }

    _failIfNotLoaded() {
        if (!this._loaded) {
            throw new FatalError(`Cannot perform action before opening a page.`);
        }
    }

    _afterPageLoad() {
        return this.page.content().then((content) => {
            this._originalHtml = content;
            return this._addJsScripts().then(() => {
                this._loaded = true;
                return this._callComponentsMethod("_afterOpen");
            });
        });
    }

    _addJsScripts() {
        const promises = injectionScripts.map((s) => {
            return this.page.addScriptTag({ // Not using wrapper as this is before loaded is true
                path: path.join(injectionScriptsPath, s)
            });
        });
        return Promise.all(promises);
    }

    _callComponentsMethod(method, options) {
        return Promise.all(this._components.map((c) => {
            if (typeof this[c][method] === 'function')
                return this[c][method](options);
        }));
    }
};
