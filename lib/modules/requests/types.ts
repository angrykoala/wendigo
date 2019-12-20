export type RequestBody = string | object;

export interface RequestMockResponseOptions {
    status?: number;
    headers?: { [s: string]: string };
    contentType?: string;
    body?: RequestBody;
}

export interface RequestMockOptions extends RequestMockResponseOptions {
    delay?: number;
    method?: string;
    queryString?: string | { [s: string]: string };
    redirectTo?: string;
    auto?: boolean;
    continue?: boolean;
}

export interface ExpectedHeaders {
    [s: string]: string | RegExp;
}
