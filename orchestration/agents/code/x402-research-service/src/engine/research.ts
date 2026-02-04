/**
 * Research Engine
 * Aggregates data from Twitter/X, GitHub, Web Search, and News sources
 */

import axios, { AxiosResponse } from 'axios';
// Cheerio for web scraping - using require to avoid type issues
const cheerio = require('cheerio');
import {
  ResearchRequest,
  ResearchFinding,
  ResearchSource,
  CitedSource,
  ReportMetrics,
  ResearchComplexity
} from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

// Source: Serper.dev (Google Search API)
// Source: Twitter/X API v2
// Source: GitHub REST API

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    reply_count: number;
    retweet_count: number;
  };
}

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  public_metrics?: {
    followers_count: number;
  };
  verified: boolean;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

class ResearchEngine {
  private readonly serperApiKey: string;
  private readonly twitterBearerToken?: string;
  private readonly githubToken?: string;
  private readonly openaiApiKey: string;

  constructor() {
    this.serperApiKey = config.apis.serper!.apiKey;
    this.twitterBearerToken = config.apis.twitter?.bearerToken;
    this.githubToken = config.apis.github?.token;
    this.openaiApiKey = config.apis.openai!.apiKey;
  }

  /**
   * Main research method - orchestrates all data sources
   */
  async research(request: ResearchRequest): Promise<{
    findings: ResearchFinding[];
    sources: CitedSource[];
    metrics: ReportMetrics;
  }> {
    const startTime = Date.now();
    const findings: ResearchFinding[] = [];
    const sources: CitedSource[] = [];

    const maxResults = request.maxResults || this.getMaxResultsForComplexity(request.complexity);

    logger.info(`Starting research: "${request.query}" (complexity: ${request.complexity})`);

    // Parallel data collection based on requested sources
    const promises: Promise<void>[] = [];

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

    const metrics: ReportMetrics = {
      totalSources: sources.length,
      twitterPosts: findings.filter(f => f.type === 'twitter').length,
      githubRepos: findings.filter(f => f.type === 'github').length,
      webPages: findings.filter(f => f.type === 'web' || f.type === 'news').length,
      confidenceScore: this.calculateConfidenceScore(findings, request.complexity)
    };

    logger.info(`Research completed in ${Date.now() - startTime}ms. Found ${findings.length} findings.`);

    return { findings, sources, metrics };
  }

