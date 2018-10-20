"use strict";

const process = require('process');
const deepEqual = require('deep-equal');
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


const customPlugins = [];

class Wendigo {
    createBrowser(settings = {}) {
        settings = this._processSettings(settings);
        let p = Promise.resolve();
        if (!deepEqual(this._lastSettings, settings)) {
            p = this.stop();
        }
        return p.then(() => {
            this._lastSettings = settings;
            return this._setInstance(settings).then(() => {
                return this._getMainPage().then((page) => {
                    const plugins = defaultPlugins.concat(customPlugins);
                    return BrowserFactory.createBrowser(page, settings, plugins);
                });
            });
        });
    }

    stop() {
        if (this.instance) {
            return this.instance.close().then(() => {
                this._clearInstance();
            });
        } else return Promise.resolve();
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
        customPlugins.push({
            name: name,
            plugin: plugin,
            assertions: assertions
        });
    }
    /* eslint-enable complexity */

    clearPlugins() {
        customPlugins.splice(0, customPlugins.length);
        BrowserFactory.clearCache();
    }

    get Errors() {
        return Errors;
    }

    _clearInstance() {
        this.instance = null;
        BrowserFactory.clearCache();
    }

    _getMainPage() {
        return this.instance.newPage();
    }

    _validatePluginName(name) {
        let invalidNames = ["assert"];
        const plugins = defaultPlugins.concat(customPlugins);
        invalidNames = invalidNames.concat(plugins.map(p => p.name));
        return !invalidNames.includes(name);
    }

    _setInstance(settings) {
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

    _processSettings(settings) {
        settings = Object.assign({}, defaultSettings, settings);
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
