import Log from './log';
import { matchText } from '../../utils/utils';
import { stringifyLogText } from '../../puppeteer_wrapper/puppeteer_utils';

import WendigoModule from '../wendigo_module';
import { LogType, ConsoleFilter } from './types';
import Browser from '../../browser/browser';
import { OpenSettings } from '../../types';
import { ConsoleMessage } from '../../puppeteer_wrapper/puppeteer_types';

export default class BrowserConsole extends WendigoModule {
    private _logs: Array<Log>;
    constructor(browser: Browser) {
        super(browser);
        this._logs = [];
        this._page.on("console", async (log: ConsoleMessage) => {
            if (log) {
                const text = await stringifyLogText(log);
                this._logs.push(new Log(log, text));
            }
        });
    }

    public get LogType(): typeof LogType {
        return LogType;
    }

    public all(): Array<Log> {
        return this._logs;
    }

    public filter(filters: ConsoleFilter = {}): Array<Log> {
        return this._logs.filter((l) => {
            if (filters.type && l.type !== filters.type) return false;
            if (filters.text && !matchText(l.text, filters.text)) return false;
            return true;
        });
    }

    public clear(): void {
        this._logs = [];
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        await super._beforeOpen(options);
        this.clear();
    }
}
