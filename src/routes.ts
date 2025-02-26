import { Dataset, createPlaywrightRouter } from "crawlee";
import { BASE_URL, labels, USER_EMAIL, USER_PWD } from "./consts.js";

export const router = createPlaywrightRouter();

router.addHandler(labels.LOGIN, async ({ enqueueLinks, page, log }) => {
    log.info("Going to login page");

    await page.getByPlaceholder("Email Address").fill(USER_EMAIL);
    await page.getByPlaceholder("Password").fill(USER_PWD);
    console.log(USER_PWD);

    const loginButton = await page.locator('[data-testid="login-button"]');
    await loginButton.click();

    await page.waitForSelector(
        ".text-m.text-neutral-text-strong.flex.items-center"
    );

    //Initiating the pagination control
    let hasNextPage = true;
    let pagesHandled: string[] = [];

    while (hasNextPage) {
        log.info("Extracting the profile from the current page");

        await enqueueLinks({
            globs: ["https://app.crossbeam.com/records/111601/*"],
            label: labels.PROFILE,
        });

        //Handling the pagination
        const nextButton = await page.locator(
            ".c-paginator__link.c-paginator__link-right.px-8"
        );

        log.info("Navigating to next page...");
        await nextButton.click();

        //waiting for header
        await page.waitForSelector(
            ".text-m.text-neutral-text-strong.flex.items-center"
        );

        const activePage = await page
            .locator(".c-paginator__link--active.c-paginator__link")
            .textContent();

        if (
            activePage &&
            activePage !== pagesHandled[pagesHandled.length - 1]
        ) {
            log.info("Going to the next listing page");
            pagesHandled.push(activePage);
        } else {
            log.info("Handled the last listing page");
            hasNextPage = false;
        }
    }

    log.info("Login is successful. See the report.");

    log.info(`Enqueueing new URLs`);
    await enqueueLinks({
        globs: ["https://app.crossbeam.com/records/111601/*"],
        label: labels.PROFILE,
    });
});

router.addHandler(labels.PROFILE, async ({ request, page, log }) => {
    // some code here
});

router.addHandler("detail", async ({ request, page, log }) => {
    const title = await page.title();
    log.info(`${title}`, { url: request.loadedUrl });

    await Dataset.pushData({
        url: request.loadedUrl,
        title,
    });
});
