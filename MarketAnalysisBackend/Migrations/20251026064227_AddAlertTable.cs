using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MarketAnalysisBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GlobalAlertRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RuleType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ThresholdValue = table.Column<decimal>(type: "numeric", nullable: true),
                    PercentChange = table.Column<decimal>(type: "numeric", nullable: true),
                    TimeWindowMinutes = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CooldownMinutes = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AssetId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalAlertRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GlobalAlertRules_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PriceCaches",
                columns: table => new
                {
                    AssetId = table.Column<int>(type: "integer", nullable: false),
                    CurrentPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Price1hAgo = table.Column<decimal>(type: "numeric", nullable: false),
                    Price24hAgo = table.Column<decimal>(type: "numeric", nullable: false),
                    Price7dAgo = table.Column<decimal>(type: "numeric", nullable: false),
                    Volume24h = table.Column<decimal>(type: "numeric", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceCaches", x => x.AssetId);
                    table.ForeignKey(
                        name: "FK_PriceCaches_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GlobalAlertEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RuleId = table.Column<int>(type: "integer", nullable: false),
                    AssetId = table.Column<int>(type: "integer", nullable: false),
                    AssetSymbol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EventType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TriggerValue = table.Column<decimal>(type: "numeric(18,8)", nullable: false),
                    PreviousValue = table.Column<decimal>(type: "numeric(18,8)", nullable: true),
                    PercentChange = table.Column<decimal>(type: "numeric(8,4)", nullable: true),
                    TimeWindow = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TriggeredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotificationsSent = table.Column<int>(type: "integer", nullable: false),
                    NotificationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalAlertEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GlobalAlertEvents_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GlobalAlertEvents_GlobalAlertRules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "GlobalAlertRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAlertView",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    AlertEventId = table.Column<int>(type: "integer", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAlertView", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAlertView_GlobalAlertEvents_AlertEventId",
                        column: x => x.AlertEventId,
                        principalTable: "GlobalAlertEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GlobalAlertEvents_AssetId_TriggeredAt",
                table: "GlobalAlertEvents",
                columns: new[] { "AssetId", "TriggeredAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_GlobalAlertEvents_RuleId_TriggeredAt",
                table: "GlobalAlertEvents",
                columns: new[] { "RuleId", "TriggeredAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_GlobalAlertEvents_TriggeredAt",
                table: "GlobalAlertEvents",
                column: "TriggeredAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_GlobalAlertRules_AssetId",
                table: "GlobalAlertRules",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalAlertRules_IsActive",
                table: "GlobalAlertRules",
                column: "IsActive",
                filter: "\"IsActive\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_GlobalAlertRules_RuleType_IsActive",
                table: "GlobalAlertRules",
                columns: new[] { "RuleType", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_PriceCaches_AssetId",
                table: "PriceCaches",
                column: "AssetId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAlertView_AlertEventId",
                table: "UserAlertView",
                column: "AlertEventId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAlertView_UserId_AlertEventId",
                table: "UserAlertView",
                columns: new[] { "UserId", "AlertEventId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAlertView_UserId_ViewedAt",
                table: "UserAlertView",
                columns: new[] { "UserId", "ViewedAt" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PriceCaches");

            migrationBuilder.DropTable(
                name: "UserAlertView");

            migrationBuilder.DropTable(
                name: "GlobalAlertEvents");

            migrationBuilder.DropTable(
                name: "GlobalAlertRules");
        }
    }
}
