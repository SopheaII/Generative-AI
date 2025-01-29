import { Router } from "express";
import protectRoute from "../middleware/auth";
import { generateRoadmap,getRoadmaps ,getRoadmap,deleteRoadmap} from "../controllers/genrateroadmap.controller";
const router = Router();
router.post('/generate-roadmap',protectRoute(),generateRoadmap);
router.get('/get-roadmaps',protectRoute(),getRoadmaps)
router.get('/:id',protectRoute(),getRoadmap);
router.delete('/:id',protectRoute(),deleteRoadmap);

export default router;