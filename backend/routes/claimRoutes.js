const express = require("express");
const router = express.Router();

const {
    createClaim,
    getClaims,
    updateClaimStatus
} = require("../controllers/claimController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createClaim);
router.get("/", protect, getClaims);
router.patch("/:id/status", protect, adminOnly, updateClaimStatus);
router.patch("/:claimId/status", protect, adminOnly, updateClaimStatus);
module.exports = router;