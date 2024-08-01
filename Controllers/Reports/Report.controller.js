import prisma from "../../client.js";
import pdf from "html-pdf";

const ReportsController = {
  generateReport: async (req, res) => {
    const { materialId, from, to } = req.body;
    try {
      const movements = await prisma.materialMovements.findMany({
        where: {
          MaterialId: materialId,
          CompletedAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        include: {
          InternalOrder: true,
          Material: {
            select: {
              Color: true,
            },
          },
          FromDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          FromSupplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
          FromWarehouse: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          ToDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          ToWarehouse: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          ToSupplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });

      const reports = movements.map((movement) => {
        let fromLocation = movement.FromSupplier
          ? movement.FromSupplier.Name
          : movement.FromDepartment
          ? movement.FromDepartment.Name
          : movement.FromWarehouse.WarehouseName;

        let toLocation = movement.ToDepartment
          ? movement.ToDepartment.Name
          : movement.ToWarehouse
          ? movement.ToWarehouse.WarehouseName
          : movement.ToSupplier.Name;

        return {
          movementId: movement.Id,
          internalOrdersId: movement.InternalOrderId,
          from: fromLocation,
          to: toLocation,
          quantity: movement.Quantity,
          color: movement.Material.Color,
          date: movement.CompletedAt.toISOString().split("T")[0], // Format date as 'YYYY-MM-DD'
        };
      });

      return res.status(200).send({
        status: 200,
        message: "تم إنشاء التقرير بنجاح!",
        data: reports,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  generateReports: async (req, res) => {
    const { materialIds, from, to } = req.body;
    try {
      const reportsData = await Promise.all(
        materialIds.map(async (materialId) => {
          const movements = await prisma.materialMovements.findMany({
            where: {
              MaterialId: materialId,
              CompletedAt: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
            include: {
              InternalOrder: true,
              Material: {
                select: {
                  Name: true,
                  Color: true,
                },
              },
              FromDepartment: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
              FromSupplier: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
              FromWarehouse: {
                select: {
                  Id: true,
                  WarehouseName: true,
                },
              },
              ToDepartment: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
              ToWarehouse: {
                select: {
                  Id: true,
                  WarehouseName: true,
                },
              },
              ToSupplier: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
            },
          });

          const reports = movements.map((movement) => {
            let fromLocation = movement.FromSupplier
              ? movement.FromSupplier.Name
              : movement.FromDepartment
              ? movement.FromDepartment.Name
              : movement.FromWarehouse.WarehouseName;

            let toLocation = movement.ToDepartment
              ? movement.ToDepartment.Name
              : movement.ToWarehouse
              ? movement.ToWarehouse.WarehouseName
              : movement.ToSupplier.Name;

            return {
              movementId: movement.Id,
              internalOrdersId: movement.InternalOrderId,
              from: fromLocation,
              to: toLocation,
              quantity: movement.Quantity,
              color: movement.Material.Color,
              date: movement.CompletedAt.toISOString().split("T")[0], // Format date as 'YYYY-MM-DD'
            };
          });

          return {
            materialName: movements[0]?.Material.Name || "Unknown",
            reports,
          };
        })
      );

      const filteredReportsData = reportsData.filter(
        (report) => report.materialName !== "Unknown"
      );

      return res.status(200).send({
        status: 200,
        message: "تم إنشاء التقارير بنجاح!",
        data: filteredReportsData,
      });
    } catch (error) {
      console.error("Error generating reports:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  downloadReport: async (req, res) => {
    const { materialId, from, to } = req.body;
    try {
      const movements = await prisma.materialMovements.findMany({
        where: {
          MaterialId: materialId,
          CompletedAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        include: {
          InternalOrder: true,
          Material: {
            select: {
              Color: true,
            },
          },
          FromDepartment: true,
          FromSupplier: true,
          FromWarehouse: true,
          ToDepartment: true,
          ToWarehouse: true,
          ToSupplier: true,
        },
      });

      let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>Report</title>
            <style>
              body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                font-size: 12pt;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
            </style>
            </head>
            <body>
            <table>
              <tr>
              <th>معرف الحركة</th>
              <th>معرف الطلبات الداخلية</th>
              <th>من</th>
              <th>إلى</th>
              <th>الكمية</th>
              <th>اللون</th>
              <th>التاريخ</th>
              </tr>`;

      movements.forEach((movement) => {
        let fromLocation = movement.FromSupplier
          ? movement.FromSupplier.Name
          : movement.FromDepartment
          ? movement.FromDepartment.Name
          : movement.FromWarehouse.WarehouseName;

        let toLocation = movement.ToDepartment
          ? movement.ToDepartment.Name
          : movement.ToWarehouse
          ? movement.ToWarehouse.WarehouseName
          : movement.ToSupplier.Name;

        html += `<tr>
                          <td>${movement.Id}</td>
                          <td>${movement.InternalOrderId}</td>
                          <td>${fromLocation}</td>
                          <td>${toLocation}</td>
                          <td>${movement.Quantity}</td>
                          <td>${movement.Material.Color}</td>
                          <td>${
                            movement.CompletedAt.toISOString().split("T")[0]
                          }</td>
                       </tr>`;
      });

      html += `</table></body></html>`;

      const options = { format: "Letter" };

      pdf.create(html, options).toBuffer(function (err, buffer) {
        if (err) return res.status(500).send("Error generating PDF");
        res.type("application/pdf");
        res.header("Content-Disposition", "attachment; filename=report.pdf");
        res.header("Content-Length", buffer.length);
        res.send(buffer);
      });
    } catch (error) {
      console.error("Error generating report:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  downloadReports: async (req, res, next) => {
    const { materialIds, from, to } = req.body;
    try {
      const reportsData = await Promise.all(
        materialIds.map(async (materialId) => {
          const movements = await prisma.materialMovements.findMany({
            where: {
              MaterialId: materialId,
              CompletedAt: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
            include: {
              InternalOrder: true,
              Material: {
                select: {
                  Name: true,
                  Color: true,
                },
              },
              FromDepartment: true,
              FromSupplier: true,
              FromWarehouse: true,
              ToDepartment: true,
              ToWarehouse: true,
              ToSupplier: true,
            },
          });

          if (movements.length === 0) {
            return null; // Skip materials with no movements
          }

          let html = movements
            .map((movement) => {
              let fromLocation = movement.FromSupplier
                ? movement.FromSupplier.Name
                : movement.FromDepartment
                ? movement.FromDepartment.Name
                : movement.FromWarehouse.WarehouseName;

              let toLocation = movement.ToDepartment
                ? movement.ToDepartment.Name
                : movement.ToWarehouse
                ? movement.ToWarehouse.WarehouseName
                : movement.ToSupplier.Name;

              return `<tr>
                                <td>${movement.Id}</td>
                                <td>${movement.InternalOrderId}</td>
                                <td>${fromLocation}</td>
                                <td>${toLocation}</td>
                                <td>${movement.Quantity}</td>
                                <td>${movement.Material.Color}</td>
                                <td>${
                                  movement.CompletedAt.toISOString().split(
                                    "T"
                                  )[0]
                                }</td>
                            </tr>`;
            })
            .join("");

          return {
            materialName: movements[0].Material.Name,
            htmlRows: html,
          };
        })
      );

      const validReportsData = reportsData.filter((report) => report !== null);

      let fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <title>Reports</title>
            <style>
              body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                margin: 10pt 12pt;
                padding: 0;
                font-size: 12pt;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
            </style>
            </head>
            <body>`;

      validReportsData.forEach((report) => {
        fullHtml += `<h2>Material: ${report.materialName}</h2>
                <table>
                   <tr>
                   <th>معرف الحركة</th>
                   <th>معرف الطلبات الداخلية</th>
                   <th>من</th>
                   <th>إلى</th>
                   <th>الكمية</th>
                   <th>اللون</th>
                   <th>التاريخ</th>
                  </tr>
                  ${report.htmlRows}
                </table><br/>`;
      });

      fullHtml += `</body></html>`;

      const options = { format: "Letter" };

      pdf.create(fullHtml, options).toBuffer(function (err, buffer) {
        if (err) return res.status(500).send("Error generating PDF");
        res.type("application/pdf");
        res.header("Content-Disposition", "attachment; filename=reports.pdf");
        res.header("Content-Length", buffer.length);
        res.send(buffer);
      });
    } catch (error) {
      console.error("Error generating reports:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  fetchAllData: async (req, res, next) => {
    try {
      const [
        departments,
        productCatalogues,
        productCategoryOne,
        productCategoryTwo,
        textiles,
        templateType,
        templatePattern,
        orders,
        models,
      ] = await Promise.all([
        prisma.departments.findMany({
          select: {
            Id: true,
            Name: true,
          },
        }),

        prisma.productCatalogs.findMany({
          select: {
            Id: true,
            ProductCatalogName: true,
          },
        }),
        prisma.productCatalogCategoryOne.findMany({
          select: {
            Id: true,
            CategoryName: true,
          },
        }),
        prisma.productCatalogCategoryTwo.findMany({
          select: {
            Id: true,
            CategoryName: true,
          },
        }),
        prisma.productCatalogTextiles.findMany({
          select: {
            Id: true,
            TextileName: true,
          },
        }),
        prisma.templateTypes.findMany({
          select: {
            Id: true,
            TemplateTypeName: true,
          },
        }),
        prisma.templatePatterns.findMany({
          select: {
            Id: true,
            TemplatePatternName: true,
          },
        }),
        prisma.orders.findMany({
          select: {
            Id: true,
            OrderNumber: true,
          },
        }),
        prisma.models.findMany({
          select: {
            Id: true,
            Barcode: true,
            ModelNumber: true,
          },
        }),
      ]);

      const allData = {
        departments,
        productCatalogues,
        productCategoryOne,
        productCategoryTwo,
        textiles,
        templateType,
        templatePattern,
        orders,
        models,
      };

      res.json(allData);
    } catch (error) {
      console.error("Error generating report:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default ReportsController;
