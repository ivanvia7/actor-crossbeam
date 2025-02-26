/**
 * This template is a production ready boilerplate for developing with `PlaywrightCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://docs.apify.com/sdk/js
import { Actor } from "apify";
// For more information, see https://crawlee.dev
import { PlaywrightCrawler } from "crawlee";
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
import { router } from "./routes.js";
import { firefox } from "playwright"; // Import Firefox from Playwright

import { BASE_URL, labels } from "./consts.js";
import dotenv from "dotenv";
dotenv.config();

interface Input {
    startUrls: string[];
    maxRequestsPerCrawl: number;
}

// Initialize the Apify SDK
await Actor.init();

// Structure of input is defined in input_schema.json
// const { startUrls = ["https://crawlee.dev"], maxRequestsPerCrawl = 100 } =
//     (await Actor.getInput<Input>()) ?? ({} as Input);

const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ["CZECH_LUMINATI"],
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: router,
    maxRequestRetries: 2,
    maxConcurrency: 1,
    requestHandlerTimeoutSecs: 3600,
    launchContext: {
        launchOptions: {
            args: [
                "--disable-gpu", // Mitigates the "crashing GPU process" issue in Docker containers
                "--ignore-certificate-errors", // Ignore SSL certificate errors
            ],
            headless: true,
            timeout: 0,
            slowMo: 800,
        },
    },
});

await crawler.run([
    {
        url: BASE_URL,
        label: labels.LOGIN,
    },
]);

// Exit successfully
await Actor.exit();
