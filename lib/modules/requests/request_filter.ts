import { matchText } from '../../utils/utils';
import { Request } from 'puppeteer';

interface ExpectedHeaders {
    [s: string]: string | RegExp;
}

function processBody(body: string | RegExp | object): string | RegExp {
    if (typeof body === 'object' && !(body instanceof RegExp)) {
        return JSON.stringify(body);
    } else return body;
}

async function filterPromise<T>(p: Promise<Array<T>>, cb: (t: T) => boolean): Promise<Array<T>> {
    const elements = await p;
    return elements.filter(cb);
}

export default class RequestFilter {
    private requestList: Promise<Array<Request>>;

    constructor(requests: Promise<Array<Request>> = Promise.resolve([])) {
        this.requestList = requests;
    }

    get requests(): Promise<Array<Request>> {
        return this.requestList;
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
            const reqBodyPairs = await this.getResponsesBody(req);
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
            return el.response() !== null && el.response().status() === status;
        });
        return new RequestFilter(requests);
    }

    public fromCache(isFromCache = true): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            return el.response() !== null && el.response().fromCache() === isFromCache;
        });
        return new RequestFilter(requests);
    }

    public responseHeaders(headers: ExpectedHeaders): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            return this.responseHasHeader(el, headers);
        });
        return new RequestFilter(requests);
    }

    public ok(isOk: boolean = true): RequestFilter {
        const requests = filterPromise(this.requests, el => {
            return el.response() !== null && el.response().ok() === isOk;
        });
        return new RequestFilter(requests);
    }

    private responseHasHeader(request: Request, headers: ExpectedHeaders): boolean {
        if (request.response() === null) {
            return false;
        }
        const keys = Object.keys(headers);
        for (const key of keys) {
            if (request.response().headers()[key] === undefined) {
                return false;
            }
            if (!matchText(request.response().headers()[key], headers[key])) {
                return false;
            }
        }
        return true;
    }

    private async getResponsesBody(requests: Array<Request>): Promise<Array<[Request, string]>> {
        type requestResponsePair = [Request, string];

        const responses = await Promise.all(requests.map(async (r) => {
            if (!r.response()) return null;
            else {
                const text = await r.response().text();
                return [r, text] as requestResponsePair;
            }
        }));

        return responses.filter((pair) => {
            return pair !== null;
        });
    }
};
