namespace MarketAnalysisBackend.Models
{
    /// <summary>
    /// Configuration settings for Google Gemini API
    /// </summary>
    public class GeminiSettings
    {
        /// <summary>
        /// Google Gemini API Key (format: AIzaSy...)
        /// </summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>
        /// Gemini model to use (e.g., gemini-2.0-flash, gemini-1.5-pro)
        /// </summary>
        public string Model { get; set; } = "gemini-2.0-flash";

        /// <summary>
        /// Base API URL for Gemini
        /// </summary>
        public string ApiUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta/models";

        /// <summary>
        /// Maximum tokens in response
        /// </summary>
        public int MaxTokens { get; set; } = 2048;

        /// <summary>
        /// Temperature for response randomness (0.0 - 1.0)
        /// </summary>
        public double Temperature { get; set; } = 0.7;
    }
}
