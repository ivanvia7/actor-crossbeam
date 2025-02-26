export interface Input {
    keyword: string;
}

export interface CompanyProfile {
    company_name: string;
    website_url: string;
    company_id: number;
    email: string;
    crossbeam_email: string;
}

export interface RunStats {
    errors: Record<string, string[]>;
    totalSaved: number;
}

export interface EnqueueLinksOptions {
    globs: string[];
    label: string;
}

export type EnqueueLinksFunction = (
    options: EnqueueLinksOptions
) => Promise<any>;
