import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import rsvpRouter from "./rsvp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(rsvpRouter);

export default router;
