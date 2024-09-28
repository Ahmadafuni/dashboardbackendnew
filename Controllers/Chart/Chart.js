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
};

export default ChartController;
