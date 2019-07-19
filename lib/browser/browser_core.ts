import path from 'path';
import querystring from 'querystring';

import { stringifyLogText } from '../puppeteer_wrapper/puppeteer_utils';
import WendigoConfig from '../../config';
import DomElement from '../models/dom_element';
import { FatalError, InjectScriptError } from '../errors';
import { FinalBrowserSettings, OpenSettings } from '../types';
import PuppeteerPage from '../puppeteer_wrapper/puppeteer_page';
import { ViewportOptions, ConsoleMessage, Page, Response, Frame } from '../puppeteer_wrapper/puppeteer_types';
import FailIfNotLoaded from '../decorators/fail_if_not_loaded';

const injectionScriptsPath = WendigoConfig.injectionScripts.path;
const injectionScripts = WendigoConfig.injectionScripts.files;

async function pageLog(log?: ConsoleMessage): Promise<void> {
    if (log) {
        const text = await stringifyLogText(log);
        let logType = log.type() as string;
        if (logType === 'warning') logType = 'warn';
        const con = console as any;
        if (!(con[logType])) logType = 'log';
        con[logType](text);
    }
}

const defaultOpenOptions: OpenSettings = {
    viewport: {
        width: 1440,
        height: 900,
        isMobile: false
    }
};

export default abstract class BrowserCore {
    public initialResponse: Response | null;

    protected _page: PuppeteerPage;
    protected originalHtml?: string;
    protected settings: FinalBrowserSettings;

    private _loaded: boolean;
    private _disabled: boolean;
    private _components: Array<string>;
    private _cache: boolean;

    constructor(page: PuppeteerPage, settings: FinalBrowserSettings, components: Array<string> = []) {
        this._page = page;
        this.settings = settings;
        this._loaded = false;
        this.initialResponse = null;
        this._disabled = false;
        this._cache = settings.cache !== undefined ? settings.cache : true;
        this._components = components;
        if (this.settings.log) {
            this._page.on("console", pageLog);
        }

        this._page.on('load', async (): Promise<void> => {
            if (this._loaded) {
                try {
                    await this._afterPageLoad();
                } catch (err) {
                    // Will fail if browser is closed
                }
            }
        });
    }

    public get page(): Page {
        return this._page.page;
    }
    public get loaded(): boolean {
        return this._loaded && !this._disabled;
    }

    public get incognito(): boolean {
        return Boolean(this.settings.incognito);
    }

    public get cacheEnabled(): boolean {
        return this._cache;
    }

    public async open(url: string, options?: OpenSettings): Promise<void> {
        this._loaded = false;
        options = Object.assign({}, defaultOpenOptions, options);
        url = this._processUrl(url);
        await this.setCache(this._cache);
        if (options.queryString) {
            const qs = this._generateQueryString(options.queryString);
            url = `${url}${qs}`;
        }
        try {
            await this._beforeOpen(options);
            const response = await this._page.goto(url);
            this.initialResponse = response;
            return this._afterPageLoad();
        } catch (err) {
            if (err instanceof FatalError) return Promise.reject(err);
            return Promise.reject(new FatalError("open", `Failed to open "${url}". ${err.message}`));
        }
    }

    public async openFile(filepath: string, options: OpenSettings): Promise<void> {
        const absolutePath = path.resolve(filepath);
        try {
            await this.open(`file://${absolutePath}`, options);
        } catch (err) {
            return Promise.reject(new FatalError("openFile", `Failed to open "${filepath}". File not found.`));
        }
    }

    public async close(): Promise<void> {
        if (this._disabled) return Promise.resolve();
        const p = this._beforeClose();
        this._disabled = true;
        this._loaded = false;
        this.initialResponse = null;
        this.originalHtml = undefined;
        try {
            await p;
            await this._page.browser().close();
        } catch (err) {
            return Promise.reject(new FatalError("close", `Failed to close browser. ${err.message}`));
        }
    }

    @FailIfNotLoaded
    public async evaluate(cb: (...args: Array<any>) => any, ...args: Array<any>): Promise<any> {
        args = this._setupEvaluateArguments(args);
        const rawResult = await this._page.evaluateHandle(cb, ...args);
        const resultAsElement = rawResult.asElement();
        if (resultAsElement) {
            return new DomElement(resultAsElement);
        } else return rawResult.jsonValue();
    }

    public setViewport(config: ViewportOptions = {}): Promise<void> {
        return this._page.setViewport(config);
    }

    public frames(): Array<Frame> {
        return this._page.frames();
    }

    @FailIfNotLoaded
    public async mockDate(date: Date, options = { freeze: true }): Promise<void> {
        await this.evaluate((d: number, f: boolean) => {
            WendigoUtils.mockDate(d, f);
        }, date.getTime(), options.freeze);
    }

    @FailIfNotLoaded
    public clearDateMock(): Promise<void> {
        return this.evaluate(() => {
            WendigoUtils.clearDateMock();
        });
    }

    @FailIfNotLoaded
    public async addScript(scriptPath: string): Promise<void> {
        try {
            await this._page.addScriptTag({
                path: scriptPath
            });
        } catch (err) {
            return Promise.reject(new InjectScriptError("open", err));
        }
    }

    public async setCache(value: boolean): Promise<void> {
        await this._page.setCache(value);
        this._cache = value;
    }

    protected async _beforeClose(): Promise<void> {
        this.settings.__onClose(this);
        if (!this._loaded) return Promise.resolve();
        await this._callComponentsMethod("_beforeClose");
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        if (this.settings.userAgent) {
            await this._page.setUserAgent(this.settings.userAgent);
        }

        if (this.settings.bypassCSP) {
            await this._page.setBypassCSP(true);
        }
        await this.setViewport(options.viewport);
        await this._callComponentsMethod("_beforeOpen", options);
    }

    protected async _afterPageLoad(): Promise<void> {
        try {
            const content = await this._page.content();
            this.originalHtml = content;
            await this._addJsScripts();
        } catch (err) {
            if (err.message === "Evaluation failed: Event") throw new InjectScriptError("open", err.message); // CSP error
        }
        this._loaded = true;
        await this._callComponentsMethod("_afterOpen");
    }

    private async _addJsScripts(): Promise<void> {
        const promises = injectionScripts.map((s) => {
            return this._page.addScriptTag({ // Not using wrapper as this is before loaded is true
                path: path.join(injectionScriptsPath, s)
            });
        });
        await Promise.all(promises);
    }

    private _setupEvaluateArguments(args: Array<any>): Array<any> {
        return args.map((e) => {
            if (e instanceof DomElement) return e.element;
            else return e;
        });
    }

    private async _callComponentsMethod(method: string, options?: any): Promise<void> {
        await Promise.all(this._components.map((c) => {
            const anyThis = this as any;
            if (typeof anyThis[c][method] === 'function')
                return anyThis[c][method](options);
        }));
    }

    private _generateQueryString(qs: string | { [s: string]: string; }): string {
        if (typeof qs === 'string') {
            if (qs[0] !== "?") qs = `?${qs}`;
            return qs;
        } else {
            return `?${querystring.stringify(qs)}`;
        }
    }

    private _processUrl(url: string): string {
        if (url.split("://").length === 1) {
            return `http://${url}`;
        } else return url;
    }
}
