import * as assertUtils from '../../utils/assert_utils';
import BrowserWebWorker from './browser_webworker';
import WebWorker from './webworker';

interface WebWorkersOptions {
    url?: string;
    count?: number;
}

export default async function(webworkerModule: BrowserWebWorker, options?: WebWorkersOptions, msg?: string): Promise<void> {
    if (!options) options = {};
    let workers = webworkerModule.all();
    let urlMsg = "";
    if (options.url) {
        urlMsg = ` with url "${options.url}"`;
    }
    workers = filterByUrl(workers, options);
    if (options.count !== undefined && options.count !== null) {
        if (workers.length !== options.count) {
            if (!msg) msg = `Expected ${options.count} webworkers running${urlMsg}, ${workers.length} found.`;
            await assertUtils.rejectAssertion("assert.webworkers", msg);
        }
    } else if (workers.length === 0) {
        if (!msg) msg = `Expected at least 1 webworker running${urlMsg}, 0 found.`;
        await assertUtils.rejectAssertion("assert.webworkers", msg);
    }
}

function filterByUrl(workers: Array<WebWorker>, options: WebWorkersOptions): Array<WebWorker> {
    if (options.url) {
        return workers.filter((w) => {
            return w.url === options.url;
        });
    } else return workers;
}
