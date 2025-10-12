import { Router } from "express";
import { getAllServices } from "../controllers/serviceController";

const router = Router();

router.get("", async (req, res, next) => {
     try {
      res.status(200).json(await getAllServices());
    } catch (error) {
      next(error);
    }
});

export default router;
