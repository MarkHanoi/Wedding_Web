import { Router, type IRouter } from "express";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";
import healthRouter from "./health";
import rsvpRouter from "./rsvp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyticsRouter);
router.use(rsvpRouter);
router.use(adminRouter);

export default router;
