import Wendigo from './lib/wendigo';
import BrowserInterface from './lib/browser/browser_interface';
import { WendigoPluginInterface, WendigoPluginAssertionInterface, PluginModule, BrowserSettings } from './lib/types';

import * as WendigoErrors from './lib/models/errors';

export const Errors = WendigoErrors; // tslint:disable-line variable-name

const wendigo = new Wendigo();

export async function createBrowser(settings: BrowserSettings = {}): Promise<BrowserInterface> {
    return wendigo.createBrowser(settings);
}
export async function stop(): Promise<void> {
    return wendigo.stop();
}
export function registerPlugin(name: string | PluginModule, plugin?: WendigoPluginInterface, assertions?: WendigoPluginAssertionInterface): void {
    return wendigo.registerPlugin(name, plugin, assertions);
}
export function clearPlugins(): void {
    return wendigo.clearPlugins();
}

// Types

export {
    WendigoPluginInterface, WendigoPluginAssertionInterface,
    PluginModule, BrowserSettings, WendigoSelector, GeoLocationCoords
} from './lib/types';

import { default as DomElementClass } from './lib/models/dom_element';

export interface DomElement extends DomElementClass {} // tslint:disable-line no-empty-interface

export { default as Browser } from './lib/browser/browser_interface';
