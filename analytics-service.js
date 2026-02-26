/**
 * Bhuban Analytics Service
 * Industry-level analytics calculations and data processing
 */

const AnalyticsService = {
    /**
     * Calculate engagement rate
     * Industry standard: (Likes + Comments + Shares) / Views * 100
     */
    calculateEngagementRate(views, likes, comments = 0, shares = 0) {
        if (views === 0) return 0;
        return ((likes + comments + shares) / views * 100).toFixed(2);
    },

    /**
     * Calculate Click-Through Rate (CTR)
     * CTR = (Clicks / Impressions) * 100
     */
    calculateCTR(clicks, impressions) {
        if (impressions === 0) return 0;
        return ((clicks / impressions) * 100).toFixed(2);
    },

    /**
     * Calculate Average View Duration percentage
     */
    calculateAvgViewDuration(avgDuration, totalDuration) {
        if (totalDuration === 0) return 0;
        return ((avgDuration / totalDuration) * 100).toFixed(2);
    },

    /**
     * Calculate Revenue Per Mille (RPM)
     * RPM = (Revenue / Views) * 1000
     */
    calculateRPM(revenue, views) {
        if (views === 0) return 0;
        return ((revenue / views) * 1000).toFixed(2);
    },

    /**
     * Calculate Cost Per Mille (CPM)
     * Industry average: $2-$10 depending on niche
     */
    calculateCPM(revenue, impressions) {
        if (impressions === 0) return 0;
        return ((revenue / impressions) * 1000).toFixed(2);
    },

    /**
     * Estimate revenue based on views
     * Uses industry-standard CPM rates
     */
    estimateRevenue(views, cpm = 4.5) {
        return ((views / 1000) * cpm).toFixed(2);
    },

    /**
     * Calculate growth rate
     * Growth = ((Current - Previous) / Previous) * 100
     */
    calculateGrowthRate(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    },

    /**
     * Calculate retention rate
     * Retention = (Returning Users / Total Users) * 100
     */
    calculateRetentionRate(returningUsers, totalUsers) {
        if (totalUsers === 0) return 0;
        return ((returningUsers / totalUsers) * 100).toFixed(2);
    },

    /**
     * Calculate churn rate
     * Churn = (Lost Users / Total Users at Start) * 100
     */
    calculateChurnRate(lostUsers, totalUsersAtStart) {
        if (totalUsersAtStart === 0) return 0;
        return ((lostUsers / totalUsersAtStart) * 100).toFixed(2);
    },

    /**
     * Calculate watch time hours
     */
    secondsToHours(seconds) {
        return (seconds / 3600).toFixed(1);
    },

    /**
     * Calculate average session duration
     */
    calculateAvgSessionDuration(totalWatchTime, totalSessions) {
        if (totalSessions === 0) return 0;
        return Math.round(totalWatchTime / totalSessions);
    },

    /**
     * Format large numbers with K, M, B suffixes
     */
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    /**
     * Format duration in seconds to readable format
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Calculate percentile rank
     */
    calculatePercentile(value, dataset) {
        const sorted = dataset.sort((a, b) => a - b);
        const index = sorted.findIndex(v => v >= value);
        if (index === -1) return 100;
        return ((index / sorted.length) * 100).toFixed(1);
    },

    /**
     * Calculate moving average
     */
    calculateMovingAverage(data, period = 7) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - period + 1);
            const subset = data.slice(start, i + 1);
            const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
            result.push(Math.round(avg));
        }
        return result;
    },

    /**
     * Calculate trend direction
     * Returns: 'up', 'down', or 'stable'
     */
    calculateTrend(data) {
        if (data.length < 2) return 'stable';
        
        const recent = data.slice(-5);
        const older = data.slice(-10, -5);
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (change > 5) return 'up';
        if (change < -5) return 'down';
        return 'stable';
    },

    /**
     * Calculate video performance score (0-100)
     * Based on multiple factors
     */
    calculatePerformanceScore(metrics) {
        const {
            views = 0,
            likes = 0,
            comments = 0,
            shares = 0,
            avgViewDuration = 0,
            videoDuration = 1,
            clickThroughRate = 0
        } = metrics;

        // Engagement score (0-40 points)
        const engagementRate = this.calculateEngagementRate(views, likes, comments, shares);
        const engagementScore = Math.min(40, engagementRate * 4);

        // Retention score (0-30 points)
        const retentionPercentage = (avgViewDuration / videoDuration) * 100;
        const retentionScore = Math.min(30, retentionPercentage * 0.3);

        // CTR score (0-20 points)
        const ctrScore = Math.min(20, clickThroughRate * 2);

        // View velocity score (0-10 points)
        const viewVelocityScore = Math.min(10, (views / 1000) * 0.1);

        const totalScore = engagementScore + retentionScore + ctrScore + viewVelocityScore;
        return Math.min(100, Math.round(totalScore));
    },

    /**
     * Predict future views based on historical data
     * Simple linear regression
     */
    predictViews(historicalData, daysAhead = 7) {
        if (historicalData.length < 2) return 0;

        // Calculate slope
        const n = historicalData.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        historicalData.forEach((value, index) => {
            sumX += index;
            sumY += value;
            sumXY += index * value;
            sumX2 += index * index;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict
        const prediction = slope * (n + daysAhead - 1) + intercept;
        return Math.max(0, Math.round(prediction));
    },

    /**
     * Calculate audience demographics distribution
     */
    calculateDemographics(data) {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        return data.map(item => ({
            ...item,
            percentage: ((item.count / total) * 100).toFixed(1)
        }));
    },

    /**
     * Calculate peak viewing hours
     */
    calculatePeakHours(hourlyData) {
        const sorted = [...hourlyData].sort((a, b) => b.views - a.views);
        return sorted.slice(0, 3).map(h => h.hour);
    },

    /**
     * Calculate content quality score
     */
    calculateQualityScore(video) {
        let score = 0;

        // Title optimization (0-20 points)
        if (video.title && video.title.length >= 40 && video.title.length <= 70) {
            score += 20;
        } else if (video.title && video.title.length >= 30) {
            score += 10;
        }

        // Description optimization (0-20 points)
        if (video.description && video.description.length >= 200) {
            score += 20;
        } else if (video.description && video.description.length >= 100) {
            score += 10;
        }

        // Tags (0-15 points)
        if (video.tags && video.tags.length >= 10) {
            score += 15;
        } else if (video.tags && video.tags.length >= 5) {
            score += 10;
        }

        // Thumbnail (0-15 points)
        if (video.thumbnailUrl) {
            score += 15;
        }

        // Category (0-10 points)
        if (video.category && video.category !=== 'Other') {
            score += 10;
        }

        // Resolution (0-20 points)
        const resolutionScores = {
            '4K': 20,
            '1080p': 18,
            '720p': 15,
            '480p': 10,
            '360p': 5,
            '240p': 2
        };
        score += resolutionScores[video.resolution] || 0;

        return Math.min(100, score);
    },

    /**
     * Generate performance insights
     */
    generateInsights(metrics) {
        const insights = [];

        // Engagement insights
        const engagementRate = parseFloat(this.calculateEngagementRate(
            metrics.views,
            metrics.likes,
            metrics.comments,
            metrics.shares
        ));

        if (engagementRate > 10) {
            insights.push({
                type: 'success',
                category: 'engagement',
                message: 'Excellent engagement rate! Your audience is highly interactive.',
                value: engagementRate + '%'
            });
        } else if (engagementRate < 2) {
            insights.push({
                type: 'warning',
                category: 'engagement',
                message: 'Low engagement rate. Consider adding calls-to-action.',
                value: engagementRate + '%'
            });
        }

        // Retention insights
        if (metrics.avgViewDuration && metrics.videoDuration) {
            const retentionRate = (metrics.avgViewDuration / metrics.videoDuration) * 100;
            if (retentionRate > 60) {
                insights.push({
                    type: 'success',
                    category: 'retention',
                    message: 'Great audience retention! Viewers are watching most of your content.',
                    value: retentionRate.toFixed(1) + '%'
                });
            } else if (retentionRate < 30) {
                insights.push({
                    type: 'warning',
                    category: 'retention',
                    message: 'Low retention rate. Consider improving content pacing.',
                    value: retentionRate.toFixed(1) + '%'
                });
            }
        }

        // Growth insights
        if (metrics.growth && metrics.growth.views) {
            const growth = parseFloat(metrics.growth.views);
            if (growth > 20) {
                insights.push({
                    type: 'success',
                    category: 'growth',
                    message: 'Strong growth momentum! Keep up the great work.',
                    value: '+' + growth + '%'
                });
            } else if (growth < -10) {
                insights.push({
                    type: 'warning',
                    category: 'growth',
                    message: 'Declining views. Consider refreshing your content strategy.',
                    value: growth + '%'
                });
            }
        }

        return insights;
    },

    /**
     * Calculate optimal upload time based on historical performance
     */
    calculateOptimalUploadTime(hourlyPerformance) {
        const hourScores = hourlyPerformance.map(hour => ({
            hour: hour.hour,
            score: hour.views * 0.4 + hour.engagement * 0.6
        }));

        hourScores.sort((a, b) => b.score - a.score);
        return hourScores.slice(0, 3).map(h => h.hour);
    }
};

// Make available globally
if (typeof window !=== 'undefined') {
    window.AnalyticsService = AnalyticsService;
}

// Export for Node.js
if (typeof module !=== 'undefined' && module.exports) {
    module.exports = AnalyticsService;
}
