import { Dataset, RequestQueue, createPlaywrightRouter } from "crawlee";
import { BASE_URL, labels, USER_EMAIL, USER_PWD } from "./consts.js";
import { CompanyProfile } from "./types.js";

export const router = createPlaywrightRouter();

router.addHandler(labels.LOGIN, async ({ enqueueLinks, page, log }) => {
    log.info("Going to login page");

    await page.getByPlaceholder("Email Address").fill(USER_EMAIL);
    await page.getByPlaceholder("Password").fill(USER_PWD);
    log.info("Filling login form with user credentials.");

    const loginButton = await page.locator('[data-testid="login-button"]');
    await loginButton.click();

    await page.waitForSelector(
        ".text-m.text-neutral-text-strong.flex.items-center",
        { timeout: 60000 }
    );

    await page.waitForTimeout(2000);

    // Initiating the pagination control
    let hasNextPage = true;
    let pagesHandled: string[] = [];

    while (hasNextPage) {
        await enqueueLinks({
            globs: ["https://app.crossbeam.com/records/111601/*"],
            label: labels.PROFILE,
        });

        //Handling the pagination
        const nextButton = await page.locator(
            ".c-paginator__link.c-paginator__link-right.px-8"
        );

        if (nextButton) {
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
        } else {
            log.info("No next page button, ending pagination.");
            hasNextPage = false;
        }
    }

    log.info("Login is successful. See the report.");

    await enqueueLinks({
        globs: ["https://app.crossbeam.com/records/111601/*"],
        label: labels.PROFILE,
    });
});

router.addHandler<CompanyProfile>(labels.PROFILE, async ({ page, log }) => {
    // Waiting for the header of the profile page
    await page.waitForSelector(".text-lg.font-bold.text-neutral-text-strong", {
        timeout: 60000,
    });

    // Constants for the locators
    const CONTACT_ID_SELECTOR =
        'div.c-card-records__org__field__label:has-text("Contact ID") + div.c-card-records__org__field__value span';
    const COMPANY_ID_SELECTOR =
        'div.c-card-records__org__field__label:has-text("Primary Associated Company ID") + div.c-card-records__org__field__value span';
    const EMAIL_SELECTOR =
        'div.c-card-records__org__field__label:has-text("Email") + div.c-card-records__org__field__value span';
    const WEB_SELECTOR =
        'div.c-card-records__org__field__label:has-text("Website URL") + div.c-card-records__org__field__value span';
    const SUBSCRIPTION_PLAN_SELECTOR =
        'div.c-card-records__org__field__label:has-text("Crossbeam - Subscription plan") + div.c-card-records__org__field__value span';
    const COMPANY_NAME_SELECTOR =
        'div.c-card-records__org__field__label:has-text("Crossbeam - Company name") + div.c-card-records__org__field__value span';

    // Function to safely extract inner text, return "N/A" if not found
    async function getText(selector: string) {
        try {
            const text = await page.locator(selector).first().innerText();
            return text || "N/A";
        } catch (error) {
            console.error(
                `Error fetching data for selector: ${selector}`,
                error
            );
            return "N/A";
        }
    }

    // Extracting values using the getText function
    const contactId = await getText(CONTACT_ID_SELECTOR);
    const companyId = await getText(COMPANY_ID_SELECTOR);
    const email = await getText(EMAIL_SELECTOR);
    const subscriptionPlan = await getText(SUBSCRIPTION_PLAN_SELECTOR);
    const companyName = await getText(COMPANY_NAME_SELECTOR);
    const contactWeb = await getText(WEB_SELECTOR);

    await Dataset.pushData({
        contactId,
        email,
        company_name: companyName,
        contactWeb,
        companyId,
        subscriptionPlan,
    });

    log.info("Just finished with:", { companyName });

    await page.waitForTimeout(3000);
});
