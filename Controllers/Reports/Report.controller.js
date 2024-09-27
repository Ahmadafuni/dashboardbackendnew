import prisma from "../../client.js";
import pdf from "html-pdf";

// Calculate duration in hours
const durationInHours = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const start = new Date(startTime);
  const end = new Date(endTime);

  const differenceInMilliseconds = end - start;
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

  return differenceInHours.toFixed(2); // Return the duration in hours rounded to 2 decimal places
};

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
            DemoModelNumber: true,
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

  productionReport: async (req, res, next) => {
    // Extract filters from the request body
    const {
      status, // RunningStatus filter
      productCatalogue, // Filter for product catalog
      productCategoryOne, // Filter for first category
      productCategoryTwo, // Filter for second category
      templateType, // Filter for template type
      templatePattern, // Filter for template pattern
      startDate,  // Date filter for StartTime
      endDate,    // Date filter for EndTime
      departments // Filter for departments
    } = req.body;

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.models.count({});
    const totalPages = Math.ceil(totalRecords / size);

    let filter = {}; // Filter object to be applied to the query

    // 1. Apply RunningStatus filter if present
    if (status && Array.isArray(status)) {
      filter.RunningStatus = { in: status.map((item) => item.value) };
    }

    // 2. Apply ProductCatalogId filter if present
    if (productCatalogue && Array.isArray(productCatalogue)) {
      filter.ProductCatalogId = { in: productCatalogue.map((item) => parseInt(item.value)) };
    }

    // 3. Apply Department filter if present
    if (departments && Array.isArray(departments)) {
      filter.ModelVarients = {
        some: {
          TrakingModels: {
            some: {
              CurrentStage: {
                DepartmentId: { in: departments.map((item) => parseInt(item.value)) }
              }
            }
          }
        }
      };
    }

    // 4. Apply CategoryOne filter if present
    if (productCategoryOne && Array.isArray(productCategoryOne)) {
      filter.CategoryOneId = { in: productCategoryOne.map((item) => parseInt(item.value)) };
    }

    // 5. Apply CategoryTwo filter if present
    if (productCategoryTwo && Array.isArray(productCategoryTwo)) {
      filter.CategoryTwoId = { in: productCategoryTwo.map((item) => parseInt(item.value)) };
    }

    // 6. Apply Template Type and Pattern filters if present
    if (templateType || templatePattern) {
      filter.Template = { AND: [] };

      if (templateType && Array.isArray(templateType)) {
        filter.Template.AND.push({
          TemplateType: { TemplateTypeName: { in: templateType.map((item) => item.label) } }
        });
      }

      if (templatePattern && Array.isArray(templatePattern)) {
        filter.Template.AND.push({
          TemplatePattern: { TemplatePatternName: { in: templatePattern.map((item) => item.label) } }
        });
      }
    }

    // 7. Apply Date Range filter if present
    if (startDate || endDate) {
      filter.OR = [];

      if (startDate) {
        filter.OR.push({
          StartTime: { gte: new Date(startDate) }
        });
      }

      if (endDate) {
        filter.OR.push({
          EndTime: { lte: new Date(endDate) }
        });
      }
    }

    console.log("Filter: ", JSON.stringify(filter, null, 2)); // Logging the applied filter for debugging

    try {
      // Fetching models based on filters and pagination
      const models = await prisma.models.findMany({
        where: filter,
        orderBy: { StartTime: 'desc' },
        skip: (page - 1) * size,
        take: size,
        select: {
          Order: { select: { CollectionId: true } },
          OrderId: true,
          DemoModelNumber: true,
          ModelName: true,
          Id: true,
          ProductCatalog: { select: { ProductCatalogName: true } },
          CategoryOne: { select: { CategoryName: true } },
          categoryTwo: { select: { CategoryName: true } },
          Textile: { select: { TextileName: true } },
          ModelVarients: {
            select: {
              Color: true,
              Sizes: true,
              RunningStatus: true,
              MainStatus: true,
              TrakingModels: {
                orderBy: { Id: 'desc' },
                take: 1,
                select: {
                  Id: true,
                  CurrentStage: {
                    select: {
                      StageName: true,
                      Department: { select: { Name: true } },
                      DepartmentId: true,
                    }
                  },
                  QuantityDelivered: true,
                  QuantityReceived: true,
                  DamagedItem: true,
                }
              }
            }
          },
          Audit: { select: { CreatedAt: true, UpdatedAt: true } }
        }
      });

      // Map over models to calculate progress and group variants by DemoModelNumber
      const groupedModels = models.reduce((acc, model) => {
        const existingModel = acc.find((entry) => entry.DemoModelNumber === model.DemoModelNumber);

        // Build the details for the variants
        const modelVariantDetails = model.ModelVarients.map((variant) => ({
          Color: variant.Color.ColorName,
          Sizes: variant.Sizes,
          MainStatus: variant.MainStatus,
          RunningStatus: variant.RunningStatus,
          StageName: variant.TrakingModels[0]?.CurrentStage.StageName || null,
          StartTime: variant.TrakingModels[0]?.StartTime || null,
          EndTime: variant.TrakingModels[0]?.EndTime || null,
          DurationInHours: durationInHours( variant.TrakingModels[0]?.StartTime,variant.TrakingModels[0]?.EndTime),
          DepartmentName: variant.TrakingModels[0]?.CurrentStage.Department.Name || null,
          QuantityDelivered: variant.TrakingModels[0]?.QuantityDelivered || null,
          QuantityReceived: variant.TrakingModels[0]?.QuantityReceived || null,
        }));

        // If the model already exists in the accumulator, append the details to it
        if (existingModel) {
          existingModel.Details.push(...modelVariantDetails);
        } else {
          // If the model doesn't exist, add it to the accumulator with the details
          acc.push({
            DemoModelNumber: model.DemoModelNumber,
            ModelId: model.Id,
            ModelName: model.ModelName,
            ProductCatalog: model.ProductCatalog.ProductCatalogName,
            CategoryOne: model.CategoryOne.CategoryName,
            CategoryTwo: model.categoryTwo.CategoryName,
            Textiles: model.Textile.TextileName,
            Details: modelVariantDetails,
            Audit: {
              CreatedAt: model.Audit.CreatedAt,
              UpdatedAt: model.Audit.UpdatedAt,
            },
          });
        }

        return acc;
      }, []);

      // Sending the response with the grouped models
      return res.status(200).send({
        status: 200,
        message: "Models fetched successfully!",
        totalPages,
        data: groupedModels,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: 'Internal server error. Please try again later! ' + error,
        data: {},
      });
    }
  },

};

export default ReportsController;
