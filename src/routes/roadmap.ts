import { Router } from "express";
import protectRoute from "../middleware/auth";
import { roadmap, getAllRoadmap, getRoadmapById, deleteRoadmap 
} from "../controllers/Testroudmap.controller";

const router = Router();

router.post("/generate-roadmap", protectRoute(), roadmap);
router.get("/roadmaps", protectRoute(), getAllRoadmap);
router.get("/roadmap/:id", protectRoute(), getRoadmapById);
router.put("/roadmap/:id", protectRoute());
router.delete("/roadmap/:id", protectRoute(), deleteRoadmap);

export default router;