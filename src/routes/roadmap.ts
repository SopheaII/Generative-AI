import { Router } from "express";
import protectRoute from "../middleware/auth";
import { roadMap, getRoadMap, getRoadMapById, deleteRoadMapById } from "../controllers/roadmap.controller";

const router = Router();

router.post("/generate-roadmap", protectRoute(), roadMap);
router.get("/roadmaps", protectRoute(), getRoadMap);
router.get("/roadmaps/:id", protectRoute(), getRoadMapById);
router.delete("/roadmaps/:id", protectRoute(), deleteRoadMapById);
// router.put("/roadmaps/:id", protectRoute(), updateRoadMapById)


export default router;