import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import SeasonController from "../../Controllers/Season/Season.controller.js";

const router = express.Router();

router.post("/", verifyUser(["ENGINEERING"]), SeasonController.createSeason);
router.get("/all", verifyUser(["ENGINEERING"]), SeasonController.getAllSeasons);
router.get("/", verifyUser(["ENGINEERING"]), SeasonController.getSeasonNames);
router.get("/:id", verifyUser(["ENGINEERING"]), SeasonController.getSeasonById);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  SeasonController.deleteSeason
);
router.put("/:id", verifyUser(["ENGINEERING"]), SeasonController.updateSeason);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  SeasonController.searchSeason
);
const SeasonRoute = router;
export { SeasonRoute };
