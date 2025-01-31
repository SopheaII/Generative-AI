import { Router } from "express";
import {quize} from "../controllers/generate-quiz.controller"
import protectRoute from "../middleware/auth";

const router = Router();

router.post("/generate-quiz", protectRoute(), quize);
export default router;