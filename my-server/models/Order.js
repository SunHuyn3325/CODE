const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    userName: {
        type: String,
        required: true
    },

    orderItems: [
        {
            name: String,
            qty: Number,
            image: String,
            price: Number,
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },

    paymentMethod: {
        type: String,
        enum: ["online", "cod"],
        default: "online"
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    paidAt: Date,

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },

    shipping: {
        carrier: { type: String, default: "SPX Express" },
        carrierContact: { type: String, default: "" },
        carrierReferenceId: { type: String, default: "" },
        trackingCode: { type: String, default: "", index: true },
        trackingUrl: { type: String, default: "" },
        estimatedDelivery: { type: Date, default: null },
        pickupAt: { type: Date, default: null },
        pickedUpAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        lastLocation: { type: String, default: "" },
        lastEventStatus: { type: String, default: "" },
        lastEventAt: { type: Date, default: null },
        note: { type: String, default: "" },
        // Delivery person information (assigned courier/driver)
        deliveryPerson: {
            // reference to a User document (if delivery personnel are stored as users)
            id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
            name: { type: String, default: "" },
            phone: { type: String, default: "" },
            vehicle: { type: String, default: "" },
            assignedAt: { type: Date, default: null }
        }
    }

},
{
    timestamps: true
}
);

// logistics events (history of tracking updates)
orderSchema.add({
    logisticsEvents: [
        {
            eventId: { type: String, default: "" },
            status: { type: String, default: "" },
            timestamp: { type: Date, default: null },
            location: { type: String, default: "" },
            details: { type: String, default: "" },
            raw: { type: Object, default: {} }
        }
    ]
});

module.exports = mongoose.model("Order", orderSchema);
