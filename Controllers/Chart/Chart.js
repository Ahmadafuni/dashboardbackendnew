import prisma from "../../client.js";

const ChartController ={
    getOrderChartData : async (req, res, next) => {
        try {
            // Fetch all orders with the relevant details
            const orders = await prisma.orders.findMany({
                where: {
                    Audit: {
                        IsDeleted: false, // Only get non-deleted orders
                    },
                },
                select: {
                    Id: true,
                    OrderName: true,
                    OrderNumber: true,
                    RunningStatus: true, // Completed, On Hold, Ongoing, etc.
                    DeadlineDate: true,
                    Quantity: true,
                    Audit: {
                        select: {
                            CreatedAt: true, // Fetch createdAt timestamp
                        },
                    },
                },
            });

            // Process the data for your diagram/chart
            const processedOrders = orders.map(order => ({
                id: order.Id,
                orderName: order.OrderName,
                orderNumber: order.OrderNumber,
                runningStatus: order.RunningStatus,
                quantity: order.Quantity,
                deadlineDate:order.DeadlineDate,
                createdAt: order.Audit.CreatedAt,
            }));

            // Return the processed data in the response
            return res.status(200).send({
                status: 200,
                message: "Orders data retrieved successfully!",
                data: processedOrders,
            });
        } catch (error) {
            console.error("Error fetching orders data:", error);
            return res.status(500).send({
                status: 500,
                message: "Internal server error. Please try again later!",
                data: {},
            });
        }
    },
    getAllAttentionNotes: async (req, res, next) => {
        const { timePeriod } = req.query;  // Optional time filter

        // Determine the start date based on the time period
        let startDate;
        const now = new Date();

        switch (timePeriod) {
            case 'daily':
                // Set startDate to the beginning of today (00:00:00)
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                // Set startDate to 7 days ago
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                // Set startDate to 30 days ago
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case 'yearly':
                // Set startDate to 365 days ago
                startDate = new Date(now.setDate(now.getDate() - 365));
                break;
            default:
                startDate = new Date(0);  // Default: Fetch all records
        }

        try {
            const notes = await prisma.notes.findMany({
                where: {
                    NoteType: 'ATTENTION',
                    Audit: {
                        IsDeleted: false,
                        CreatedAt: {
                            gte: startDate,  // Filter by the selected time period
                        },
                    },
                },
                orderBy: { Id: "desc" },
                select: {
                    Id: true,
                    NoteType: true,
                    AssignedToDepartment: {
                        select: {
                            Id: true,
                            Name: true,
                        },
                    },
                    CreatedDepartment: {
                        select: {
                            Id: true,
                            Name: true,
                        },
                    },
                    Description: true,
                    Audit: {
                        select: {
                            CreatedAt: true,
                        },
                    },
                },
            });

            return res.status(200).send({
                status: 200,
                message: "ATTENTION Notes fetched successfully!",
                data: notes,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                status: 500,
                message: "Internal server error. Please try again later.",
                data: {},
            });
        }
    },
    getTasksChart: async (req, res, next) => {
        const { timePeriod } = req.query;

        // Determine the start date based on the time period
        let startDate;
        const now = new Date();

        switch (timePeriod) {
            case 'daily':
                // Set startDate to the beginning of today (00:00:00)
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                // Set startDate to 7 days ago
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                // Set startDate to 30 days ago
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case 'yearly':
                // Set startDate to 365 days ago
                startDate = new Date(now.setDate(now.getDate() - 365));
                break;
            default:
                startDate = new Date(0);  // Default: Fetch all records
        }

        try {
            const tasks = await prisma.tasks.findMany({
                where: {
                    Audit: {
                        IsDeleted: false,
                        CreatedAt: {
                            gte: startDate,  // Filter tasks created after or at startDate
                        },
                    },
                    CreatedByDepartmentId: req.userDepartmentId,
                },
                orderBy: { Id: "desc" },
                select: {
                    Id: true,
                    TaskName: true,
                    DueAt: true,
                    Description: true,
                    AssignedFile: true,
                    Status: true,
                    Feedback: true,
                    StartTime: true,
                    EndTime: true,
                    AssignedToDepartment: {
                        select: {
                            Id: true,
                            Name: true,
                        },
                    },
                    Audit: {
                        select: {
                            CreatedAt: true, // Fetch createdAt timestamp
                        },
                    },
                },
            });

            return res.status(200).send({
                status: 200,
                message: "Tasks fetched successfully!",
                data: tasks,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                status: 500,
                message: "Internal server error. Please try again later.",
                data: {},
            });
        }
    },
};

export default ChartController;
