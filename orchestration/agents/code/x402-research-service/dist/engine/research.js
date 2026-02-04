"use strict";
/**
 * Research Engine
 * Aggregates data from Twitter/X, GitHub, Web Search, and News sources
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchEngine = void 0;
const axios_1 = __importDefault(require("axios"));
// Cheerio for web scraping - using require to avoid type issues
const cheerio = require('cheerio');
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class ResearchEngine {
    serperApiKey;
    twitterBearerToken;
    githubToken;
    openaiApiKey;
    constructor() {
        this.serperApiKey = config_1.config.apis.serper.apiKey;
        this.twitterBearerToken = config_1.config.apis.twitter?.bearerToken;
        this.githubToken = config_1.config.apis.github?.token;
        this.openaiApiKey = config_1.config.apis.openai.apiKey;
    }
    /**
     * Main research method - orchestrates all data sources
     */
    async research(request) {
        const startTime = Date.now();
        const findings = [];
        const sources = [];
        const maxResults = request.maxResults || this.getMaxResultsForComplexity(request.complexity);
        logger_1.logger.info(`Starting research: "${request.query}" (complexity: ${request.complexity})`);
        // Parallel data collection based on requested sources
        const promises = [];
        if (request.sources.includes('twitter') || request.sources.includes('all')) {
            promises.push(this.searchTwitter(request, findings, sources, maxResults));
        }
        if (request.sources.includes('github') || request.sources.includes('all')) {
            promises.push(this.searchGitHub(request, findings, sources, maxResults));
        }
        if (request.sources.includes('web') || request.sources.includes('all')) {
            promises.push(this.searchWeb(request, findings, sources, maxResults));
        }
        if (request.sources.includes('news') || request.sources.includes('all')) {
            promises.push(this.searchNews(request, findings, sources, maxResults));
        }
        await Promise.allSettled(promises);
        // Sort findings by relevance score
        findings.sort((a, b) => b.relevanceScore - a.relevanceScore);
        // Generate insights using OpenAI for complex queries
        if (request.complexity === 'deep') {
            const insight = await this.generateInsight(request.query, findings);
            if (insight) {
                findings.unshift(insight);
            }
        }
        const metrics = {
            totalSources: sources.length,
            twitterPosts: findings.filter(f => f.type === 'twitter').length,
            githubRepos: findings.filter(f => f.type === 'github').length,
            webPages: findings.filter(f => f.type === 'web' || f.type === 'news').length,
            confidenceScore: this.calculateConfidenceScore(findings, request.complexity)
        };
        logger_1.logger.info(`Research completed in ${Date.now() - startTime}ms. Found ${findings.length} findings.`);
        return { findings, sources, metrics };
    }
    /**
     * Search Twitter/X for relevant posts
     */
    async searchTwitter(request, findings, sources, maxResults) {
        if (!this.twitterBearerToken) {
            logger_1.logger.warn('Twitter API not configured, skipping');
            return;
        }
        try {
            // Build search query
            let query = request.query;
            if (request.timeRange === 'day')
                query += ' within_time:1d';
            else if (request.timeRange === 'week')
                query += ' within_time:7d';
            else if (request.timeRange === 'month')
                query += ' within_time:30d';
            if (request.filters?.verifiedOnly)
                query += ' is:verified';
            if (request.filters?.minFollowers && request.filters.minFollowers > 10000) {
                query += ' min_faves:100';
            }
            const response = await axios_1.default.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: { Authorization: `Bearer ${this.twitterBearerToken}` },
                params: {
                    query,
                    max_results: Math.min(maxResults, 100),
                    'tweet.fields': 'created_at,public_metrics,author_id',
                    'user.fields': 'username,public_metrics,verified',
                    expansions: 'author_id'
                }
            });
            const tweets = response.data.data || [];
            const users = new Map((response.data.includes?.users || []).map(u => [u.id, u]));
            for (const tweet of tweets.slice(0, maxResults)) {
                const user = users.get(tweet.author_id);
                if (!user)
                    continue;
                // Apply follower filter manually
                if (request.filters?.minFollowers) {
                    const followers = user.public_metrics?.followers_count || 0;
                    if (followers < request.filters.minFollowers)
                        continue;
                }
                const finding = {
                    id: `tw-${tweet.id}`,
                    type: 'twitter',
                    title: `Post by @${user.username}`,
                    content: tweet.text,
                    url: `https://twitter.com/${user.username}/status/${tweet.id}`,
                    author: `@${user.username} (${user.name})`,
                    timestamp: tweet.created_at,
                    engagement: {
                        likes: tweet.public_metrics?.like_count,
                        replies: tweet.public_metrics?.reply_count,
                        shares: tweet.public_metrics?.retweet_count
                    },
                    relevanceScore: this.calculateTwitterRelevance(tweet, user, request)
                };
                findings.push(finding);
            }
            sources.push({
                id: 'twitter-search',
                type: 'twitter',
                url: `https://twitter.com/search?q=${encodeURIComponent(request.query)}`,
                title: 'Twitter/X Search Results',
                accessedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Twitter search failed:', error);
        }
    }
    /**
     * Search GitHub for repositories and code
     */
    async searchGitHub(request, findings, sources, maxResults) {
        try {
            const headers = {
                Accept: 'application/vnd.github.v3+json'
            };
            if (this.githubToken) {
                headers.Authorization = `Bearer ${this.githubToken}`;
            }
            const response = await axios_1.default.get('https://api.github.com/search/repositories', {
                headers,
                params: {
                    q: request.query,
                    sort: 'stars',
                    order: 'desc',
                    per_page: maxResults
                }
            });
            for (const repo of (response.data.items || []).slice(0, maxResults)) {
                const finding = {
                    id: `gh-${repo.id}`,
                    type: 'github',
                    title: repo.full_name,
                    content: `${repo.description || 'No description'}\n⭐ ${repo.stargazers_count} stars | 🍴 ${repo.forks_count} forks | ${repo.language || 'Unknown language'}`,
                    url: repo.html_url,
                    author: repo.owner.login,
                    timestamp: repo.updated_at,
                    relevanceScore: this.calculateGitHubRelevance(repo)
                };
                findings.push(finding);
            }
            sources.push({
                id: 'github-search',
                type: 'github',
                url: `https://github.com/search?q=${encodeURIComponent(request.query)}&type=repositories`,
                title: 'GitHub Repository Search',
                accessedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('GitHub search failed:', error);
        }
    }
    /**
     * Web search via Serper.dev (Google)
     */
    async searchWeb(request, findings, sources, maxResults) {
        try {
            const response = await axios_1.default.post('https://google.serper.dev/search', {
                q: request.query,
                num: maxResults
            }, {
                headers: { 'X-API-KEY': this.serperApiKey }
            });
            // Add answer box if available
            if (response.data.answerBox?.answer) {
                findings.push({
                    id: 'web-answerbox',
                    type: 'web',
                    title: 'Quick Answer',
                    content: response.data.answerBox.answer,
                    relevanceScore: 0.95
                });
            }
            // Process organic results
            for (const result of (response.data.organic || []).slice(0, maxResults)) {
                // Skip excluded domains
                if (request.filters?.excludeDomains) {
                    const url = new URL(result.link);
                    if (request.filters.excludeDomains.includes(url.hostname))
                        continue;
                }
                const finding = {
                    id: `web-${Buffer.from(result.link).toString('base64').slice(0, 12)}`,
                    type: 'web',
                    title: result.title,
                    content: result.snippet,
                    url: result.link,
                    relevanceScore: 0.7 + (Math.random() * 0.2) // Base score with slight variance
                };
                findings.push(finding);
                sources.push({
                    id: finding.id,
                    type: 'web',
                    url: result.link,
                    title: result.title,
                    accessedAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Web search failed:', error);
        }
    }
    /**
     * News search via Serper.dev
     */
    async searchNews(request, findings, sources, maxResults) {
        try {
            const response = await axios_1.default.post('https://google.serper.dev/news', {
                q: request.query,
                num: maxResults,
                when: request.timeRange === 'day' ? '24h' :
                    request.timeRange === 'week' ? '7d' :
                        request.timeRange === 'month' ? '30d' : undefined
            }, {
                headers: { 'X-API-KEY': this.serperApiKey }
            });
            for (const article of (response.data.news || []).slice(0, maxResults)) {
                const finding = {
                    id: `news-${Buffer.from(article.link).toString('base64').slice(0, 12)}`,
                    type: 'news',
                    title: article.title,
                    content: article.snippet,
                    url: article.link,
                    author: article.source,
                    timestamp: article.date,
                    relevanceScore: 0.75
                };
                findings.push(finding);
            }
        }
        catch (error) {
            logger_1.logger.error('News search failed:', error);
        }
    }
    /**
     * Generate AI insight for deep research
     */
    async generateInsight(query, findings) {
        try {
            const context = findings
                .slice(0, 10)
                .map(f => `[${f.type}] ${f.title}: ${f.content.slice(0, 200)}`)
                .join('\n\n');
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a research analyst. Provide a concise analysis (2-3 sentences) of the key trends and insights based on the provided data.'
                    },
                    {
                        role: 'user',
                        content: `Query: ${query}\n\nData:\n${context}\n\nProvide key insights:`
                    }
                ],
                max_tokens: 150
            }, {
                headers: {
                    Authorization: `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const insight = response.data.choices[0]?.message?.content;
            if (!insight)
                return null;
            return {
                id: 'ai-insight',
                type: 'insight',
                title: 'Key Insights & Analysis',
                content: insight,
                relevanceScore: 1.0
            };
        }
        catch (error) {
            logger_1.logger.error('Insight generation failed:', error);
            return null;
        }
    }
    /**
     * Calculate relevance score for Twitter content
     */
    calculateTwitterRelevance(tweet, user, request) {
        let score = 0.5;
        // Engagement boost
        const metrics = tweet.public_metrics;
        if (metrics) {
            score += Math.min(metrics.like_count / 1000, 0.2);
            score += Math.min(metrics.retweet_count / 500, 0.15);
        }
        // Verified boost
        if (user.verified)
            score += 0.1;
        // Follower boost
        const followers = user.public_metrics?.followers_count || 0;
        score += Math.min(followers / 100000, 0.1);
        return Math.min(score, 1.0);
    }
    /**
     * Calculate relevance score for GitHub repos
     */
    calculateGitHubRelevance(repo) {
        let score = 0.5;
        score += Math.min(repo.stargazers_count / 10000, 0.3);
        score += Math.min(repo.forks_count / 1000, 0.1);
        return Math.min(score, 1.0);
    }
    /**
     * Calculate overall confidence score
     */
    calculateConfidenceScore(findings, complexity) {
        if (findings.length === 0)
            return 0;
        const avgRelevance = findings.reduce((sum, f) => sum + f.relevanceScore, 0) / findings.length;
        const sourceDiversity = new Set(findings.map(f => f.type)).size;
        let score = avgRelevance * 0.6;
        score += Math.min(sourceDiversity / 4, 1) * 0.3;
        score += Math.min(findings.length / 20, 1) * 0.1;
        return Math.round(score * 100) / 100;
    }
    /**
     * Get max results based on complexity tier
     */
    getMaxResultsForComplexity(complexity) {
        switch (complexity) {
            case 'simple': return 10;
            case 'standard': return 30;
            case 'deep': return 50;
            default: return 20;
        }
    }
}
exports.researchEngine = new ResearchEngine();
//# sourceMappingURL=research.js.map