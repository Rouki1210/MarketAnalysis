using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAnalysisBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddNewColumnGlobalTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Total_market_cap_percent_change_24h",
                table: "GlobalMetric",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Total_volume_24h",
                table: "GlobalMetric",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Total_volume_24h_percent_change_24h",
                table: "GlobalMetric",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Total_market_cap_percent_change_24h",
                table: "GlobalMetric");

            migrationBuilder.DropColumn(
                name: "Total_volume_24h",
                table: "GlobalMetric");

            migrationBuilder.DropColumn(
                name: "Total_volume_24h_percent_change_24h",
                table: "GlobalMetric");
        }
    }
}
