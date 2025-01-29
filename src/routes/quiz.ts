import { Router } from "express";
import protectRoute from "../middleware/auth";
import { quiz ,getAllQuiz, getByID,deleteQuiz} from "../controllers/quizControllers";

const router = Router();
router.post("/generate-quiz",protectRoute(),quiz);
router.get("/generate-quiz",protectRoute(),getAllQuiz);
router.get("/generate-quiz/:id",protectRoute(),getByID);
router.delete("/generate-quiz/:id",protectRoute(),deleteQuiz);
export default router;
