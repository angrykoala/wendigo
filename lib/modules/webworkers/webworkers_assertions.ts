import * as assertUtils from '../../utils/assert_utils';
import WebWorker from '../../models/webworker';
import BrowserWebWorker from './browser_webworker';
import { Browser } from 'puppeteer';

/* eslint-disable complexity */
export default function(browser: Browser, webworkerModule: BrowserWebWorker, options: { url?: string, count?: number }, msg?: string): Promise<void> {
    if (!options) options = {};
    let workers = webworkerModule.all();
    let urlMsg = "";
    if (options.url) {
        urlMsg = ` with url "${options.url}"`;
        workers = workers.filter((w) => {
            return w.url === options.url;
        });
    }
    if (options.count !== undefined && options.count !== null) {
        if (workers.length !== options.count) {
            if (!msg) msg = `Expected ${options.count} webworkers running${urlMsg}, ${workers.length} found.`;
            return assertUtils.rejectAssertion("assert.webworkers", msg);
        }
    } else if (workers.length === 0) {
        if (!msg) msg = `Expected at least 1 webworker running${urlMsg}, 0 found.`;
        return assertUtils.rejectAssertion("assert.webworkers", msg);
    }
    return Promise.resolve();
}
/* eslint-enable complexity */
