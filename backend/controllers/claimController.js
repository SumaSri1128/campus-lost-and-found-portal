const Claim = require("../models/Claim");
const Item = require("../models/Item");

// Submit a claim for a found item
const createClaim = async (req, res) => {
    try {
        const { itemId, message } = req.body;

        if (!itemId || !message || !message.trim()) {
            return res.status(400).json({
                message: "Please provide an item ID and claim message"
            });
        }

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (item.type !== "found") {
            return res.status(400).json({
                message: "You can only claim found items"
            });
        }

        if (item.status !== "open") {
            return res.status(400).json({
                message: "This item is not available for claiming"
            });
        }

        if (item.reportedBy.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot claim an item you reported"
            });
        }

        const existingClaim = await Claim.findOne({
            item: itemId,
            claimedBy: req.user._id,
            status: "pending"
        });

        if (existingClaim) {
            return res.status(400).json({
                message: "You already have a pending claim for this item"
            });
        }

        const claim = await Claim.create({
            item: itemId,
            claimedBy: req.user._id,
            message: message.trim()
        });

        res.status(201).json({
            message: "Claim submitted successfully",
            claim
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Get claims: admins see all; students see their own
const getClaims = async (req, res) => {
    try {
        const filter = req.user.role === "admin"
            ? {}
            : { claimedBy: req.user._id };

        const claims = await Claim.find(filter)
            .populate("item")
            .populate("claimedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Approve or reject a claim (admin only)
const updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        if (claim.status !== "pending") {
            return res.status(400).json({
                message: "This claim has already been reviewed"
            });
        }

        claim.status = status;
        await claim.save();

        if (status === "approved") {
            await Item.findByIdAndUpdate(claim.item, {
                status: "resolved"
            });
        }

        res.status(200).json({
            message: `Claim ${status} successfully`,
            claim
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    createClaim,
    getClaims,
    updateClaimStatus
};