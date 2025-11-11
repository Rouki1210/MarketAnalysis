using System.Text.Json.Serialization;

namespace MarketAnalysisBackend.Models.AI
{
    public class AIAnalysisData
    {
        public List<Insight> Insights { get; set; } = new();
    }
}
