import dotenv from "dotenv";
dotenv.config();

export const BASE_URL =
    "https://app.crossbeam.com/reports/view?consolidated_report_type=overlaps&our_population_ids=62494&partner_population_ids=54892&filters=JTVCJTVE&name=Your+Customers+vs.+Make+(formerly+Integromat)%27s+Customers&partner_standard_populations=&columns=JTVCJTdCJTIyY29sdW1uX3R5cGUlMjIlM0ElMjJvdmVybGFwX3RpbWUlMjIlMkMlMjJjb2x1bW5fb3JkZXIlMjIlM0EyJTdEJTVE";

export const labels = {
    LOGIN: "LOGIN",
    LISTING: "LISTING",
    PROFILE: "PROFILE",
};

if (!process.env.USER_NAME || !process.env.USER_PWD) {
    throw new Error("Missing environment variables for USER_NAME or USER_PWD.");
}

export const USER_EMAIL: string = process.env.USER_NAME;
export const USER_PWD: string = process.env.USER_PWD;
