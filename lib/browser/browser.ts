import BrowserTap from './mixins/browser_tap';
import PuppeteerPage from '../puppeteer_wrapper/puppeteer_page';
import { FinalBrowserSettings } from '../types';

// Modules
import BrowserCookies from '../modules/cookies/browser_cookies';
import BrowserLocalStorage from '../modules/local_storage/browser_local_storage';
import BrowserRequests from '../modules/requests/browser_requests';
import BrowserConsole from '../modules/console/browser_console';
import BrowserWebworker from '../modules/webworkers/browser_webworker';
import BrowserDialog from '../modules/dialog/browser_dialog';
import BrowserAuth from '../modules/auth/browser_auth';

export default class Browser extends BrowserTap {
    public readonly cookies: BrowserCookies;
    public readonly localStorage: BrowserLocalStorage;
    public readonly requests: BrowserRequests;
    public readonly console: BrowserConsole;
    public readonly webworkers: BrowserWebworker;
    public readonly dialog: BrowserDialog;
    public readonly auth: BrowserAuth;

    constructor(page: PuppeteerPage, settings: FinalBrowserSettings, components: Array<string> = []) {
        components = components.concat(["cookies", "localStorage", "requests", "console", "webworkers", "dialog"]);
        super(page, settings, components);
        this.cookies = new BrowserCookies(this);
        this.localStorage = new BrowserLocalStorage(this);
        this.requests = new BrowserRequests(this);
        this.console = new BrowserConsole(this);
        this.webworkers = new BrowserWebworker(this);
        this.dialog = new BrowserDialog(this);
        this.auth = new BrowserAuth(this);
    }
}
