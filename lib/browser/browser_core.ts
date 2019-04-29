import * as path from 'path';
import * as querystring from 'querystring';
import { ConsoleMessage, Page, Response, Viewport, Frame } from 'puppeteer';

import { stringifyLogText } from '../utils/puppeteer_utils';
import WendigoConfig from '../../config';
import DomElement from '../models/dom_element';
import { FatalError, InjectScriptError } from '../errors';
import { FinalBrowserSettings, OpenSettings } from '../types';

const injectionScriptsPath = WendigoConfig.injectionScripts.path;
const injectionScripts = WendigoConfig.injectionScripts.files;

async function pageLog(log: ConsoleMessage): Promise<void> {
    const text = await stringifyLogText(log);
    let logType = log.type() as string;
    if (logType === 'warning') logType = 'warn';
    const con = console as any;
    if (!(con[logType])) logType = 'log';
    con[logType](text);
}

const defaultOpenOptions: OpenSettings = {
    viewport: {
        width: 1440,
        height: 900,
        isMobile: false
    }
};

export default abstract class BrowserCore {
    public page: Page;
    public initialResponse: Response | null;

    protected originalHtml?: string;
    protected settings: FinalBrowserSettings;

    private _loaded: boolean;
    private disabled: boolean;
    private components: Array<string>;

    constructor(page: Page, settings: FinalBrowserSettings, components: Array<string> = []) {
        this.page = page;
        this.settings = settings;
        this._loaded = false;
        this.initialResponse = null;
        this.disabled = false;
        this.components = components;
        if (this.settings.log) {
            this.page.on("console", pageLog);
        }

        this.page.on('load', async (): Promise<void> => {
            if (this._loaded) {
                try {
                    await this._afterPageLoad();
                } catch (err) {
                    // Will fail if browser is closed
                }
            }
        });
    }

    public get loaded(): boolean {
        return this._loaded && !this.disabled;
    }

    public async open(url: string, options?: OpenSettings): Promise<void> {
        this._loaded = false;
        options = Object.assign({}, defaultOpenOptions, options);
        if (options.queryString) {
            const qs = this._generateQueryString(options.queryString);
            url = `${url}${qs}`;
        }
        try {
            await this._beforeOpen(options);
            const response = await this.page.goto(url);
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
            await this.open(`file:${absolutePath}`, options);
        } catch (err) {
            return Promise.reject(new FatalError("openFile", `Failed to open "${filepath}". File not found.`));
        }
    }

    public async close(): Promise<void> {
        if (this.disabled) return Promise.resolve();
        const p = this._beforeClose();
        this.disabled = true;
        this._loaded = false;
        this.initialResponse = null;
        this.originalHtml = undefined;
        try {
            await p;
            await this.page.browser().close();
        } catch (err) {
            return Promise.reject(new FatalError("close", `Failed to close browser. ${err.message}`));
        }
    }

    public async evaluate(cb: (...args: Array<any>) => any, ...args: Array<any>): Promise<any> {
        this._failIfNotLoaded("evaluate");
        args = this._setupEvaluateArguments(args);
        const rawResult = await this.page.evaluateHandle(cb, ...args);
        const resultAsElement = rawResult.asElement();
        if (resultAsElement) {
            return new DomElement(resultAsElement);
        } else return rawResult.jsonValue();
    }

    public setViewport(config = {}): Promise<void> {
        const finalConfig = Object.assign({}, this.page.viewport(), config) as Viewport;
        return this.page.setViewport(finalConfig);
    }

    public frames(): Array<Frame> {
        return this.page.frames();
    }

    public async mockDate(date: Date, options = { freeze: true }): Promise<void> {
        await this.evaluate((d: number, f: boolean) => {
            WendigoUtils.mockDate(d, f);
        }, date.getTime(), options.freeze);
    }

    public clearDateMock(): Promise<void> {
        return this.evaluate(() => {
            WendigoUtils.clearDateMock();
        });
    }

    public async addScript(scriptPath: string): Promise<void> {
        this._failIfNotLoaded("addScript");
        try {
            await this.page.addScriptTag({
                path: scriptPath
            });
        } catch (err) {
            return Promise.reject(new InjectScriptError("open", err));
        }
    }

    protected _failIfNotLoaded(fnName: string): void {
        if (!this.loaded) {
            throw new FatalError(fnName, `Cannot perform action before opening a page.`);
        }
    }

    protected async _beforeClose(): Promise<void> {
        this.settings.__onClose(this);
        if (!this._loaded) return Promise.resolve();
        await this._callComponentsMethod("_beforeClose");
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        if (this.settings.userAgent) {
            await this.page.setUserAgent(this.settings.userAgent);
        }

        if (this.settings.bypassCSP) {
            await this.page.setBypassCSP(true);
        }
        await this.setViewport(options.viewport);
        await this._callComponentsMethod("_beforeOpen", options);
    }

    protected async _afterPageLoad(): Promise<void> {
        try {
            const content = await this.page.content();
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
            return this.page.addScriptTag({ // Not using wrapper as this is before loaded is true
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
        await Promise.all(this.components.map((c) => {
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
}
