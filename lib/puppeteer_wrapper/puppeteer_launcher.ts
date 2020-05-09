import puppeteer from 'puppeteer';
import { FinalBrowserSettings } from '../types';
import PuppeteerContext from './puppeteer_context';
import { BrowserContext } from './puppeteer_types';
export class PuppeteerLauncher {

    public async launch(settings: FinalBrowserSettings): Promise<PuppeteerContext> {
        let instance;
        try {
            instance = await puppeteer.launch(settings);
        } catch (err) {
            // retry to avoid one-off _dl_allocate_tls_init error
            instance = await puppeteer.launch(settings);
        }
        let context: BrowserContext;
        if (settings.incognito) {
            context = await instance.createIncognitoBrowserContext();
        } else context = instance.defaultBrowserContext();

        return new PuppeteerContext(context);
    }
}
