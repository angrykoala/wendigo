"use strict";

const matchText = require('../../assertions/utils/text_utils').matchText;

module.exports = class RequestSet {
    constructor(requests = []) {
        this._requests = requests;
    }

    push(el) {
        this._requests.push(el);
        return this;
    }

    get length() {
        return this._requests.length;
    }

    url(url) {
        const requests = this._requests.filter(el => {
            return matchText(el.url(), url);
        });
        return new RequestSet(requests);
    }

    method(method) {
        const requests = this._requests.filter(el => {
            return matchText(el.method(), method);
        });
        return new RequestSet(requests);
    }

    resourceType(resourceType) {
        const requests = this._requests.filter(el => {
            return matchText(el.resourceType(), resourceType);
        });
        return new RequestSet(requests);
    }

    status(status) {
        const requests = this._requests.filter(el => {
            return el.response() !== null && el.response().status() === status;
        });
        return new RequestSet(requests);
    }

    fromCache(isFromCache = true) {
        const requests = this._requests.filter(el => {
            return el.response() !== null && el.response().fromCache() === isFromCache;
        });
        return new RequestSet(requests);
    }

    headers(headers) {
        const requests = this._requests.filter(el => {
            if (el.response() === null) {
                return false;
            }
            const keys = Object.keys(headers);
            for (const key of keys) {
                if (el.response().headers()[key] === undefined) {
                    return false;
                }
                if (!matchText(el.response().headers()[key], headers[key])) {
                    return false;
                }
            }
            return true;
        });
        return new RequestSet(requests);
    }

    ok(isOk = true) {
        const requests = this._requests.filter(el => {
            return el.response() !== null && el.response().ok() === isOk;
        });
        return new RequestSet(requests);
    }
};