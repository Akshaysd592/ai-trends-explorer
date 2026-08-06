import { Trend } from "@ai-trend-explorer/shared-types";
import { GithubRepository } from "./github.types";


export class GithubMapper{
    static toTrend(repo: GithubRepository):Trend{
        return{
            id: repo.id.toString(),
            title: repo.full_name,
            description: repo.description ?? '',
            source: 'Github',
            score: repo.stargazers_count,
            stars: repo.stargazers_count,
            url: repo.html_url,
            language: repo.language,
        }
    }
}