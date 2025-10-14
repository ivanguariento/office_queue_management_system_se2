import { Router } from "express";
import { getAllServices, getQueueLength } from "../controllers/serviceController";

const router = Router();

//GET /api/services
router.get("", async (req, res, next) => {
     try {
      res.status(200).json(await getAllServices());
    } catch (error) {
      next(error);
    }
});

//GET /api/services/:serviceTypeId to get people in queue for a specific service
router.get("/:serviceTypeId", async (req, res, next) => {
     try {
      res.status(200).json(await getQueueLength(req.params.serviceTypeId));
    } catch (error) {
      next(error);
    }
});

export default router;
