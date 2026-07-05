import { Router, type IRouter } from "express";
import healthRouter from "./health";
import metricsRouter from "./metrics";
import chatRouter from "./chat";
import waitlistRouter from "./waitlist";
import ogRouter from "./og";
import applyRouter from "./apply";
import adminRouter from "./admin";
import sessionsRouter from "./sessions";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(metricsRouter);
router.use(chatRouter);
router.use(waitlistRouter);
router.use(ogRouter);
router.use(applyRouter);
router.use(adminRouter);
router.use(sessionsRouter);
// Stripe checkout + webhook — must come after express.json() global middleware
// which saves req.rawBody for webhook signature verification.
router.use(stripeRouter);

export default router;
