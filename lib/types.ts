import DomElement from './models/dom_element';
import { ViewportOptions, GeoOptions, MediaType, MediaFeature } from './puppeteer_wrapper/puppeteer_types';

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
    cache?: boolean;
    defaultTimeout?: number;
}

export interface DefaultBrowserSettings extends BrowserSettings {
    log: boolean;
    logRequests: boolean;
    headless: boolean;
    args: Array<string>;
    incognito: boolean;
    noSandbox: boolean;
    proxyServer: string | null;
    defaultTimeout: number;
}

export interface FinalBrowserSettings extends DefaultBrowserSettings {
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
    geolocation?: GeoOptions;
    headers?: Record<string, string>;
    dismissAllDialogs?: boolean;
}

export interface GeoLocationCoords {
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    latitude?: number;
    longitude?: number;
    speed?: number;
}

export interface MediaOptions {
    type?: MediaType;
    features?: Array<MediaFeature>;
}
