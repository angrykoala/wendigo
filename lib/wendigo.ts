import process from 'process';
import puppeteer from 'puppeteer';
import BrowserFactory from './browser_factory';
import * as Errors from './errors';
import { WendigoPluginInterface, BrowserSettings, FinalBrowserSettings, WendigoPluginAssertionInterface, PluginModule } from './types';
import BrowserInterface from './browser/browser_interface';

const defaultSettings = {
    log: false,
    headless: true,
    args: [],
    slowMo: 0,
    incognito: false,
    noSandbox: false,
    bypassCSP: true,
    proxyServer: null
};

export default class Wendigo {
    private customPlugins: Array<PluginModule>;
    private browsers: Array<BrowserInterface>;

    constructor() {
        this.customPlugins = [];
        this.browsers = [];
    }

    public async createBrowser(settings: BrowserSettings = {}): Promise<BrowserInterface> {
        const finalSettings = this._processSettings(settings);
        const instance = await this._createInstance(finalSettings);
        const plugins = this.customPlugins;
        const page = await instance.newPage();
        const b = BrowserFactory.createBrowser(page, finalSettings, plugins);
        this.browsers.push(b);
        return b;
    }

    public async stop(): Promise<void> {
        this.clearPlugins();
        const p = Promise.all(this.browsers.map((b) => {
            return b.close();
        }));
        this.browsers = [];
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
        this.customPlugins.push({
            name: finalName,
            plugin: plugin,
            assertions: assertions
        });
    }

    public clearPlugins(): void {
        this.customPlugins = [];
        BrowserFactory.clearCache();
    }

    // public get Errors(): { [s: string]: typeof Errors.WendigoError | typeof Errors.AssertionError | typeof Errors.TimeoutError } {
    //     return {
    //         AssertionError: Errors.AssertionError,
    //         WendigoError: Errors.WendigoError,
    //         QueryError: Errors.QueryError,
    //         FatalError: Errors.FatalError,
    //         TimeoutError: Errors.TimeoutError,
    //         InjectScriptError: Errors.InjectScriptError
    //     };
    // }

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
        const plugins = this.customPlugins;
        invalidNames = invalidNames.concat(plugins.map(p => p.name)).concat(defaultModules);
        const valid = !invalidNames.includes(name);
        if (!valid) throw new Errors.FatalError("registerPlugin", `Invalid plugin name "${name}".`);
    }

    private _validatePluginAssertion(name: string, assertions?: WendigoPluginAssertionInterface): void {
        if (assertions) {
            if (typeof assertions !== 'function') throw new Errors.FatalError("registerPlugin", `Invalid assertion module for plugin "${name}".`);
        }
    }

    private async _createInstance(settings: FinalBrowserSettings): Promise<puppeteer.BrowserContext | puppeteer.Browser> {
        const instance = await puppeteer.launch(settings);
        if (settings.incognito) {
            return instance.createIncognitoBrowserContext();
        } else return instance;
    }

    private _removeBrowser(browser: BrowserInterface): void {
        const idx = this.browsers.indexOf(browser);
        if (idx === -1) {
            throw new Errors.FatalError("onClose", "browser not found on closing.");
        }
        this.browsers.splice(idx, 1);
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

        if (finalSettings.timezone) {
            if (!finalSettings.env) finalSettings.env = {
                TZ: finalSettings.timezone
            };
        }
        return finalSettings;
    }
}
