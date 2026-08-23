using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MediBook.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DoctorProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Specialty = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Bio = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    YearsOfExperience = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DoctorAvailabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time(6)", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorAvailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorAvailabilities_DoctorProfiles_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "DoctorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FirstName", "IsActive", "LastName", "PasswordHash", "PhoneNumber", "Role" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 23, 18, 52, 23, 567, DateTimeKind.Utc).AddTicks(8542), "admin@medibook.com", "Admin", true, "User", "$2a$11$u.qPMhhQIaPyXHlzLKp/RO6M1AS1i2sxA8Oh9FH5SpdDD7N9HCU4W", "", "Admin" },
                    { 2, new DateTime(2026, 8, 23, 18, 52, 23, 568, DateTimeKind.Utc).AddTicks(1522), "doctor@medibook.com", "Ali", true, "Veli", "$2a$11$8TsgEZsdUleMGfoZUHwh3u54lSwKl.eHdapmkgb5Flu.U2svkIm72", "", "Doctor" }
                });

            migrationBuilder.InsertData(
                table: "DoctorProfiles",
                columns: new[] { "Id", "Bio", "Specialty", "UserId", "YearsOfExperience" },
                values: new object[] { 1, "Çocuk hastalıkları uzmanı.", "Pediatri", 2, 5 });

            migrationBuilder.InsertData(
                table: "DoctorAvailabilities",
                columns: new[] { "Id", "DayOfWeek", "DoctorId", "EndTime", "StartTime" },
                values: new object[,]
                {
                    { 1, 1, 1, new TimeSpan(0, 17, 0, 0, 0), new TimeSpan(0, 9, 0, 0, 0) },
                    { 2, 2, 1, new TimeSpan(0, 17, 0, 0, 0), new TimeSpan(0, 9, 0, 0, 0) },
                    { 3, 3, 1, new TimeSpan(0, 17, 0, 0, 0), new TimeSpan(0, 9, 0, 0, 0) },
                    { 4, 4, 1, new TimeSpan(0, 17, 0, 0, 0), new TimeSpan(0, 9, 0, 0, 0) },
                    { 5, 5, 1, new TimeSpan(0, 17, 0, 0, 0), new TimeSpan(0, 9, 0, 0, 0) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAvailabilities_DoctorId",
                table: "DoctorAvailabilities",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorProfiles_UserId",
                table: "DoctorProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DoctorAvailabilities");

            migrationBuilder.DropTable(
                name: "DoctorProfiles");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
