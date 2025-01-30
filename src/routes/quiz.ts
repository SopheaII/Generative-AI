import { Router } from "express";
import protectRoute from "../middleware/auth";
import { createQuizGenerator, getAllQuizzes, getQuizById, getByTopic} from "../controllers/quiz.controller";

const router = Router();

router.post("/generate-quiz", protectRoute(), createQuizGenerator);
router.get("/generate-quiz", getAllQuizzes);
router.get("/generate-quiz/:id", getQuizById);
router.get("/search", getByTopic);

export default router;