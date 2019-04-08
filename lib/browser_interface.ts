import Browser from './browser/browser';

import BrowserCookies from './modules/cookies/browser_cookies';
import BrowserLocalStorage from './modules/local_storage/browser_local_storage';
import BrowserRequests from './modules/requests/browser_requests';
import BrowserConsole from './modules/console/browser_console';
import BrowserWebworker from './modules/webworkers/browser_webworker';
import BrowserDialog from './modules/dialog/browser_dialog';

import AssertionsModule from './modules/assertions/browser_assertions';
import BrowserNotAssertions from './modules/assertions/browser_not_assertions';
import BrowserLocalStorageAssertions from './modules/local_storage/local_storage_assertions';
import { ConsoleFilter } from './modules/console/types';

interface NotAssertions extends BrowserNotAssertions {
    cookies: (name: string, expected?: string, msg?: string) => Promise<void>;
}

// NOTE: duplicate definitions
interface BrowserAssertions extends AssertionsModule {
    not: NotAssertions;
    localStorage: BrowserLocalStorageAssertions;
    console: (filterOptions: ConsoleFilter, count?: number, msg?: string) => Promise<void>;
    webworkers: (options: { url?: string, count?: number }, msg?: string) => Promise<void>;
}

export default interface WendigoBrowser extends Browser {
    assert: BrowserAssertions;
    cookies: BrowserCookies;
    localStorage: BrowserLocalStorage;
    requests: BrowserRequests;
    console: BrowserConsole;
    webworkers: BrowserWebworker;
    dialog: BrowserDialog;
}
