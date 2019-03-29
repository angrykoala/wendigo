/* global WendigoUtils */
"use strict";

const path = require('path');
const querystring = require('querystring');
const {
    FatalError,
    InjectScriptError
} = require('./errors');
const WendigoConfig = require('../config');
const DomElement = require('./models/dom_element');
const utils = require('./utils/utils');

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
        let logType = log._type;
        if (logType === 'warning') logType = 'warn';
        if (!console[logType]) logType = 'log'; // eslint-disable-line no-console
        console[logType](text); // eslint-disable-line no-console
    });
}

module.exports = class BrowserCore {
    constructor(page, settings, components) {
        this.page = page;
        this._settings = settings;
        this._loaded = false;
        this._disabled = false;
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

    get loaded() {
        return this._loaded && !this._disabled;
    }

    open(url, options) {
        this._loaded = false;
        options = Object.assign({}, defaultOpenOptions, options);
        if (options.queryString) {
            const qs = this._generateQueryString(options.queryString);
            url = `${url}${qs}`;
        }
        return this._beforeOpen(options).then(() => {
            return this.page.goto(url).then((response) => {
                this._initialResponse = response;
                return this._afterPageLoad(options);
            });
        }).catch((err) => {
            if (err instanceof FatalError) return Promise.reject(err);
            return Promise.reject(new FatalError("open", `Failed to open "${url}". ${err.message}`));
        });
    }

    openFile(filepath, options) {
        const absolutePath = path.resolve(filepath);
        return this.open(`file:${absolutePath}`, options).catch(() => {
            return Promise.reject(new FatalError("openFile", `Failed to open "${filepath}". File not found.`));
        });
    }

    close() {
        if (this._disabled) return Promise.resolve();
        const p = this._beforeClose();
        this._disabled = true;
        this._loaded = false;
        this._initialResponse = null;
        this._originalHtml = undefined;
        return p.then(() => {
            return this.page.browser().close().catch((err) => {
                return Promise.reject(new FatalError("close", `Failed to close browser. ${err.message}`));
            });
        });
    }

    evaluate(cb, ...args) {
        this._failIfNotLoaded("evaluate");
        args = this._setupEvaluateArguments(args);
        return this.page.evaluate(cb, ...args);
    }

    setViewport(config = {}) {
        config = Object.assign({}, this.page.viewport(), config);
        return this.page.setViewport(config);
    }

    frames() {
        return this.page.frames();
    }

    mockDate(date, options) {
        const defaultOptions = {
            freeze: true
        };
        options = Object.assign({}, defaultOptions, options);
        return this.evaluate((d, f) => {
            WendigoUtils.mockDate(d, f);
        }, date.getTime(), options.freeze);
    }

    clearDateMock() {
        return this.evaluate(() => {
            WendigoUtils.clearDateMock();
        });
    }

    addScript(scriptPath) {
        this._failIfNotLoaded("addScript");
        return this.page.addScriptTag({
            path: scriptPath
        }).catch((err) => {
            return Promise.reject(new InjectScriptError("open", err));
        });
    }

    _setupEvaluateArguments(args) {
        return args.map((e) => {
            if (e instanceof DomElement) return e.element;
            else return e;
        });
    }

    _beforeClose() {
        this._settings.__onClose(this);
        if (!this._loaded) return Promise.resolve();
        return this._callComponentsMethod("_beforeClose");
    }

    async _beforeOpen(options) {
        if (this._settings.userAgent) {
            await this.page.setUserAgent(this._settings.userAgent);
        }

        if (this._settings.bypassCSP) {
            await this.page.setBypassCSP(true);
        }
        await this.setViewport(options.viewport);
        await this._callComponentsMethod("_beforeOpen", options);
    }

    _failIfNotLoaded(fnName) {
        if (!this.loaded) {
            throw new FatalError(fnName, `Cannot perform action before opening a page.`);
        }
    }

    async _afterPageLoad() {
        try {
            const content = await this.page.content();
            this._originalHtml = content;
            await this._addJsScripts();
        } catch (err) {
            if (err.message === "Evaluation failed: Event") throw new InjectScriptError("open", err.message); // CSP error
        }
        this._loaded = true;
        await this._callComponentsMethod("_afterOpen");
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

    _generateQueryString(qs) {
        if (typeof qs === 'string') {
            if (qs[0] !== "?") qs = `?${qs}`;
            return qs;
        } else {
            return `?${querystring.stringify(qs)}`;
        }
    }
};
