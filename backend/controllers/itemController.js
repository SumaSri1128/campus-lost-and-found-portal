const Item = require("../models/Item");

// Report a lost or found item
const createItem = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            type,
            location,
            date,
            imageUrl
        } = req.body;

        const item = await Item.create({
            title,
            description,
            category,
            type,
            location,
            date,
            imageUrl,
            reportedBy: req.user._id
        });

        res.status(201).json({
            message: "Item reported successfully",
            item
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// Get all items with optional filters
const getItems = async (req, res) => {
    try {
        const filter = {};

        if (req.query.type) {
            filter.type = req.query.type;
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: "i" } },
                { description: { $regex: req.query.search, $options: "i" } },
                { location: { $regex: req.query.search, $options: "i" } }
            ];
        }

        const items = await Item.find(filter)
            .populate("reportedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: items.length,
            items
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get one item
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate("reportedBy", "name email");

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json(item);

    } catch (error) {
        res.status(400).json({
            message: "Invalid item ID"
        });
    }
};

// Update item status
const updateItemStatus = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const isOwner = item.reportedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "You cannot update this item"
            });
        }

        const allowedStatuses = ["open", "claimed", "resolved"];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: "Invalid item status"
            });
        }

        item.status = req.body.status;
        await item.save();

        res.status(200).json({
            message: "Item status updated",
            item
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

module.exports = {
    createItem,
    getItems,
    getItemById,
    updateItemStatus
};