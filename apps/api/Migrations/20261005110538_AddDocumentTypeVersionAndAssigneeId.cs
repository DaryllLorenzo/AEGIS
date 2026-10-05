using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aegis.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTypeVersionAndAssigneeId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Documents_ParentId1",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ParentId1",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Assignee",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ParentId1",
                table: "Documents");

            migrationBuilder.AddColumn<Guid>(
                name: "AssigneeId",
                table: "Reviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Documents",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Documents",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            // Backfill consecutive version numbers for existing
            // document lineages: roots get v1, each child gets
            // parent.Version + 1. Identifiers must be quoted:
            // EF created "Documents" / "ParentId" with capitals.
            migrationBuilder.Sql("""
                WITH RECURSIVE doc_chain AS (
                    SELECT "Id", "ParentId", 1 AS ver
                    FROM "Documents"
                    WHERE "ParentId" IS NULL
                    UNION ALL
                    SELECT d."Id", d."ParentId", dc.ver + 1
                    FROM "Documents" d
                    JOIN doc_chain dc ON d."ParentId" = dc."Id"
                )
                UPDATE "Documents"
                SET "Version" = doc_chain.ver
                FROM doc_chain
                WHERE "Documents"."Id" = doc_chain."Id";
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_AssigneeId",
                table: "Reviews",
                column: "AssigneeId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Type",
                table: "Documents",
                column: "Type");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_AssigneeId",
                table: "Reviews",
                column: "AssigneeId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_AssigneeId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_AssigneeId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Documents_Type",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "AssigneeId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Documents");

            migrationBuilder.AddColumn<string>(
                name: "Assignee",
                table: "Reviews",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId1",
                table: "Documents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ParentId1",
                table: "Documents",
                column: "ParentId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Documents_ParentId1",
                table: "Documents",
                column: "ParentId1",
                principalTable: "Documents",
                principalColumn: "Id");
        }
    }
}
