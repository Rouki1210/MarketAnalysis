using System;
using System.Collections.Generic;

namespace MarketAnalysisBackend.Models.AI
{
    /// <summary>
    /// Comprehensive market overview analysis response
    /// </summary>
    public class MarketOverviewResponse
    {
        public DateTime AnalyzedAt { get; set; }
        public string OverallTrend { get; set; } = "neutral"; // "bullish", "bearish", "neutral"
        public List<Insight> Insights { get; set; } = new();
        public List<TopMover> TopGainers { get; set; } = new();
        public List<TopMover> TopLosers { get; set; } = new();
        public MarketStatistics Statistics { get; set; } = new();
        public string Source { get; set; } = string.Empty;
    }

    /// <summary>
    /// Top mover coin (gainer or loser)
    /// </summary>
    public class TopMover
    {
        public string Symbol { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal PercentChange24h { get; set; }
        public decimal MarketCap { get; set; }
    }

    /// <summary>
    /// Comprehensive market statistics
    /// </summary>
    public class MarketStatistics
    {
        // Overall market metrics
        public decimal TotalMarketCap { get; set; }
        public decimal TotalVolume24h { get; set; }
        public int TotalCoins { get; set; }
        
        // Market dominance
        public decimal BtcDominance { get; set; }
        public decimal EthDominance { get; set; }
        
        // Market breadth (how many coins up vs down)
        public int CoinsUp { get; set; }
        public int CoinsDown { get; set; }
        public decimal MarketBreadth { get; set; } // CoinsUp / TotalCoins ratio
        
        // Average changes
        public decimal AverageChange24h { get; set; }
        public decimal MedianChange24h { get; set; }
        
        // Volume analysis
        public decimal VolumeToMarketCapRatio { get; set; }
        
        // Volatility indicator
        public decimal VolatilityIndex { get; set; } // Standard deviation of 24h changes
    }
}
