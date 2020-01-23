import PuppeteerPage from "../../puppeteer_wrapper/puppeteer_page";

export default class HeaderHelper {
    private _page: PuppeteerPage;
    private authorizationHeader: string | undefined;
    private extraHeaders: Record<string, string> | undefined;

    constructor(page: PuppeteerPage) {
        this._page = page;
        this.authorizationHeader = "";
    }

    public setAuthHeader(value: string | undefined): Promise<void> {
        this.authorizationHeader = value;
        return this.setPageHeaders();
    }

    public setExtraHeaders(extraHeaders: Record<string, string> | undefined): Promise<void> {
        this.extraHeaders = extraHeaders || {};
        return this.setPageHeaders();
    }

    protected setPageHeaders(): Promise<void> {
        const headers = Object.assign({}, this.extraHeaders || {});
        if (this.authorizationHeader) headers.authorization = this.authorizationHeader;
        return this._page.setExtraHTTPHeaders(headers);
    }
}
