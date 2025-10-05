using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAnalysisBackend.Migrations
{
    /// <inheritdoc />
    public partial class applicationDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CirculatingSupply",
                table: "PricePoints",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CirculatingSupply",
                table: "PricePoints");
        }
    }
}
