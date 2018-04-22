"use strict";

const RequestMethods = {
    ALL: "ALL"
};

module.exports = class RequestMocker {
    constructor() {
        this._mockedRequests = new Map();
    }

    getMockedResponse(request) {
        const url = request.url();
        const method = request.method();
        return this._getMockData(url, method);
    }

    mockRequest(url, response, method = RequestMethods.ALL) {
        const mockData = this._mockedRequests.get(url) || {};
        mockData[method] = response;
        this._mockedRequests.set(url, mockData);
    }

    clear() {
        this._mockedRequests.clear();
    }

    _getMockData(url, method = RequestMethods.ALL) {
        const mockData = this._mockedRequests.get(url) || {};
        return mockData[method] || mockData[RequestMethods.ALL];
    }

};
