const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Electronics",
                "Books",
                "Clothing",
                "Accessories",
                "Documents",
                "Other"
            ]
        },

        type: {
            type: String,
            required: true,
            enum: ["lost", "found"]
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        imageUrl: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["open", "claimed", "resolved"],
            default: "open"
        },

        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;