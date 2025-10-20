using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MarketAnalysisBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddMetaMaskSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FavoriteStocks",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Notication",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "AuthProvider",
                table: "Users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WalletAddress",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Nonces",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WalletAddress = table.Column<string>(type: "character varying(42)", maxLength: 42, nullable: false),
                    NonceValue = table.Column<string>(type: "text", nullable: false),
                    CreateAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsUsed = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nonces", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_WalletAddress",
                table: "Users",
                column: "WalletAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Nonces_ExpireAt",
                table: "Nonces",
                column: "ExpireAt");

            migrationBuilder.CreateIndex(
                name: "IX_Nonces_WalletAddress",
                table: "Nonces",
                column: "WalletAddress");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Nonces");

            migrationBuilder.DropIndex(
                name: "IX_Users_WalletAddress",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AuthProvider",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WalletAddress",
                table: "Users");

            migrationBuilder.AddColumn<string[]>(
                name: "FavoriteStocks",
                table: "Users",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.AddColumn<string[]>(
                name: "Notication",
                table: "Users",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);
        }
    }
}
