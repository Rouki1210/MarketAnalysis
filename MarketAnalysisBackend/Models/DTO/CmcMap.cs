namespace MarketAnalysisBackend.Models.DTO
{
    public class CmcMap
    {
        public List<CmcAsset> Data { get; set; } = new();
    }

    public class CmcAsset
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Symbol { get; set; } = "";
        public int Rank { get; set; }
    }

    public class CmcInfoResponse
    {
        public Dictionary<string, CmcInfoData> Data { get; set; } = new();
    }

    public class CmcInfoData
    {
        public string Description { get; set; } = "";
    }

}
