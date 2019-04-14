import Log from './log';
import { matchText, stringifyLogText } from '../../utils/utils';

import WendigoModule from '../wendigo_module';
import { LogType, ConsoleFilter } from './types';
import Browser from '../../browser/browser';
import { OpenSettings } from '../../types';

export default class BrowserConsole extends WendigoModule {
    private logs: Array<Log>;
    constructor(browser: Browser) {
        super(browser);
        this.logs = [];
        this._browser.page.on("console", async (log) => {
            const text = await stringifyLogText(log);
            this.logs.push(new Log(log, text));
        });
    }

    public get LogType(): typeof LogType {
        return LogType;
    }

    public all(): Array<Log> {
        return this.logs;
    }

    public filter(filters: ConsoleFilter = {}): Array<Log> {
        return this.logs.filter((l) => {
            if (filters.type && l.type !== filters.type) return false;
            if (filters.text && !matchText(l.text, filters.text)) return false;
            return true;
        });
    }

    public clear(): void {
        this.logs = [];
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        await super._beforeOpen(options);
        this.clear();
    }
}
