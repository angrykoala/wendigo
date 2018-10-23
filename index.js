"use strict";

const process = require('process');
const BrowserFactory = require('./lib/browser_factory');
const puppeteer = require('puppeteer');
const Errors = require('./lib/errors');

const defaultSettings = {
    log: false,
    headless: true,
    args: [],
    slowMo: 0,
    incognito: false,
    noSandbox: false
};


const defaultPlugins = [{
    name: "cookies",
    plugin: require('./lib/modules/cookies/browser_cookies'),
    assertions: require('./lib/modules/cookies/cookies_assertion')
}, {
    name: "localStorage",
    plugin: require('./lib/modules/local_storage/browser_local_storage'),
    assertions: require('./lib/modules/local_storage/local_storage_assertions')
}, {
    name: "requests",
    plugin: require('./lib/modules/requests/browser_requests')
}, {
    name: "console",
    plugin: require('./lib/modules/console/browser_console'),
    assertions: require('./lib/modules/console/console_assertion')
}, {
    name: "webworkers",
    plugin: require('./lib/modules/webworkers/browser_webworkers'),
    assertions: require('./lib/modules/webworkers/webworkers_assertions')
}];


class Wendigo {
    constructor() {
        this.customPlugins = [];
        this.browsers = [];
    }

    createBrowser(settings = {}) {
        settings = this._processSettings(settings);
        return this._createInstance(settings).then((instance) => {
            const plugins = defaultPlugins.concat(this.customPlugins);
            return instance.newPage().then((page) => {
                const b = BrowserFactory.createBrowser(page, settings, plugins);
                this.browsers.push(b); // TODO: remove closed browser when closed with browser.close
                return b;
            });
        });
    }

    stop() {
        this.clearPlugins();
        return Promise.all(this.browsers.map((b) => {
            return b.close();
        })).then(() => this.browsers=[]); // reset browsers before returning promise.
    }

    /* eslint-disable complexity */
    registerPlugin(name, plugin, assertions) {
        if (!plugin && !assertions && typeof name === 'object') {
            const config = name;
            name = config.name;
            plugin = config.plugin;
            assertions = config.assertions;
        }

        if (!name || typeof name !== 'string') throw new Error(`Plugin requires a name.`);
        if (!this._validatePluginName(name)) throw new Error(`Invalid plugin name "${name}".`);
        if (plugin && typeof plugin !== 'function') throw new Error(`Invalid plugin module "${name}".`);
        if (assertions && typeof assertions !== 'function') throw new Error(`Invalid assertion module for plugin "${name}".`);
        if (!plugin && !assertions) throw new Error(`Invalid plugin module "${name}".`);
        BrowserFactory.clearCache();
        this.customPlugins.push({
            name: name,
            plugin: plugin,
            assertions: assertions
        });
    }
    /* eslint-enable complexity */

    clearPlugins() {
        this.customPlugins = [];
        BrowserFactory.clearCache();
    }

    get Errors() {
        return Errors;
    }

    _validatePluginName(name) {
        let invalidNames = ["assert"];
        const plugins = defaultPlugins.concat(this.customPlugins);
        invalidNames = invalidNames.concat(plugins.map(p => p.name));
        return !invalidNames.includes(name);
    }

    _createInstance(settings) {
        return puppeteer.launch(settings).then((instance) => {
            if (settings.incognito) {
                return instance.createIncognitoBrowserContext();
            } else return instance;
        });
    }

    _removeBrowser(browser) {
        idx = this.browsers.indexOf(browser);
        if (idx === -1) {
            throw new Errors.FatalError("browser not found on closing.")
        }
        this.browsers.splice(idx, 1);
    }

    _processSettings(settings) {
        settings = Object.assign({}, defaultSettings, settings);
        settings.__onClose = this._removeBrowser.bind(this);
        if (process.env.NO_SANDBOX || settings.noSandbox) {
            settings.args = settings.args.concat(['--no-sandbox', '--disable-setuid-sandbox']); // Required to run on some systems
        }

        if (settings.timezone) {
            if (!settings.env) settings.env = {};
            settings.env.TZ = settings.timezone;
        }
        return settings;
    }
}

module.exports = new Wendigo();
