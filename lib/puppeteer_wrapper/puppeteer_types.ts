import { Viewport } from "puppeteer";

export type ViewportOptions = Partial<Viewport>;

export {
    Page, Frame, Viewport, EvaluateFn, SerializableOrJSHandle, JSHandle, Response, Worker,
    ScriptTagOptions, Browser, Base64ScreenShotOptions, Keyboard, Mouse, NavigationOptions, WaitForSelectorOptions, ElementHandle,
    Touchscreen, Cookie, SetCookie, DeleteCookie, PageEventObj, Request, Timeoutable, PDFOptions, ConsoleMessage, ConsoleMessageType,
    ResourceType, DialogType, Dialog, BrowserContext, Target, BrowserContextEventObj, GeoOptions, Permission, MediaType, MediaFeature,
    errors as PuppeteerErrors, CDPSession
} from 'puppeteer';
