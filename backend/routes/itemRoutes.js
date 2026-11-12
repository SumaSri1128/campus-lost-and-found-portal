const express = require("express");
const router = express.Router();

const {
    createItem,
    getItems,
    getItemById,
    updateItemStatus
} = require("../controllers/itemController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/", protect, createItem);
router.put("/:id/status", protect, updateItemStatus);

module.exports = router;