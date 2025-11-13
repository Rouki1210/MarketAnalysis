using MarketAnalysisBackend.Services.Interfaces;

namespace MarketAnalysisBackend.Services.Implementations.Worker
{
    public class GlobalAlertDetectorService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<GlobalAlertDetectorService> _logger;
        private const int CHECK_INTERVAL_SECONDS = 30;
        private const int STARTUP_DELAY_SECONDS = 10;

        public GlobalAlertDetectorService(IServiceProvider serviceProvider, ILogger<GlobalAlertDetectorService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 Global Alert Detector Service started at {Time}", DateTime.UtcNow);

            await Task.Delay(TimeSpan.FromSeconds(STARTUP_DELAY_SECONDS), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ExecuteCycleAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error in Global Alert Detector cycle");
                }
                await Task.Delay(TimeSpan.FromSeconds(CHECK_INTERVAL_SECONDS), stoppingToken);
            }

            _logger.LogInformation("🛑 Global Alert Detector Service stopped");
        }

        private async Task ExecuteCycleAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();

            var orchestrationService = scope.ServiceProvider
                .GetRequiredService<IGlobalAlertOrchestrationService>();

            var startTime = DateTime.UtcNow;

            await orchestrationService.ExecuteAlertDetectionCycleAsync(cancellationToken);

            var duration = DateTime.UtcNow - startTime;

            _logger.LogDebug(
                "Alert detection cycle completed in {Duration}ms at {Time}",
                duration.TotalMilliseconds,
                DateTime.UtcNow);
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("🛑 Stopping Global Alert Detector Service...");
            await base.StopAsync(cancellationToken);
        }
    }
}
