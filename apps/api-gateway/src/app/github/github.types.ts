
export interface GithubRepository {
    id: number;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    topics: string[];
    created_at: string;
    updated_at: string;
}

export interface GithubSearchResponse {
    total_count: number;
    incomplete_result: boolean;
    items: GithubRepository[];
}