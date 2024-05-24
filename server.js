import express from "express";
import cookieParser from "cookie-parser";
import createHttpError from "http-errors";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
// Routes
import { TaskRoute } from "./Routes/Task/Task.route.js";
import { AuthRouter } from "./Routes/Auth/Auth.route.js";
import { DepartmentRouter } from "./Routes/Department/Department.route.js";
import { WarehouseRoute } from "./Routes/Warehouse/Warehouse.route.js";
import { ProductCatalogRoute } from "./Routes/ProductCatalog/ProductCatalog.route.js";
import { SupplierRoute } from "./Routes/Supplier/Supplier.route.js";
import { MaterialCategoryRoute } from "./Routes/MaterialCategory/MaterialCategory.route.js";
import { MaterialRoute } from "./Routes/Material/Material.route.js";
import { InternalOrderRoute } from "./Routes/InternalOrder/InternalOrder.route.js";
import { ProductCatalogCategorryOneRoute } from "./Routes/ProductCatalogCategoryOne/ProductCatalogCategoryOne.route.js";
import { ProductCatalogCategorryTwoRoute } from "./Routes/productCatalogCategoryTwo/productCatalogCategoryTwo.route.js";
import { SeasonRoute } from "./Routes/Seasone/Seasone.route.js";
import { ProductCatalogTextileRoute } from "./Routes/ProductCatalogTextile/ProductCatalogTextile.route.js";
import { ProductCatalogDetailRoute } from "./Routes/ProductCatalogDetail/ProductCatalogDetail.route.js";
import { TemplatePatternRoute } from "./Routes/TemplatePattern/TemplatePattern.route.js";
import { TemplateTypeRoute } from "./Routes/TemplateType/TemplateType.route.js";
import { ManufacturingStageRoute } from "./Routes/ManufacturingStage/ManufacturingStage.route.js";
import { ComponentRoute } from "./Routes/Component/Component.route.js";
import { TemplateSizeRoute } from "./Routes/TemplateSize/TemplateSize.route.js";
import { TemplateRoute } from "./Routes/Template/Template.route.js";
import { SizeRoute } from "./Routes/Size/Size.route.js";
import { ColorRoute } from "./Routes/Color/Color.route.js";
import { OrderDetailColorRoute } from "./Routes/OrderDetailColor/OrderDetailColor.route.js";
import { OrderDetailSizeRoute } from "./Routes/OrderDetailSize/OrderDetailSize.route.js";
import { OrderDetailRoute } from "./Routes/OrderDetail/OrderDetail.route.js";
import { OrderRoute } from "./Routes/Order/Order.route.js";
import { ModelRoute } from "./Routes/Model/Model.route.js";
import { TrackingModelRoute } from "./Routes/TrackingModel/TrackingModel.route.js";
import { ReportsRoute } from "./Routes/Reports/Reports.route.js";
import { MaterialMovementRoute } from "./Routes/MaterialMovement/MaterialMovement.route.js";
import { MeasurementRoute } from "./Routes/Measurement/Measurement.route.js";
import { CollectionRoute } from "./Routes/Collection/Collection.route.js";
import { NoteRoute } from "./Routes/Note/Note.route.js";
import { Server } from "socket.io";
import { NotificationRoute } from "./Routes/Notification/Notification.route.js";

// Socket User List
export let socketUserList = [];

const app = express();

let corsOptions = {
  origin: ["http://localhost:3000", "https://dashboardnew-3bgv.onrender.com"],
  credentials: true,
};
app.use(cors(corsOptions));

// app setup
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// Setting server
const server = http.createServer(app);
export const io = new Server(server, { cors: corsOptions });

// Add new sUser
const addNewUser = (dep, sId) => {
  !socketUserList.some((user) => user.sId === sId) &&
    socketUserList.push({ dep: dep, sId: sId });
};
// Rmove sUser
const removeUser = (sId) => {
  const temp_user = socketUserList.filter((user) => user.sId !== sId);
  socketUserList = [...temp_user];
};
io.on("connection", (socket) => {
  socket.on("register", (dep) => {
    addNewUser(dep, socket.id);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

// Set Routes
app.use("/reports", ReportsRoute);
app.use("/task", TaskRoute);
app.use("/auth", AuthRouter);
app.use("/department", DepartmentRouter);
app.use("/warehouse", WarehouseRoute);
app.use("/productcatalog", ProductCatalogRoute);
app.use("/supplier", SupplierRoute);
app.use("/materialcategory", MaterialCategoryRoute);
app.use("/materialmovement", MaterialMovementRoute);
app.use("/material", MaterialRoute);
app.use("/internalorder", InternalOrderRoute);
app.use("/productcatalogcategoryone", ProductCatalogCategorryOneRoute);
app.use("/productcatalogcategorytwo", ProductCatalogCategorryTwoRoute);
app.use("/season", SeasonRoute);
app.use("/productcatalogtextile", ProductCatalogTextileRoute);
app.use("/productcatalogtdetail", ProductCatalogDetailRoute);
app.use("/templatepattern", TemplatePatternRoute);
app.use("/templatetype", TemplateTypeRoute);
app.use("/manufacturingstage", ManufacturingStageRoute);
app.use("/component", ComponentRoute);
app.use("/templatesize", TemplateSizeRoute);
app.use("/template", TemplateRoute);
app.use("/size", SizeRoute);
app.use("/color", ColorRoute);
app.use("/orderdetailcolor", OrderDetailColorRoute);
app.use("/orderdetailsize", OrderDetailSizeRoute);
app.use("/orderdetail", OrderDetailRoute);
app.use("/orders", OrderRoute);
app.use("/model", ModelRoute);
app.use("/trackingmodels", TrackingModelRoute);
app.use("/measurements", MeasurementRoute);
app.use("/collections", CollectionRoute);
app.use("/notes", NoteRoute);
app.use("/notification", NotificationRoute);

// 404 no route found
app.use((req, res, next) => {
  next(createHttpError(404, "Not found"));
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
    data: {},
  });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log("Server started on port " + PORT + "...");
});
