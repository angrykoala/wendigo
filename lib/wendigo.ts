import process from 'process';
import puppeteer from 'puppeteer';
import { BrowserContext } from './puppeteer_wrapper/puppeteer_types';
import BrowserFactory from './browser_factory';
import * as Errors from './models/errors';
import { WendigoPluginInterface, BrowserSettings, DefaultBrowserSettings, FinalBrowserSettings, WendigoPluginAssertionInterface, PluginModule } from './types';
import BrowserInterface from './browser/browser_interface';
import PuppeteerContext from './puppeteer_wrapper/puppeteer_context';

const defaultSettings: DefaultBrowserSettings = {
    log: false,
    logRequests: false,
    headless: true,
    args: [],
    slowMo: 0,
    incognito: false,
    noSandbox: false,
    bypassCSP: true,
    proxyServer: null,
    defaultTimeout: 500
};

export default class Wendigo {
    private _customPlugins: Array<PluginModule>;
    private _browsers: Array<BrowserInterface>;

    constructor() {
        this._customPlugins = [];
        this._browsers = [];
    }

    public async createBrowser(settings: BrowserSettings = {}): Promise<BrowserInterface> {
        const finalSettings = this._processSettings(settings);
        const instance = await this._createInstance(finalSettings);
        const plugins = this._customPlugins;
        const b = await BrowserFactory.createBrowser(instance, finalSettings, plugins);
        this._browsers.push(b);
        if (settings.timezone) b.setTimezone(settings.timezone);
        return b;
    }

    public async stop(): Promise<void> {
        this.clearPlugins();
        const p = Promise.all(this._browsers.map((b) => {
            return b.close();
        }));
        this._browsers = [];
        await p;
    }

    public registerPlugin(name: string | PluginModule, plugin?: WendigoPluginInterface, assertions?: WendigoPluginAssertionInterface): void {
        let finalName: string;
        if (typeof name === 'object') {
            const config = name;
            finalName = config.name;
            plugin = config.plugin;
            assertions = config.assertions;
        } else {
            finalName = name;
        }

        this._validatePlugin(finalName, plugin, assertions);

        BrowserFactory.clearCache();
        this._customPlugins.push({
            name: finalName,
            plugin: plugin,
            assertions: assertions
        });
    }

    public clearPlugins(): void {
        this._customPlugins = [];
        BrowserFactory.clearCache();
    }

    private _validatePlugin(name: string, plugin?: WendigoPluginInterface, assertions?: WendigoPluginAssertionInterface): void {
        this._validatePluginName(name);
        if (plugin && typeof plugin !== 'function') throw new Errors.FatalError("registerPlugin", `Invalid plugin module "${name}".`);
        this._validatePluginAssertion(name, assertions);
        if (!plugin && !assertions) throw new Errors.FatalError("registerPlugin", `Invalid plugin module "${name}".`);
    }

    private _validatePluginName(name: string): void {
        if (!name || typeof name !== 'string') throw new Errors.FatalError("registerPlugin", `Plugin requires a name.`);
        let invalidNames = ["assert", "page", "not"];
        const defaultModules = ["cookies", "localStorage", "requests", "console", "webworkers", "dialog"];
        const plugins = this._customPlugins;
        invalidNames = invalidNames.concat(plugins.map(p => p.name)).concat(defaultModules);
        const valid = !invalidNames.includes(name);
        if (!valid) throw new Errors.FatalError("registerPlugin", `Invalid plugin name "${name}".`);
    }

    private _validatePluginAssertion(name: string, assertions?: WendigoPluginAssertionInterface): void {
        if (assertions) {
            if (typeof assertions !== 'function') throw new Errors.FatalError("registerPlugin", `Invalid assertion module for plugin "${name}".`);
        }
    }

    private async _createInstance(settings: FinalBrowserSettings): Promise<PuppeteerContext> {
        let instance;
        try {
            instance = await puppeteer.launch(settings);
        } catch (err) {
            // retry to avoid one-off _dl_allocate_tls_init error
            instance = await puppeteer.launch(settings);
        }
        let context: BrowserContext;
        if (settings.incognito) {
            context = await instance.createIncognitoBrowserContext();
        } else context = await instance.defaultBrowserContext();

        return new PuppeteerContext(context);
    }

    private _removeBrowser(browser: BrowserInterface): void {
        const idx = this._browsers.indexOf(browser);
        if (idx === -1) {
            throw new Errors.FatalError("onClose", "browser not found on closing.");
        }
        this._browsers.splice(idx, 1);
    }

    private _processSettings(settings: BrowserSettings): FinalBrowserSettings {
        const onClose = this._removeBrowser.bind(this);
        const finalSettings = Object.assign({ __onClose: onClose }, defaultSettings, settings) as FinalBrowserSettings;
        if (!finalSettings.args) finalSettings.args = [];
        if (process.env.NO_SANDBOX || finalSettings.noSandbox) {
            finalSettings.args = finalSettings.args.concat(['--no-sandbox', '--disable-setuid-sandbox']); // Required to run on some systems
        }

        if (finalSettings.proxyServer) {
            finalSettings.args.push(`--proxy-server=${settings.proxyServer}`);
        }
        return finalSettings;
    }
}
