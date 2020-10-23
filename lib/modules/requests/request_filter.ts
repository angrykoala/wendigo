import isRegExp from 'lodash.isregexp';
import { Request, ResourceType } from '../../puppeteer_wrapper/puppeteer_types';
import { matchText } from '../../utils/utils';
import { ExpectedHeaders } from './types';

function processBody(body: string | RegExp | object): string | RegExp {
    if (typeof body === 'object' && !isRegExp(body)) {
        return JSON.stringify(body);
    } else return body;
}

async function filterPromise<T>(p: Promise<Array<T>>, cb: (t: T) => boolean): Promise<Array<T>> {
    const elements = await p;
    return elements.filter(cb);
}

export default class RequestFilter {
    private _requestList: Promise<Array<Request>>;

    constructor(requests: Promise<Array<Request>> = Promise.resolve([])) {
        this._requestList = requests;
    }

    get requests(): Promise<Array<Request>> {
        return this._requestList;
    }

    public url(url: string | RegExp): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            return matchText(el.url(), url);
        });
        return new RequestFilter(requests);
    }

    public method(method: string | RegExp): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            return matchText(el.method(), method);
        });
        return new RequestFilter(requests);
    }

    public postBody(body: string | RegExp | object): RequestFilter {
        const parsedBody = processBody(body);
        const requests = filterPromise(this.requests, el => {
            return matchText(el.postData(), parsedBody);
        });
        return new RequestFilter(requests);
    }

    public responseBody(body: string | RegExp | object): RequestFilter { // This one returns a promise
        const parsedBody = processBody(body);
        const requests = this.requests.then(async (req) => {
            const reqBodyPairs = await this._getResponsesBody(req);
            const filteredRequests = reqBodyPairs.map(el => {
                if (matchText(el[1], parsedBody)) return el[0];
                else return false;
            }).filter((r) => {
                return Boolean(r);
            });
            return filteredRequests as Array<Request>;
        });

        return new RequestFilter(requests);
    }

    public status(status: number): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            const response = el.response();
            if (!response) return false;
            else return response.status() === status;
        });
        return new RequestFilter(requests);
    }

    public fromCache(isFromCache = true): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            const response = el.response();
            if (!response) return false;
            else return response.fromCache() === isFromCache;
        });
        return new RequestFilter(requests);
    }

    public responseHeaders(headers: ExpectedHeaders): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            return this._responseHasHeader(el, headers);
        });
        return new RequestFilter(requests);
    }

    public ok(isOk: boolean = true): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            const response = el.response();
            if (!response) return false;
            else return response.ok() === isOk;
        });
        return new RequestFilter(requests);
    }

    public pending(): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            const response = el.response();
            return !response;
        });
        return new RequestFilter(requests);
    }

    public resourceType(type: ResourceType): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            const resourceType = el.resourceType();
            return resourceType === type;
        });
        return new RequestFilter(requests);
    }

    public contentType(type: string | RegExp): RequestFilter {
        return this.responseHeaders({
            'content-type': type
        });
    }

    private _responseHasHeader(request: Request, headers: ExpectedHeaders): boolean {
        const response = request.response();
        if (!response) return false;
        const keys = Object.keys(headers);
        for (const key of keys) {
            if (response.headers()[key] === undefined) {
                return false;
            }
            if (!matchText(response.headers()[key], headers[key])) {
                return false;
            }
        }
        return true;
    }

    private async _getResponsesBody(requests: Array<Request>): Promise<Array<[Request, string]>> {
        type requestResponsePair = [Request, string];

        const responses = await Promise.all(requests.map(async (req) => {
            const response = req.response();
            if (!response) return null;
            else {
                const text = await response.text();
                return [req, text] as requestResponsePair;
            }
        }));

        const filteredResponse = responses.filter((pair) => {
            return pair !== null;
        }) as Array<[Request, string]>;
        return filteredResponse;
    }
}
