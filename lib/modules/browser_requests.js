"use strict";

const RequestFilter = require('../request_filter');
const RequestMocker = require('../request_mocker');
const BrowserModule = require('./browser_module');

module.exports = class BrowserRequests extends BrowserModule {
    constructor(browser) {
        super(browser);
        this._requestMocker = new RequestMocker();
        this.clear();
    }

    get all() {
        return this._requests._requests;
    }

    get filter() {
        return this._requests;
    }

    clear() {
        this._requests = new RequestFilter();
        this._requestMocker.clear();
    }

    _startRequestInterceptor() {
        return this._browser.page.setRequestInterception(true).then(() => {
            return this._browser.page.on('request', request => {
                this._requests._requests.push(request);
                const mockedResponse = this._requestMocker.getMockedResponse(request);
                if(mockedResponse) {
                    return request.respond(mockedResponse);
                } else{
                    return request.continue();
                }
            });
        });
    }
};
