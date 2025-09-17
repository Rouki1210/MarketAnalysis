using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAnalysisBackend.Migrations
{
    /// <inheritdoc />
    public partial class DbAppication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MarketCap",
                table: "PricePoints",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentChange1h",
                table: "PricePoints",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentChange24h",
                table: "PricePoints",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentChange7d",
                table: "PricePoints",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MarketCap",
                table: "PricePoints");

            migrationBuilder.DropColumn(
                name: "PercentChange1h",
                table: "PricePoints");

            migrationBuilder.DropColumn(
                name: "PercentChange24h",
                table: "PricePoints");

            migrationBuilder.DropColumn(
                name: "PercentChange7d",
                table: "PricePoints");
        }
    }
}
