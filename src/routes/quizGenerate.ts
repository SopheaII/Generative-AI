import { Router } from "express";
import { quiz, getAll, getById, updateQuiz, deleteQuiz} from "../controllers/quizGenerate.controller";
import protectRoute from "../middleware/auth";

const router = Router();
router.post("/generate-quiz",protectRoute(), quiz);
router.get("/get-all-quiz",protectRoute(), getAll);
router.get("/generate-quiz/:id" , protectRoute(), getById)
router.put("/generate-quiz/:id" , protectRoute(), updateQuiz)
router.delete("/generate-quiz/:id" , protectRoute(), deleteQuiz)


export default router;
