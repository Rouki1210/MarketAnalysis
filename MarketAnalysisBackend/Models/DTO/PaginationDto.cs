namespace MarketAnalysisBackend.Models.DTO
{
    // PaginationRequest.cs
    public class PaginationRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 15;
        public string? SortBy { get; set; } = "rank"; // rank, price, marketCap, volume, change24h
        public string? SortOrder { get; set; } = "asc"; // asc, desc
        public string? Network { get; set; } = "All Networks";
        public string? Tab { get; set; } = "Top"; // Top, Trending, Gainers, etc.
    }

    // PaginatedResponse.cs
    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }
        public bool HasPrevious { get; set; }
        public bool HasNext { get; set; }
    }
}
