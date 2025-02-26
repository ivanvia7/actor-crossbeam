import { BASE_URL, labels, USER_EMAIL, USER_PWD } from "./consts.js";

export async function executeLogin(page: any) {
    //Login first time
    console.log("Going to login again");

    //Login function
    await page.getByPlaceholder("Email Address").fill(USER_EMAIL);
    await page.getByPlaceholder("Password").fill(USER_PWD);
    console.log("Filling login form with user credentials.");
    await page.waitForTimeout(2000);

    const loginButton = await page.locator('[data-testid="login-button"]');
    await loginButton.click();
    await page.waitForTimeout(15000);

    console.log("Logged in successfully.");
}
