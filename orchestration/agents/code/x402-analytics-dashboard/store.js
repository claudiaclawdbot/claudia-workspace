/**
 * Analytics Store
 * 
 * In-memory data store for analytics data.
 * Handles transactions, service metrics, and analytics queries.
 */

export class AnalyticsStore {
  constructor() {
    // Core data structures
    this.transactions = new Map();
    this.services = new Map();
    this.hourlyStats = new Map();
    this.dailyStats = new Map();
    
    // Initialize with sample data for demonstration
    this.seedSampleData();
  }
  
  // ============================================================================
  // Transaction Recording
  // ============================================================================
  
  recordTransaction(data) {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id,
      ...data,
      recordedAt: new Date().toISOString()
    };
    
    this.transactions.set(id, transaction);
    
    // Update service stats
    this.updateServiceStats(data.serviceId, data);
    
    // Update hourly stats
    this.updateHourlyStats(data);
    
    // Update daily stats
    this.updateDailyStats(data);
    
    // Keep only last 90 days of transactions (memory management)
    this.pruneOldData();
    
    return transaction;
  }
  
  updateServiceStats(serviceId, data) {
    if (!this.services.has(serviceId)) {
      this.services.set(serviceId, {
        id: serviceId,
        name: data.serviceName || serviceId,
        category: data.category || 'unknown',
        totalTransactions: 0,
        totalRevenue: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        firstActive: data.timestamp,
        lastActive: data.timestamp,
        health: 'healthy'
      });
    }
    
    const service = this.services.get(serviceId);
    service.totalTransactions++;
    service.lastActive = data.timestamp;
    
    if (data.status === 'success') {
      service.totalRevenue += parseFloat(data.amount) || 0;
      service.successfulTransactions++;
    } else {
      service.failedTransactions++;
    }
  }
  
  updateHourlyStats(data) {
    const hour = data.timestamp.substring(0, 13); // "2026-02-02T15"
    
    if (!this.hourlyStats.has(hour)) {
      this.hourlyStats.set(hour, {
        hour,
        transactions: 0,
        revenue: 0,
        services: new Set()
      });
    }
    
    const stats = this.hourlyStats.get(hour);
    stats.transactions++;
    stats.revenue += parseFloat(data.amount) || 0;
    stats.services.add(data.serviceId);
  }
  
  updateDailyStats(data) {
    const day = data.timestamp.substring(0, 10); // "2026-02-02"
    
    if (!this.dailyStats.has(day)) {
      this.dailyStats.set(day, {
        day,
        transactions: 0,
        revenue: 0,
        services: new Set(),
        byCategory: {}
      });
    }
    
    const stats = this.dailyStats.get(day);
    stats.transactions++;
    stats.revenue += parseFloat(data.amount) || 0;
    stats.services.add(data.serviceId);
    
    const category = data.category || 'unknown';
    if (!stats.byCategory[category]) {
      stats.byCategory[category] = { transactions: 0, revenue: 0 };
    }
    stats.byCategory[category].transactions++;
    stats.byCategory[category].revenue += parseFloat(data.amount) || 0;
  }
  
  // ============================================================================
  // Query Methods
  // ============================================================================
  
  getGlobalStats() {
    let totalTransactions = 0;
    let totalRevenue = 0;
    
    for (const tx of this.transactions.values()) {
      totalTransactions++;
      if (tx.status === 'success') {
        totalRevenue += parseFloat(tx.amount) || 0;
      }
    }
    
    return {
      totalTransactions,
      totalRevenue: totalRevenue.toFixed(6),
      totalServices: this.services.size
    };
  }
  
  getDashboardMetrics({ hours = 24 }) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    let totalTransactions = 0;
    let totalRevenue = 0;
    let successfulTx = 0;
    let failedTx = 0;
    const serviceStats = new Map();
    const hourlyVolume = [];
    const recentActivity = [];
    
    // Get transactions in time window
    const recentTx = Array.from(this.transactions.values())
      .filter(tx => tx.timestamp >= cutoff)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    for (const tx of recentTx) {
      totalTransactions++;
      
      if (tx.status === 'success') {
        totalRevenue += parseFloat(tx.amount) || 0;
        successfulTx++;
      } else {
        failedTx++;
      }
      
      // Track per-service stats
      if (!serviceStats.has(tx.serviceId)) {
        serviceStats.set(tx.serviceId, {
          id: tx.serviceId,
          name: tx.serviceName || tx.serviceId,
          transactions: 0,
          revenue: 0
        });
      }
      const sStats = serviceStats.get(tx.serviceId);
      sStats.transactions++;
      if (tx.status === 'success') {
        sStats.revenue += parseFloat(tx.amount) || 0;
      }
      
      // Recent activity (last 10)
      if (recentActivity.length < 10) {
        recentActivity.push({
          service: tx.serviceName || tx.serviceId,
          amount: tx.amount,
          status: tx.status,
          time: tx.timestamp
        });
      }
    }
    
    // Calculate hourly volume for chart
    const now = new Date();
    for (let i = hours - 1; i >= 0; i--) {
      const h = new Date(now - i * 60 * 60 * 1000);
      const hourKey = h.toISOString().substring(0, 13);
      const stats = this.hourlyStats.get(hourKey);
      hourlyVolume.push({
        hour: h.toISOString(),
        transactions: stats ? stats.transactions : 0,
        revenue: stats ? stats.revenue.toFixed(6) : '0'
      });
    }
    
    // Sort services by volume
    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.transactions - a.transactions);
    
    return {
      totalTransactions,
      totalRevenue: totalRevenue.toFixed(6),
      totalServices: serviceStats.size,
      avgTransactionValue: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(6) : '0',
      successRate: totalTransactions > 0 ? ((successfulTx / totalTransactions) * 100).toFixed(1) : '0',
      topServices: topServices.slice(0, 10),
      recentActivity,
      hourlyVolume
    };
  }
  
  getServiceMetrics(serviceId, { hours = 24 }) {
    const service = this.services.get(serviceId);
    if (!service) return null;
    
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    let periodTransactions = 0;
    let periodRevenue = 0;
    let successful = 0;
    
    for (const tx of this.transactions.values()) {
      if (tx.serviceId === serviceId && tx.timestamp >= cutoff) {
        periodTransactions++;
        if (tx.status === 'success') {
          periodRevenue += parseFloat(tx.amount) || 0;
          successful++;
        }
      }
    }
    
    return {
      serviceId,
      name: service.name,
      category: service.category,
      transactionCount: periodTransactions,
      revenue: periodRevenue.toFixed(6),
      avgTransactionValue: periodTransactions > 0 ? (periodRevenue / periodTransactions).toFixed(6) : '0',
      successRate: periodTransactions > 0 ? ((successful / periodTransactions) * 100).toFixed(1) : '0',
      uptime: service.health === 'healthy' ? '99.9' : '95.0'
    };
  }
  
  getPremiumAnalytics({ days = 30, serviceId, category }) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    // Filter transactions
    let relevantTx = Array.from(this.transactions.values())
      .filter(tx => tx.timestamp >= cutoff);
    
    if (serviceId) {
      relevantTx = relevantTx.filter(tx => tx.serviceId === serviceId);
    }
    if (category) {
      relevantTx = relevantTx.filter(tx => tx.category === category);
    }
    
    // Calculate summary
    let totalRevenue = 0;
    let totalTransactions = 0;
    const serviceBreakdown = new Map();
    const categoryBreakdown = new Map();
    const hourlyVolume = [];
    
    for (const tx of relevantTx) {
      totalTransactions++;
      if (tx.status === 'success') {
        totalRevenue += parseFloat(tx.amount) || 0;
      }
      
      // Service breakdown
      if (!serviceBreakdown.has(tx.serviceId)) {
        serviceBreakdown.set(tx.serviceId, {
          id: tx.serviceId,
          name: tx.serviceName || tx.serviceId,
          transactions: 0,
          revenue: 0
        });
      }
      const sBreak = serviceBreakdown.get(tx.serviceId);
      sBreak.transactions++;
      if (tx.status === 'success') {
        sBreak.revenue += parseFloat(tx.amount) || 0;
      }
      
      // Category breakdown
      const cat = tx.category || 'unknown';
      if (!categoryBreakdown.has(cat)) {
        categoryBreakdown.set(cat, { transactions: 0, revenue: 0 });
      }
      const cBreak = categoryBreakdown.get(cat);
      cBreak.transactions++;
      if (tx.status === 'success') {
        cBreak.revenue += parseFloat(tx.amount) || 0;
      }
    }
    
    // Calculate hourly volume for trend
    const now = new Date();
    const displayHours = Math.min(days * 24, 168); // Max 7 days of hourly data
    for (let i = displayHours - 1; i >= 0; i--) {
      const h = new Date(now - i * 60 * 60 * 1000);
      const hourKey = h.toISOString().substring(0, 13);
      const stats = this.hourlyStats.get(hourKey);
      hourlyVolume.push({
        hour: h.toISOString(),
        transactions: stats ? stats.transactions : 0,
        revenue: stats ? stats.revenue.toFixed(6) : '0'
      });
    }
    
    // Trending services (growth in last 24h vs previous 24h)
    const trending = this.calculateTrending();
    
    return {
      summary: {
        totalTransactions,
        totalRevenue: totalRevenue.toFixed(6),
        avgTransactionValue: totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(6) : '0',
        uniqueServices: serviceBreakdown.size,
        period: `${days} days`
      },
      trending: trending.slice(0, 10),
      revenueBreakdown: {
        byService: Array.from(serviceBreakdown.values()).sort((a, b) => b.revenue - a.revenue),
        byCategory: Array.from(categoryBreakdown.entries()).map(([name, stats]) => ({
          name,
          ...stats,
          revenue: stats.revenue.toFixed(6)
        }))
      },
      hourlyVolume,
      topPerformers: Array.from(serviceBreakdown.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      growthMetrics: this.calculateGrowthMetrics(days)
    };
  }
  
  generateEnterpriseReport({ startDate, endDate, serviceIds, categories, includeForecast }) {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    let filteredTx = Array.from(this.transactions.values())
      .filter(tx => tx.timestamp >= start && tx.timestamp <= end);
    
    if (serviceIds.length > 0) {
      filteredTx = filteredTx.filter(tx => serviceIds.includes(tx.serviceId));
    }
    if (categories.length > 0) {
      filteredTx = filteredTx.filter(tx => categories.includes(tx.category));
    }
    
    // Daily breakdown
    const dailyMap = new Map();
    const servicePerformance = new Map();
    const categoryAnalysis = new Map();
    
    for (const tx of filteredTx) {
      const day = tx.timestamp.substring(0, 10);
      
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, transactions: 0, revenue: 0, services: new Set() });
      }
      const dayStats = dailyMap.get(day);
      dayStats.transactions++;
      if (tx.status === 'success') {
        dayStats.revenue += parseFloat(tx.amount) || 0;
      }
      dayStats.services.add(tx.serviceId);
      
      // Service performance
      if (!servicePerformance.has(tx.serviceId)) {
        servicePerformance.set(tx.serviceId, {
          id: tx.serviceId,
          name: tx.serviceName || tx.serviceId,
          transactions: 0,
          revenue: 0,
          successful: 0,
          failed: 0
        });
      }
      const sPerf = servicePerformance.get(tx.serviceId);
      sPerf.transactions++;
      if (tx.status === 'success') {
        sPerf.revenue += parseFloat(tx.amount) || 0;
        sPerf.successful++;
      } else {
        sPerf.failed++;
      }
      
      // Category analysis
      const cat = tx.category || 'unknown';
      if (!categoryAnalysis.has(cat)) {
        categoryAnalysis.set(cat, { name: cat, transactions: 0, revenue: 0, services: new Set() });
      }
      const cAnal = categoryAnalysis.get(cat);
      cAnal.transactions++;
      if (tx.status === 'success') {
        cAnal.revenue += parseFloat(tx.amount) || 0;
      }
      cAnal.services.add(tx.serviceId);
    }
    
    const totalRevenue = filteredTx
      .filter(tx => tx.status === 'success')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
    
    return {
      summary: {
        totalTransactions: filteredTx.length,
        totalRevenue: totalRevenue.toFixed(6),
        avgDailyTransactions: (filteredTx.length / Math.max(1, dailyMap.size)).toFixed(1),
        avgDailyRevenue: (totalRevenue / Math.max(1, dailyMap.size)).toFixed(6),
        uniqueServices: servicePerformance.size,
        periodDays: dailyMap.size
      },
      dailyBreakdown: Array.from(dailyMap.values())
        .map(d => ({
          ...d,
          activeServices: d.services.size,
          revenue: d.revenue.toFixed(6)
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      servicePerformance: Array.from(servicePerformance.values())
        .map(s => ({
          ...s,
          revenue: s.revenue.toFixed(6),
          successRate: ((s.successful / s.transactions) * 100).toFixed(1)
        }))
        .sort((a, b) => b.revenue - a.revenue),
      categoryAnalysis: Array.from(categoryAnalysis.values())
        .map(c => ({
          ...c,
          uniqueServices: c.services.size,
          revenue: c.revenue.toFixed(6)
        }))
        .sort((a, b) => b.revenue - a.revenue),
      forecasts: includeForecast ? this.generateForecasts(dailyMap) : null,
      insights: this.generateInsights(filteredTx, servicePerformance, categoryAnalysis)
    };
  }
  
  getCompetitorAnalysis({ category, serviceId, metric }) {
    const categoryServices = Array.from(this.services.values())
      .filter(s => !category || s.category === category);
    
    const sorted = categoryServices.sort((a, b) => b[metric] - a[metric]);
    
    let targetRank = -1;
    let marketPosition = null;
    
    if (serviceId) {
      targetRank = sorted.findIndex(s => s.id === serviceId);
      if (targetRank >= 0) {
        const target = sorted[targetRank];
        const percentile = ((sorted.length - targetRank) / sorted.length) * 100;
        marketPosition = {
          rank: targetRank + 1,
          total: sorted.length,
          percentile: percentile.toFixed(1),
          aheadOf: sorted.length - targetRank - 1
        };
      }
    }
    
    return {
      competitors: sorted.slice(0, 10).map((s, i) => ({
        rank: i + 1,
        id: s.id,
        name: s.name,
        category: s.category,
        totalRevenue: s.totalRevenue.toFixed(6),
        totalTransactions: s.totalTransactions
      })),
      marketPosition,
      priceComparison: this.getPriceComparison(category),
      volumeComparison: this.getVolumeComparison(category, serviceId),
      recommendations: this.generateRecommendations(serviceId, category, sorted)
    };
  }
  
  // ============================================================================
  // Utility Methods
  // ============================================================================
  
  listServices() {
    return Array.from(this.services.values()).map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      totalTransactions: s.totalTransactions,
      totalRevenue: s.totalRevenue.toFixed(6),
      lastActive: s.lastActive,
      health: s.health
    }));
  }
  
  getCategoryBreakdown() {
    const categories = new Map();
    
    for (const service of this.services.values()) {
      if (!categories.has(service.category)) {
        categories.set(service.category, {
          name: service.category,
          serviceCount: 0,
          transactionVolume: 0,
          revenue: 0,
          prices: []
        });
      }
      
      const cat = categories.get(service.category);
      cat.serviceCount++;
      cat.transactionVolume += service.totalTransactions;
      cat.revenue += service.totalRevenue;
    }
    
    return Array.from(categories.values()).map(c => ({
      ...c,
      revenue: c.revenue.toFixed(6),
      avgPrice: c.serviceCount > 0 ? (c.revenue / c.transactionVolume).toFixed(6) : '0'
    }));
  }
  
  getLeaderboard({ metric = 'revenue', limit = 10 }) {
    const sorted = Array.from(this.services.values())
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, limit);
    
    return sorted.map((s, i) => ({
      rank: i + 1,
      id: s.id,
      name: s.name,
      category: s.category,
      [metric]: metric === 'revenue' ? s.totalRevenue.toFixed(6) : s[metric],
      transactions: s.totalTransactions
    }));
  }
  
  updateServiceHealth(serviceId, { status, latency, uptime, lastCheck }) {
    if (!this.services.has(serviceId)) {
      this.services.set(serviceId, {
        id: serviceId,
        name: serviceId,
        totalTransactions: 0,
        totalRevenue: 0,
        health: status
      });
    }
    
    const service = this.services.get(serviceId);
    service.health = status;
    service.lastHealthCheck = lastCheck;
    service.latency = latency;
    service.uptime = uptime;
  }
  
  // ============================================================================
  // Helper Calculations
  // ============================================================================
  
  calculateTrending() {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const prev24h = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    
    const currentStats = new Map();
    const previousStats = new Map();
    
    for (const tx of this.transactions.values()) {
      if (tx.timestamp >= last24h) {
        if (!currentStats.has(tx.serviceId)) {
          currentStats.set(tx.serviceId, { transactions: 0, revenue: 0 });
        }
        const stats = currentStats.get(tx.serviceId);
        stats.transactions++;
        if (tx.status === 'success') {
          stats.revenue += parseFloat(tx.amount) || 0;
        }
      } else if (tx.timestamp >= prev24h && tx.timestamp < last24h) {
        if (!previousStats.has(tx.serviceId)) {
          previousStats.set(tx.serviceId, { transactions: 0, revenue: 0 });
        }
        const stats = previousStats.get(tx.serviceId);
        stats.transactions++;
        if (tx.status === 'success') {
          stats.revenue += parseFloat(tx.amount) || 0;
        }
      }
    }
    
    const trending = [];
    for (const [serviceId, current] of currentStats) {
      const previous = previousStats.get(serviceId) || { transactions: 0, revenue: 0 };
      const growth = previous.transactions > 0 
        ? ((current.transactions - previous.transactions) / previous.transactions) * 100 
        : 100;
      
      const service = this.services.get(serviceId);
      trending.push({
        id: serviceId,
        name: service ? service.name : serviceId,
        category: service ? service.category : 'unknown',
        transactions24h: current.transactions,
        revenue24h: current.revenue.toFixed(6),
        growth: growth.toFixed(1)
      });
    }
    
    return trending.sort((a, b) => parseFloat(b.growth) - parseFloat(a.growth));
  }
  
  calculateGrowthMetrics(days) {
    const now = new Date();
    const currentPeriod = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
    const previousPeriod = new Date(now - 2 * days * 24 * 60 * 60 * 1000).toISOString();
    
    let currentRevenue = 0;
    let previousRevenue = 0;
    
    for (const tx of this.transactions.values()) {
      if (tx.timestamp >= currentPeriod && tx.status === 'success') {
        currentRevenue += parseFloat(tx.amount) || 0;
      } else if (tx.timestamp >= previousPeriod && tx.timestamp < currentPeriod && tx.status === 'success') {
        previousRevenue += parseFloat(tx.amount) || 0;
      }
    }
    
    const growth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    
    return {
      revenueGrowth: growth.toFixed(1),
      currentPeriodRevenue: currentRevenue.toFixed(6),
      previousPeriodRevenue: previousRevenue.toFixed(6),
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
    };
  }
  
  generateForecasts(dailyMap) {
    const days = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    if (days.length < 3) return null;
    
    // Simple moving average forecast
    const recentDays = days.slice(-7);
    const avgRevenue = recentDays.reduce((sum, d) => sum + d.revenue, 0) / recentDays.length;
    const avgTx = recentDays.reduce((sum, d) => sum + d.transactions, 0) / recentDays.length;
    
    const forecasts = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecasts.push({
        date: date.toISOString().substring(0, 10),
        predictedRevenue: avgRevenue.toFixed(6),
        predictedTransactions: Math.round(avgTx),
        confidence: 'medium'
      });
    }
    
    return forecasts;
  }
  
  generateInsights(transactions, servicePerformance, categoryAnalysis) {
    const insights = [];
    
    const totalTx = transactions.length;
    const successfulTx = transactions.filter(tx => tx.status === 'success').length;
    const successRate = totalTx > 0 ? (successfulTx / totalTx) * 100 : 0;
    
    if (successRate < 95) {
      insights.push({
        type: 'warning',
        message: `Success rate (${successRate.toFixed(1)}%) is below optimal threshold`,
        recommendation: 'Review failed transactions for patterns'
      });
    }
    
    const topCategory = Array.from(categoryAnalysis.values()).sort((a, b) => b.revenue - a.revenue)[0];
    if (topCategory) {
      insights.push({
        type: 'info',
        message: `${topCategory.name} is the top performing category`,
        metric: `Revenue: ${topCategory.revenue.toFixed(6)} USDC`
      });
    }
    
    if (servicePerformance.size > 0) {
      const avgRevenue = Array.from(servicePerformance.values())
        .reduce((sum, s) => sum + s.revenue, 0) / servicePerformance.size;
      insights.push({
        type: 'metric',
        message: `Average revenue per service: ${avgRevenue.toFixed(6)} USDC`
      });
    }
    
    return insights;
  }
  
  getPriceComparison(category) {
    // Simplified - would need more detailed pricing data in production
    return {
      category,
      marketAverage: '0.005',
      priceRange: { min: '0.001', max: '0.01' }
    };
  }
  
  getVolumeComparison(category, serviceId) {
    if (!serviceId) return null;
    
    const service = this.services.get(serviceId);
    if (!service) return null;
    
    const categoryServices = Array.from(this.services.values())
      .filter(s => s.category === (category || service.category));
    
    const avgVolume = categoryServices.reduce((sum, s) => sum + s.totalTransactions, 0) / categoryServices.length;
    
    return {
      yourVolume: service.totalTransactions,
      categoryAverage: avgVolume.toFixed(0),
      percentile: ((service.totalTransactions / Math.max(avgVolume, 1)) * 100).toFixed(1)
    };
  }
  
  generateRecommendations(serviceId, category, sortedServices) {
    const recommendations = [];
    
    if (!serviceId) {
      recommendations.push({
        type: 'general',
        message: 'Register your service to see personalized recommendations'
      });
      return recommendations;
    }
    
    const service = this.services.get(serviceId);
    if (!service) return recommendations;
    
    const rank = sortedServices.findIndex(s => s.id === serviceId);
    
    if (rank > 3) {
      recommendations.push({
        type: 'growth',
        message: 'Consider promotional pricing to increase volume',
        impact: 'high'
      });
    }
    
    if (service.totalTransactions < 10) {
      recommendations.push({
        type: 'visibility',
        message: 'Your service has low transaction volume. Consider featured listings.',
        impact: 'medium'
      });
    }
    
    return recommendations;
  }
  
  pruneOldData() {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    
    for (const [id, tx] of this.transactions) {
      if (tx.timestamp < cutoff) {
        this.transactions.delete(id);
      }
    }
  }
  
  // ============================================================================
  // Sample Data
  // ============================================================================
  
  seedSampleData() {
    const services = [
      { id: 'x402-research-v1', name: 'x402 Research Service', category: 'research' },
      { id: 'x402-crypto-v1', name: 'x402 Crypto Prices', category: 'data' },
      { id: 'x402-directory-v1', name: 'x402 Service Directory', category: 'directory' },
      { id: 'ai-summarizer-pro', name: 'AI Summarizer Pro', category: 'compute' },
      { id: 'web-scraper-x', name: 'Web Scraper X', category: 'data' }
    ];
    
    const now = Date.now();
    
    // Generate sample transactions over last 7 days
    for (let i = 0; i < 200; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const hoursAgo = Math.floor(Math.random() * 168); // Last 7 days
      const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
      const amount = (Math.random() * 0.009 + 0.001).toFixed(6); // 0.001 to 0.01
      
      this.recordTransaction({
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        amount,
        currency: 'USDC',
        status: Math.random() > 0.1 ? 'success' : 'failed',
        timestamp,
        metadata: { source: 'sample' }
      });
    }
  }
}
