import { Dataset, createPlaywrightRouter } from "crawlee";
import { BASE_URL, labels, USER_EMAIL, PWD } from "./consts.js";

export const router = createPlaywrightRouter();

router.addHandler(labels.LOGIN, async ({ enqueueLinks, page, log }) => {
    log.info("Going to login page");

    await page.getByPlaceholder("Email Address").fill(USER_EMAIL);
    await page.getByPlaceholder("Password").fill(PWD);

    const loginButton = await page.getByRole("button", { name: "Log In" });
    await loginButton.click();

    await page.waitForURL("https://app.crossbeam.com/dashboard"); // Change URL as needed

    log.info(`Enqueueing new URLs`);
    await enqueueLinks({
        globs: ["https://app.crossbeam.com/records/111601/*"],
        label: labels.PROFILE,
    });
});

router.addHandler("detail", async ({ request, page, log }) => {
    const title = await page.title();
    log.info(`${title}`, { url: request.loadedUrl });

    await Dataset.pushData({
        url: request.loadedUrl,
        title,
    });
});
