using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarketAnalysisBackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNetworkAsset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Network",
                table: "Assets",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Network",
                table: "Assets");
        }
    }
}
