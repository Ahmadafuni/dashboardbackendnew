import { MainStatus } from "@prisma/client";
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
        collections,
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


        prisma.collections.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            CollectionName: true,
          },
        }),

          prisma.departments.findMany({
            where: {
              Audit: {
                IsDeleted: false,
              },
            },
          select: {
            Id: true,
            Name: true,
          },
        }),

        prisma.productCatalogs.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            ProductCatalogName: true,
          },
        }),
        prisma.productCatalogCategoryOne.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            CategoryName: true,
          },
        }),
        prisma.productCatalogCategoryTwo.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            CategoryName: true,
          },
        }),
        prisma.productCatalogTextiles.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TextileName: true,
          },
        }),
        prisma.templateTypes.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TemplateTypeName: true,
          },
        }),
        prisma.templatePatterns.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TemplatePatternName: true,
          },
        }),
        prisma.orders.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            OrderNumber: true,
            OrderName: true,
          },
        }),
        prisma.models.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            Barcode: true,
            DemoModelNumber: true,
          },
        }),
      ]);

      const allData = {
        collections,
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

  departmentProductionReport: async(req, res, next) => {
    try {
      const {
        departments,
        status,
        startDate,
        endDate,
        productCatalogue,
        productCategoryOne,
        productCategoryTwo,
        templateType,
        templatePattern,
      } = req.body;

      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;
      
       let filter = {
        Audit: {
          IsDeleted: false
        }
      };  

       let modelVarientsFilter = {
        some: {
          TrakingModels: {
            some: {
              AND: [] // Initialize AND array for combining conditions
            }
          }
        }
      };

       if (departments && Array.isArray(departments)) {
        modelVarientsFilter.some.TrakingModels.some.AND.push({
          CurrentStage: {
            DepartmentId: { in: departments.map(dept => parseInt(dept.value)) }
          }
        });
      }

       if (status && Array.isArray(status)) {
        modelVarientsFilter.some.TrakingModels.some.AND.push({
          RunningStatus: { in: status.map(s => s.value) }
        });
      }

       if (startDate) {
        modelVarientsFilter.some.TrakingModels.some.AND.push({
          EndTime: { gte: new Date(startDate) }
        });
      }
      
      if (endDate) {
        modelVarientsFilter.some.TrakingModels.some.AND.push({
          EndTime: { lte: new Date(endDate) }
        });
      }

       filter.ModelVarients = modelVarientsFilter;

        if (productCatalogue && Array.isArray(productCatalogue)) {
        filter.ProductCatalogId = { in: productCatalogue.map((item) => parseInt(item.value)) };
      }
  
       if (productCategoryOne && Array.isArray(productCategoryOne)) {
        filter.CategoryOneId = { in: productCategoryOne.map((item) => parseInt(item.value)) };
      }
  
      if (productCategoryTwo && Array.isArray(productCategoryTwo)) {
        filter.CategoryTwoId = { in: productCategoryTwo.map((item) => parseInt(item.value)) };
      }
  
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

       const models = await prisma.models.findMany({
        where: filter,
        select: {
          Id: true,
          ModelName: true,
          DemoModelNumber: true,
          ModelVarients: {
            select: {
              Id: true,
              Color: {
                select: {
                  ColorName: true
                }
              },
              Sizes: true,
              MainStatus: true,
              RunningStatus: true,
              TrakingModels: {
                where: {
                  AND: [
                    departments ? {
                      CurrentStage: {
                        DepartmentId: { in: departments.map(dept => parseInt(dept.value)) }
                      }
                    } : {},
                    status ? {
                      RunningStatus: { in: status.map(s => s.value) }
                    } : {}
                  ]
                },
                select: {
                  Id: true,
                  CurrentStage: {
                    select: {
                      Id: true,
                      StageName: true,
                      Department: {
                        select: {
                          Id: true,
                          Name: true
                        }
                      }
                    }
                  },
                  MainStatus: true,
                  RunningStatus: true,
                  StartTime: true,
                  EndTime: true,
                  QuantityReceived: true,
                  QuantityDelivered: true,
                  DamagedItem: true
                }
              }
            }
          }
        }
      });


      const getArabicStatus = (status) => {
        const statusMap = {
          'PENDING': 'قيد الانتظار',
          'ONGOING': 'جاري العمل',
          'ONHOLD': 'متوقف مؤقتاً',
          'COMPLETED': 'مكتمل',
          'DONE': 'منتهي',
          'IN_PROGRESS': 'قيد التنفيذ',
          'STOPPED': 'متوقف'
        };
      
        return statusMap[status] || status;
      };

      const calculateDuration = (startTime, endTime, stopDates) => {
        if (!startTime) return 'لم يبدأ بعد';
        
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        
        let totalDuration = end - start;
        
         let totalStopDuration = 0;
        if (stopDates && Array.isArray(stopDates)) {
          totalStopDuration = stopDates.reduce((acc, stop) => {
            const stopStart = new Date(stop.StartStopTime);
            const stopEnd = new Date(stop.EndStopTime);
            return acc + (stopEnd - stopStart);
          }, 0);
        }
        
        const actualDuration = totalDuration - totalStopDuration;
        
         const days = Math.floor(actualDuration / (1000 * 60 * 60 * 24));
        const hours = Math.floor((actualDuration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((actualDuration % (1000 * 60 * 60)) / (1000 * 60));
        
         const parts = [];
        
        if (days > 0) {
          parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        }
        
        if (hours > 0) {
          parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        }
        
        if (minutes > 0 || (!days && !hours)) {
          parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
        }
      
        let durationText = parts.join(' , ');
        
         if (!endTime) {
          durationText = `${durationText} (جارٍ التنفيذ)`;
        }
        
        return durationText || 'أقل من دقيقة';
      };


      const formatQuantities = (items) => {
        if (!Array.isArray(items)) return '';
        
        const formattedItems = items
          .filter(item => item.label && (item.value || item.value === 0))
          .map(item => `${item.label}: ${item.value}`)
          .join(' | ');
          
        return formattedItems || '-';
      };

      const formatSizes = (sizes) => {
        if (!Array.isArray(sizes)) return '';
        
        return sizes
          .map(size => `${size.label}: ${size.value}`)
          .join(' | ');
      };

       let tableRows = [];
      
      models.forEach(model => {
        model.ModelVarients.forEach(variant => {
          variant.TrakingModels.forEach(tracking => {
            tableRows.push({
              departmentName: tracking.CurrentStage.Department.Name,
              modelNumber: model.DemoModelNumber,
              modelName: model.ModelName,
              color: variant.Color.ColorName,
              status: getArabicStatus(tracking.RunningStatus), 
              sizes: formatSizes(variant.Sizes),
              quantityReceived: formatQuantities(variant.QuantityReceived),
              quantityDelivered: formatQuantities(tracking.QuantityDelivered),
              damagedItems: formatQuantities(tracking.DamagedItem),
              startTime: tracking.StartTime,
              endTime: tracking.EndTime,
              duration: calculateDuration(
                tracking.StartTime,
                tracking.EndTime,
                tracking.StopDate
              ),
            });
          });
        });
      });

       const summary = {
        totalDepartments: new Set(tableRows.map(row => row.departmentName)).size,
        totalModels: models.length,
        totalVariants: tableRows.length,
        totalCompleted: tableRows.filter(row => row.status === getArabicStatus('COMPLETED')).length,
        totalInProgress: tableRows.filter(row => row.status === getArabicStatus('ONGOING')).length
      };

      const totalRecords = tableRows.length;
      const totalPages = Math.ceil(totalRecords / size);
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedRows = tableRows.slice(startIndex, endIndex);

      return res.status(200).send({
        status: 200,
        message: "Department reports generated successfully!",
        totalPages,
        data: {
          reports: paginatedRows,
          summary
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: 'Internal server error. Please try again later!',
        data: {}
      });
    }
  },
 
  productionReport: async (req, res, next) => {
    try {
      let {
        status,
        productCatalogue,
        productCategoryOne,
        productCategoryTwo,
        templateType,
        templatePattern,
        startDate,
        endDate,
        departments,
      } = req.body;
  
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;



      let filter = {};
      
       const isDoneIncluded = Array.isArray(status) ? status.some((item) => item.value === 'DONE') : false;
      status = Array.isArray(status) ? status.filter(item => item.value !== 'DONE') : status;
  
       filter.Audit = {
        IsDeleted: false
      };
      
       if (status && Array.isArray(status) && status.length !== 0) {
        if (departments && Array.isArray(departments)) {
           filter.ModelVarients = {
            some: {
              TrakingModels: {
                some: {
                  AND: [
                    {
                      CurrentStage: {
                        DepartmentId: { in: departments.map((item) => parseInt(item.value)) }
                      }
                    },
                    {
                      RunningStatus: { in: status.map((item) => item.value) }
                    }
                  ]
                }
              }
            }
          };
        } else {
           filter.RunningStatus = { in: status.map((item) => item.value) };
        }
      } else if (departments && Array.isArray(departments)) {
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
  
       if (productCatalogue && Array.isArray(productCatalogue)) {
        filter.ProductCatalogId = { in: productCatalogue.map((item) => parseInt(item.value)) };
      }
  
       if (productCategoryOne && Array.isArray(productCategoryOne)) {
        filter.CategoryOneId = { in: productCategoryOne.map((item) => parseInt(item.value)) };
      }
  
      if (productCategoryTwo && Array.isArray(productCategoryTwo)) {
        filter.CategoryTwoId = { in: productCategoryTwo.map((item) => parseInt(item.value)) };
      }
  
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
  
       if (startDate || endDate) {
        filter.OR = [];
        if (startDate) filter.OR.push({ StartTime: { gte: new Date(startDate) } });
        if (endDate) filter.OR.push({ EndTime: { lte: new Date(endDate) } });
      }
      
       let models = await prisma.models.findMany({
        where: filter,
        orderBy: { StartTime: 'desc' },
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
                  StartTime: true,
                  EndTime: true,
                }
              }
            }
          },
          Audit: { select: { CreatedAt: true, UpdatedAt: true } }
        }
      });
  
       if (isDoneIncluded) {
        if (departments && Array.isArray(departments)) {
           models = models.filter((model) => {
            return model.ModelVarients.some((variant) => {
              return variant.TrakingModels.some(tracking => 
                departments.some(dept => parseInt(dept.value) === tracking.CurrentStage.DepartmentId) &&
                tracking.RunningStatus === "COMPLETED"
              );
            });
          });
        } else {
           models = models.filter((model) => {
            return model.ModelVarients.some((variant) => {
              return variant.RunningStatus === "COMPLETED" && variant.MainStatus === "DONE";
            });
          });
        }
      }
  
       const groupedModels = models.reduce((acc, model) => {
        const existingModel = acc.find((entry) => entry.DemoModelNumber === model.DemoModelNumber);
  
        const modelVariantDetails = model.ModelVarients
          .filter(variant => {
            if (isDoneIncluded) {
              if (departments && Array.isArray(departments)) {
                 return variant.TrakingModels.some(tracking => 
                  departments.some(dept => parseInt(dept.value) === tracking.CurrentStage.DepartmentId) &&
                  tracking.RunningStatus === "COMPLETED"
                );
              }
              return variant.MainStatus === "DONE" && variant.RunningStatus === "COMPLETED";
            }
            return true;
          })
          .map((variant) => ({
            Color: variant.Color,
            Sizes: variant.Sizes,
            MainStatus: variant.MainStatus,
            RunningStatus: variant.RunningStatus,
            StageName: variant.TrakingModels[0]?.CurrentStage.StageName || null,
            DepartmentName: variant.TrakingModels[0]?.CurrentStage.Department.Name || null,
            QuantityDelivered: variant.TrakingModels[0]?.QuantityDelivered || null,
            QuantityReceived: variant.TrakingModels[0]?.QuantityReceived || null,
            DamagedItem: variant.TrakingModels[0]?.DamagedItem || null,
            StartTime: variant.TrakingModels[0]?.StartTime || null,
            EndTime: variant.TrakingModels[0]?.EndTime || null,
            DurationInHours: durationInHours(variant.TrakingModels[0]?.StartTime, variant.TrakingModels[0]?.EndTime),
          }));
  
        if (existingModel) {
          existingModel.Details.push(...modelVariantDetails);
        } else {
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
  
       const summary = {
        totalModels: models.length,
        totalVariants: models.reduce((acc, model) => acc + model.ModelVarients.length, 0),
        totalQuantityDelivered: models.reduce((acc, model) => {
          return acc + model.ModelVarients.reduce((subAcc, variant) => {
            return subAcc + (variant.TrakingModels[0]?.QuantityDelivered
              ? variant.TrakingModels[0].QuantityDelivered.reduce((sum, item) => {
                  const value = parseInt(item.value);
                  return sum + (isNaN(value) ? 0 : value);
                }, 0)
              : 0);
          }, 0);
        }, 0),
        totalQuantityReceived: models.reduce((acc, model) => {
          return acc + model.ModelVarients.reduce((subAcc, variant) => {
            return subAcc + (variant.TrakingModels[0]?.QuantityReceived
              ? variant.TrakingModels[0].QuantityReceived.reduce((sum, item) => {
                  const value = parseInt(item.value);
                  return sum + (isNaN(value) ? 0 : value);
                }, 0)
              : 0);
          }, 0);
        }, 0),
        totalDamagedItems: models.reduce((acc, model) => {
          return acc + model.ModelVarients.reduce((subAcc, variant) => {
            return subAcc + (variant.TrakingModels[0]?.DamagedItem
              ? variant.TrakingModels[0].DamagedItem.reduce((sum, item) => {
                  const value = parseInt(item.value);
                  return sum + (isNaN(value) ? 0 : value);
                }, 0)
              : 0);
          }, 0);
        }, 0)
      };
  
       const reports = groupedModels.flatMap((item) => {
        return item.Details.map((detail, index) => ({
          modelNumber: index === 0 ? item.DemoModelNumber : "",
          name: index === 0 ? item.ModelName : "",
          barcode: index === 0 ? item.Barcode : "",
          textile: index === 0 ? item.Textiles : "",
          colors: detail.Color ? detail.Color.ColorName : "",
          sizes: detail.Sizes.map((size) => `${size.label} : ${size.value}`).join(", "),
          currentStage: detail.DepartmentName || "N/A",
          QuantityDelivered: detail.QuantityDelivered
            ? detail.QuantityDelivered.map((size) => `${size.label} : ${size.value}`).join(", ")
            : "N/A",
          QuantityReceived: detail.QuantityReceived
            ? detail.QuantityReceived.map((size) => `${size.label} : ${size.value}`).join(", ")
            : "N/A",
          DamagedItem: detail.DamagedItem
            ? detail.DamagedItem.map((size) => `${size.label} : ${size.value}`).join(", ")
            : "N/A",
          duration: detail.DurationInHours || "N/A",
        }));
      });
  
       const totalRecords = reports.length;
      const totalPages = Math.ceil(totalRecords / size);
      const startIndex = (page - 1) * size;
      const endIndex = page * size;
      const paginatedReport = reports.slice(startIndex, endIndex);
  
      return res.status(200).send({
        status: 200,
        message: "Models fetched successfully!",
        totalPages,
        data: {
          data: paginatedReport,
          summary: summary
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: 'Internal server error. Please try again later!',
        data: {},
      });
    }
  },

  orderReport : async (req, res, next) => {
    let {
      orders,
      status,
      productCatalogue,
      productCategoryOne,
      productCategoryTwo,
      templatePattern,
      startDate,
      endDate,
      departments,
    } = req.body;

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    let filter = {};

    // 2. Apply Orders filter if present
    if (orders && Array.isArray(orders)) {
      filter.OrderId = { in: orders.map((item) => parseInt(item.value)) };
    }


    const isDoneIncluded = Array.isArray(status) ?  status.some((item) => item.label === 'DONE') : false ;


    status = Array.isArray(status) ? status.filter(item => item.label !== 'DONE') : status;

    // 3. Apply Running Status filter if present
    if (status && Array.isArray(status)) {
      filter.ModelVarients = {
        some: {
          TrakingModels: {
            some: {
              RunningStatus: { in: status.map((item) => item.value) },
            },
          },
        },
      };
    }

    // 4. Apply Product Catalog filter if present
    if (productCatalogue && Array.isArray(productCatalogue)) {
      filter.ProductCatalogId = {
        in: productCatalogue.map((item) => parseInt(item.value)),
      };
    }

    // 5. Apply Department filter if present
    if (departments && Array.isArray(departments)) {
      filter.ModelVarients = {
        some: {
          TrakingModels: {
            some: {
              CurrentStage: {
                DepartmentId: { in: departments.map((item) => parseInt(item.value)) },
              },
            },
          },
        },
      };
    }

    // 6. Apply Product Category One filter if present
    if (productCategoryOne && Array.isArray(productCategoryOne)) {
      filter.CategoryOneId = { in: productCategoryOne.map((item) => parseInt(item.value)) };
    }

    // 7. Apply Product Category Two filter if present
    if (productCategoryTwo && Array.isArray(productCategoryTwo)) {
      filter.CategoryTwoId = { in: productCategoryTwo.map((item) => parseInt(item.value)) };
    }

    // 8. Apply Template Pattern filter if present
    if (templatePattern && Array.isArray(templatePattern)) {
      filter.Template = {
        TemplatePattern: {
          TemplatePatternName: { in: templatePattern.map((item) => item.label) },
        },
      };
    }

    // 9. Apply Date Range filter if present
    if (startDate || endDate) {
      filter.ModelVarients = {
        some: {
          TrakingModels: {
            some: {
              AND: [
                startDate ? { StartTime: { gte: new Date(startDate) } } : {},
                endDate ? { EndTime: { lte: new Date(endDate) } } : {},
              ],
            },
          },
        },
      };
    }

    try {
      let models = await prisma.models.findMany({
        where: filter,
        orderBy: { StartTime: "desc" },
        // skip: (page - 1) * size,
        // take: size,
        select: {
          //Order: { select: { CollectionId: true, Collection: { select: { Name: true } } } },
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
                orderBy: { Id: "desc" },
                take: 1,
                select: {
                  Id: true,
                  CurrentStage: {
                    select: {
                      StageName: true,
                      Department: { select: { Name: true } },
                      DepartmentId: true,
                    },
                  },
                  QuantityDelivered: true,
                  QuantityReceived: true,
                  DamagedItem: true,
                },
              },
            },
          },
          Audit: { select: { CreatedAt: true, UpdatedAt: true } },
        },
      });


      if(isDoneIncluded){
        models = models.filter((model) => {
          // تحقق من وجود ModelVarients والتأكد من أن الشرط ينطبق على جميع الـ ModelVarients
          return model.ModelVarients.some((variant) => {
            return variant.RunningStatus == "COMPLETED" && variant.MainStatus == "DONE";
          });
        });
        
      }

        // Keep the existing model grouping and processing logic intact
        const groupedModels = models.reduce((acc, model) => {

        const existingModel = acc.find((entry) => entry.DemoModelNumber === model.DemoModelNumber);


        let modelVariantDetails ;
        if(isDoneIncluded){
           modelVariantDetails = model.ModelVarients
          .filter((variant) => 
            variant.MainStatus === "DONE" && variant.RunningStatus === "COMPLETED"
          )
          .map((variant) => ({
            Color: variant.Color,
            Sizes: variant.Sizes,
            MainStatus: variant.MainStatus,
            RunningStatus: variant.RunningStatus,
            StageName: variant.TrakingModels[0]?.CurrentStage.StageName || null,
            DepartmentName: variant.TrakingModels[0]?.CurrentStage.Department.Name || null,
            QuantityDelivered: variant.TrakingModels[0]?.QuantityDelivered || null,
            QuantityReceived: variant.TrakingModels[0]?.QuantityReceived || null,
            DamagedItem: variant.TrakingModels[0]?.DamagedItem || null,
            StartTime: variant.TrakingModels[0]?.StartTime || null,
            EndTime: variant.TrakingModels[0]?.EndTime || null,
            DurationInHours: durationInHours(variant.TrakingModels[0]?.StartTime, variant.TrakingModels[0]?.EndTime),
          }));
        }else {
           modelVariantDetails = model.ModelVarients
          .map((variant) => ({
            Color: variant.Color,
            Sizes: variant.Sizes,
            MainStatus: variant.MainStatus,
            RunningStatus: variant.RunningStatus,
            StageName: variant.TrakingModels[0]?.CurrentStage.StageName || null,
            DepartmentName: variant.TrakingModels[0]?.CurrentStage.Department.Name || null,
            QuantityDelivered: variant.TrakingModels[0]?.QuantityDelivered || null,
            QuantityReceived: variant.TrakingModels[0]?.QuantityReceived || null,
            DamagedItem: variant.TrakingModels[0]?.DamagedItem || null,
            StartTime: variant.TrakingModels[0]?.StartTime || null,
            EndTime: variant.TrakingModels[0]?.EndTime || null,
            DurationInHours: durationInHours(variant.TrakingModels[0]?.StartTime, variant.TrakingModels[0]?.EndTime),
          }));
        }
      

        if (existingModel) {
          existingModel.Details.push(...modelVariantDetails);
        } else {
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

       // Calculate summary
       const totalModels = groupedModels.length;
       const modelsInProgress = groupedModels.filter((model) =>
         model.Details.some((variant) => variant.RunningStatus === 'ONGOING')).length;
       const completedModels = groupedModels.filter((model) =>
         model.Details.some((variant) => variant.RunningStatus === 'COMPLETED')).length;

       const totalRequiredQuantity = groupedModels.reduce((acc, model) => {
         return acc + model.Details.reduce((variantAcc, variant) => {
           return variantAcc + (variant.QuantityReceived
               ? variant.QuantityReceived.reduce((sum, item) => {
                 const value = parseInt(item.value);
                 return sum + (isNaN(value) ? 0 : value);
               }, 0)
               : 0);
         }, 0);
       }, 0);
 
       const totalDeliveredQuantity = groupedModels.reduce((acc, model) => {
         return acc + model.Details.reduce((variantAcc, variant) => {
           return variantAcc + (variant.QuantityDelivered
               ? variant.QuantityDelivered.reduce((sum, item) => {
                 const value = parseInt(item.value);
                 return sum + (isNaN(value) ? 0 : value);
               }, 0)
               : 0);
         }, 0);
       }, 0);
 
       const completionPercentage = totalRequiredQuantity > 0
         ? ((totalDeliveredQuantity / totalRequiredQuantity) * 100).toFixed(2)
         : 0;
 
       const summary = {
         totalModels,
         modelsInProgress,
         completedModels,
         totalRequiredQuantity,
         totalDeliveredQuantity,
         completionPercentage: `${completionPercentage}%`,
       };

       const reports = Array.isArray(groupedModels)
        ? groupedModels.flatMap((item) => {
          const demoModelNumber = item.DemoModelNumber;
          const modelName = item.ModelName;

          // Map over each variant, ensuring the first variant has model info
          return item.Details.map((detail , index) => ({
            modelNumber: index === 0 ? demoModelNumber : "", // First row gets the model number
            name: index === 0 ? modelName : "", // First row gets the model name
            barcode: index === 0 ? item.Barcode : "", // Example: barcode data if present
            textile: index === 0 ? item.Textiles : "", // Only the first row has textile
            colors:  detail.Color ? detail.Color.ColorName :"",
            sizes: detail.Sizes.map(
                (size) =>
                    `${size.label} : ${size.value}`
            ).join(", "),
            currentStage: detail.DepartmentName || "N/A",
            QuantityDelivered: detail.QuantityDelivered
                ? detail.QuantityDelivered
                    .map(
                      (size) =>
                          `${size.label} : ${size.value}`
                  ).join(", ")
                : "N/A",
            QuantityReceived: detail.QuantityReceived
                ? detail.QuantityReceived
                    .map(
                      (size) =>
                          `${size.label} : ${size.value}`
                  ).join(", ")
                : "N/A",
            DamagedItem: detail.DamagedItem
                ? detail.DamagedItem
                    .map(
                      (size) =>
                          `${size.label} : ${size.value}`
                  ).join(", ")
                : "N/A",
            duration: detail.DurationInHours || "N/A",
          }));
        })
        : [];
        const totalRecords = reports.length;
        const totalPages = Math.ceil(totalRecords / size);

        const startIndex = (page - 1) * size;
        const endIndex = page * size;

        const paginatedReport = reports.slice(startIndex, endIndex);

      return res.status(200).send({
        status: 200,
        message: "Models fetched successfully!",
        totalPages,
        data: {
          data : paginatedReport,
          summary : summary,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

}

export default ReportsController;
