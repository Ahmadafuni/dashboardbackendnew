import prisma from "../../client.js";


const DataTableController = {


    getAllFields: async (req, res) => {
        const { tableName } = req.params;
    
        try {
            const tableExists = await prisma.$queryRaw`SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = ${tableName}
            ) AS "exists";`;
    
            if (!tableExists[0].exists) {
                return res.status(404).json({
                    status: 500,
                    message: "لايوجد جدول بهذا الاسم",
                    data: {},
                });
            }

           // استعلام للحصول على الحقول من نوع string فقط
            const fields = await prisma.$queryRaw`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ${tableName} 
                  AND data_type IN ('character varying', 'text');`;
    
            res.json(fields);
        } catch (error) {
            return res.status(500).send({
                status: 500,
                message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
                data: {},
            });
        }
    },
    
    filterTable: async (req , res) => {

        const { tableName } = req.params;
        const { filters } = req.body;
    
        try {
            // Construct dynamic query
            const where = {};
            filters.forEach(filter => {
                if (filter.column && filter.value) {
                    where[filter.column] = {
                        contains: filter.value, // or 'equals' depending on your needs
                        mode: 'insensitive', // For case insensitive search
                    };
                }
            });
    
            // Fetch data from the specified table
            const results = await prisma[tableName].findMany({
                where: where,
            });
    
            res.json(results);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },



};

export default DataTableController ;