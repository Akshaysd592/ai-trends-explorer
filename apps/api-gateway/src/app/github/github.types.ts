
export interface GithubRepository {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
}

export interface GithubSearchResponse {
    items: GithubRepository[];
}