  /**
   * Search Twitter/X for relevant posts
   */
  private async searchTwitter(
    request: ResearchRequest,
    findings: ResearchFinding[],
    sources: CitedSource[],
    maxResults: number
  ): Promise<void> {
    if (!this.twitterBearerToken) {
      logger.warn('Twitter API not configured, skipping');
      return;
    }

    try {
      // Build search query
      let query = request.query;
      if (request.timeRange === 'day') query += ' within_time:1d';
      else if (request.timeRange === 'week') query += ' within_time:7d';
      else if (request.timeRange === 'month') query += ' within_time:30d';

      if (request.filters?.verifiedOnly) query += ' is:verified';
      if (request.filters?.minFollowers && request.filters.minFollowers > 10000) {
        query += ' min_faves:100';
      }

      const response: AxiosResponse<{
        data?: TwitterTweet[];
        includes?: { users?: TwitterUser[] };
      }> = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
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
        if (!user) continue;

        // Apply follower filter manually
        if (request.filters?.minFollowers) {
          const followers = user.public_metrics?.followers_count || 0;
          if (followers < request.filters.minFollowers) continue;
        }

        const finding: ResearchFinding = {
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

    } catch (error) {
      logger.error('Twitter search failed:', error);
    }
  }

  /**
   * Search GitHub for repositories and code
   */
  private async searchGitHub(
    request: ResearchRequest,
    findings: ResearchFinding[],
    sources: CitedSource[],
    maxResults: number
  ): Promise<void> {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json'
      };
      if (this.githubToken) {
        headers.Authorization = `Bearer ${this.githubToken}`;
      }

      const response: AxiosResponse<{ items: GitHubRepo[] }> = await axios.get(
        'https://api.github.com/search/repositories',
        {
          headers,
          params: {
            q: request.query,
            sort: 'stars',
            order: 'desc',
            per_page: maxResults
          }
        }
      );

      for (const repo of (response.data.items || []).slice(0, maxResults)) {
        const finding: ResearchFinding = {
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

    } catch (error) {
      logger.error('GitHub search failed:', error);
    }
  }

  /**
   * Web search via Serper.dev (Google)
   */
  private async searchWeb(
    request: ResearchRequest,
    findings: ResearchFinding[],
    sources: CitedSource[],
    maxResults: number
  ): Promise<void> {
    try {
      const response: AxiosResponse<{
        organic?: SerperResult[];
        answerBox?: { answer?: string };
      }> = await axios.post('https://google.serper.dev/search', {
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
          if (request.filters.excludeDomains.includes(url.hostname)) continue;
        }

        const finding: ResearchFinding = {
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

    } catch (error) {
      logger.error('Web search failed:', error);
    }
  }

  /**
   * News search via Serper.dev
   */
  private async searchNews(
    request: ResearchRequest,
    findings: ResearchFinding[],
    sources: CitedSource[],
    maxResults: number
  ): Promise<void> {
    try {
      const response: AxiosResponse<{
        news?: Array<{
          title: string;
          link: string;
          snippet: string;
          date: string;
          source: string;
        }>;
      }> = await axios.post('https://google.serper.dev/news', {
        q: request.query,
        num: maxResults,
        when: request.timeRange === 'day' ? '24h' : 
              request.timeRange === 'week' ? '7d' : 
              request.timeRange === 'month' ? '30d' : undefined
      }, {
        headers: { 'X-API-KEY': this.serperApiKey }
      });

      for (const article of (response.data.news || []).slice(0, maxResults)) {
        const finding: ResearchFinding = {
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

    } catch (error) {
      logger.error('News search failed:', error);
    }
  }

  /**
   * Generate AI insight for deep research
   */
  private async generateInsight(
    query: string,
    findings: ResearchFinding[]
  ): Promise<ResearchFinding | null> {
    try {
      const context = findings
        .slice(0, 10)
        .map(f => `[${f.type}] ${f.title}: ${f.content.slice(0, 200)}`)
        .join('\n\n');

      const response: AxiosResponse<{
        choices: Array<{ message: { content: string } }>;
      }> = await axios.post('https://api.openai.com/v1/chat/completions', {
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
      if (!insight) return null;

      return {
        id: 'ai-insight',
        type: 'insight',
        title: 'Key Insights & Analysis',
        content: insight,
        relevanceScore: 1.0
      };

    } catch (error) {
      logger.error('Insight generation failed:', error);
      return null;
    }
  }

  /**
   * Calculate relevance score for Twitter content
   */
  private calculateTwitterRelevance(
    tweet: TwitterTweet,
    user: TwitterUser,
    request: ResearchRequest
  ): number {
    let score = 0.5;

    // Engagement boost
    const metrics = tweet.public_metrics;
    if (metrics) {
      score += Math.min(metrics.like_count / 1000, 0.2);
      score += Math.min(metrics.retweet_count / 500, 0.15);
    }

    // Verified boost
    if (user.verified) score += 0.1;

    // Follower boost
    const followers = user.public_metrics?.followers_count || 0;
    score += Math.min(followers / 100000, 0.1);

    return Math.min(score, 1.0);
  }

  /**
   * Calculate relevance score for GitHub repos
   */
  private calculateGitHubRelevance(repo: GitHubRepo): number {
    let score = 0.5;
    score += Math.min(repo.stargazers_count / 10000, 0.3);
    score += Math.min(repo.forks_count / 1000, 0.1);
    return Math.min(score, 1.0);
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidenceScore(
    findings: ResearchFinding[],
    complexity: ResearchComplexity
  ): number {
    if (findings.length === 0) return 0;

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
  private getMaxResultsForComplexity(complexity: ResearchComplexity): number {
    switch (complexity) {
      case 'simple': return 10;
      case 'standard': return 30;
      case 'deep': return 50;
      default: return 20;
    }
  }
}

export const researchEngine = new ResearchEngine();
