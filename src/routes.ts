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
        ".text-m.text-neutral-text-strong.flex.items-center"
    );

    //Initiating the pagination control
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
});

router.addHandler<CompanyProfile>(labels.PROFILE, async ({ page, log }) => {
    //waiting for the header of the profile page
    await page.waitForSelector(".c-indiv-record-cards__name");

    //Constants for the locators
    const CONTACT_ID_LABEL = "text=Contact ID";
    const COMPANY_ID_LABEL = "text=Primary Associated Company ID";
    const EMAIL_LABEL = "text=Email";
    const WEB_URL = "text=Website URL";
    const COMPANY_NAME_LABEL = "text=Crossbeam - Company name";

    //matching the label with the field label in the table
    async function getFieldValue(labelLocator: string) {
        const labelElement = await page.locator(labelLocator);
        const valueElement = labelElement.locator(
            "xpath=following-sibling::div/span"
        );

        if (await valueElement.isVisible()) {
            return await valueElement.innerText();
        }

        log.info("Cannot find the information for labelLocator", {
            labelLocator,
        });

        return null;
    }

    const contactId = await getFieldValue(CONTACT_ID_LABEL);
    const email = await getFieldValue(EMAIL_LABEL);
    const company_name = await getFieldValue(COMPANY_NAME_LABEL);
    const contactWeb = await getFieldValue(WEB_URL);
    const companyId = await getFieldValue(COMPANY_ID_LABEL);

    await Dataset.pushData({
        contactId: contactId || "N/A",
        email: email || "N/A",
        company_name: company_name || "N/A",
        contactWeb: contactWeb || "N/A",
        companyId: companyId || "N/A",
    });

    await page.waitForTimeout(2000);
});
