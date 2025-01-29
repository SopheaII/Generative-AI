import { Router } from "express";
import protectRoute from "../middleware/auth";
// import { askQuery}  from "../controllers/chat.controller";
import { askQuery } from "../controllers/chat.controller";

const router = Router();

router.post("/askQuery", protectRoute(), askQuery);

export default router;