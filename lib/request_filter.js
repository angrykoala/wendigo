"use strict";

const utils = require('./utils');


function processBody(body) {
    if (typeof body === 'object' && !(body instanceof RegExp)) {
        return JSON.stringify(body);
    } else return body;
}

function filterPromise(p, cb) {
    return p.then((elements) => {
        return elements.filter(cb);
    });
}

module.exports = class RequestFilter {
    constructor(requests = Promise.resolve([])) {
        this._requests = requests;
    }

    get requests() {
        return this._requests;
    }

    url(url) {
        const requests = filterPromise(this._requests, el => {
            return utils.matchText(el.url(), url);
        });
        return new RequestFilter(requests);
    }

    method(method) {
        const requests = filterPromise(this._requests, el => {
            return utils.matchText(el.method(), method);
        });
        return new RequestFilter(requests);
    }

    postBody(body) {
        body = processBody(body);
        const requests = filterPromise(this._requests, el => {
            return utils.matchText(el.postData(), body);
        });

        return new RequestFilter(requests);
    }

    responseBody(body) { // This one returns a promise
        body = processBody(body);
        const requests = this._requests.then((req) => {
            return this._getResponsesBody(req).then((reqBodyPairs) => {
                return reqBodyPairs.filter(el => {
                    if (utils.matchText(el[1], body)) return el[0];
                    else return false;
                });
            });
        });

        return new RequestFilter(requests);
    }

    status(status) {
        const requests = filterPromise(this._requests, el => {
            return el.response() !== null && el.response().status() === status;
        });
        return new RequestFilter(requests);
    }

    fromCache(isFromCache = true) {
        const requests = filterPromise(this._requests, el => {
            return el.response() !== null && el.response().fromCache() === isFromCache;
        });
        return new RequestFilter(requests);
    }

    responseHeaders(headers) {
        const requests = filterPromise(this._requests, el => {
            return this._responseHasHeader(el, headers);
        });
        return new RequestFilter(requests);
    }

    ok(isOk = true) {
        const requests = filterPromise(this._requests, el => {
            return el.response() !== null && el.response().ok() === isOk;
        });
        return new RequestFilter(requests);
    }

    _responseHasHeader(request, headers) {
        if (request.response() === null) {
            return false;
        }
        const keys = Object.keys(headers);
        for (const key of keys) {
            if (request.response().headers()[key] === undefined) {
                return false;
            }
            if (!utils.matchText(request.response().headers()[key], headers[key])) {
                return false;
            }
        }
        return true;
    }

    _getResponsesBody(requests) {
        return Promise.all(requests.map((r) => {
            return r.response().text().then((t) => {
                return [r, t];
            });
        }));
    }
};
