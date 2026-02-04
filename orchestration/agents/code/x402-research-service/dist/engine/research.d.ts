/**
 * Research Engine
 * Aggregates data from Twitter/X, GitHub, Web Search, and News sources
 */
import { ResearchRequest, ResearchFinding, CitedSource, ReportMetrics } from '../types';
declare class ResearchEngine {
    private readonly serperApiKey;
    private readonly twitterBearerToken?;
    private readonly githubToken?;
    private readonly openaiApiKey;
    constructor();
    /**
     * Main research method - orchestrates all data sources
     */
    research(request: ResearchRequest): Promise<{
        findings: ResearchFinding[];
        sources: CitedSource[];
        metrics: ReportMetrics;
    }>;
    /**
     * Search Twitter/X for relevant posts
     */
    private searchTwitter;
    /**
     * Search GitHub for repositories and code
     */
    private searchGitHub;
    /**
     * Web search via Serper.dev (Google)
     */
    private searchWeb;
    /**
     * News search via Serper.dev
     */
    private searchNews;
    /**
     * Generate AI insight for deep research
     */
    private generateInsight;
    /**
     * Calculate relevance score for Twitter content
     */
    private calculateTwitterRelevance;
    /**
     * Calculate relevance score for GitHub repos
     */
    private calculateGitHubRelevance;
    /**
     * Calculate overall confidence score
     */
    private calculateConfidenceScore;
    /**
     * Get max results based on complexity tier
     */
    private getMaxResultsForComplexity;
}
export declare const researchEngine: ResearchEngine;
export {};
//# sourceMappingURL=research.d.ts.map