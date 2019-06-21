import DomElement from './models/dom_element';
import { ViewportOptions } from './browser/puppeteer_wrapper/puppeteer_types';

export type WendigoSelector = string | DomElement;

export interface BrowserSettings {
    log?: boolean;
    userAgent?: string;
    bypassCSP?: boolean;
    headless?: boolean;
    args?: Array<string>;
    slowMo?: number;
    incognito?: boolean;
    noSandbox?: boolean;
    proxyServer?: string | null;
    timezone?: string;
}

export interface FinalBrowserSettings extends BrowserSettings {
    __onClose: (a: any) => any;
    env?: {
        TZ: string
    };
}

export type WendigoPluginInterface = (...args: Array<any>) => any;
export type WendigoPluginAssertionInterface = (...args: Array<any>) => any;

export interface PluginModule {
    name: string;
    plugin?: WendigoPluginInterface;
    assertions?: WendigoPluginAssertionInterface;
}

export interface OpenSettings {
    viewport?: ViewportOptions;
    queryString?: string | { [s: string]: string; };
}
