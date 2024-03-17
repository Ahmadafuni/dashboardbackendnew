import express from "express";
import AuthenticationController from "../../Controllers/Authentication/Authentication.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import { uploadProfile } from "../../Middleware/Upload.middleware.js";

const router = express.Router();

router.get("/session", AuthenticationController.checkSession);
router.post("/sign-out", AuthenticationController.signOut);
router.post(
  "/new-admin",
  uploadProfile.single("profiles"),
  AuthenticationController.createAdmin
);
router.post(
  "/",
  verifyUser(["FACTORYMANAGER"]),
  uploadProfile.single("profiles"),
  AuthenticationController.createUser
);

router.get(
  "/search/:searchTerm",
  verifyUser(["FACTORYMANAGER"]),
  AuthenticationController.searchUsers
);

router.post("/login", AuthenticationController.login);

router.get(
  "/all",
  verifyUser(["FACTORYMANAGER", "CUTTING", "TAILORING"]),
  AuthenticationController.getAllUsers
);
router.get(
  "/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "WAREHOUSEMANAGER",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  AuthenticationController.getUserById
);
// router.get(
//   "/managers",
//   verifyUser(["FACTORYMANAGER", "ENGINEERING", "STOREMANAGER"]),
//   AuthenticationController.getManagers
// );
router.delete(
  "/:id",
  verifyUser(["FACTORYMANAGER"]),
  AuthenticationController.deleteUser
);
router.put(
  "/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "WAREHOUSEMANAGER",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  uploadProfile.single("profiles"),
  AuthenticationController.updateUser
);
router.get(
  "/toggle-user/:id",
  verifyUser(["FACTORYMANAGER"]),
  AuthenticationController.toggleUser
);

const AuthRouter = router;
export { AuthRouter };
