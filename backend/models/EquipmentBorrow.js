const mongoose = require("mongoose");

const equipmentBorrowSchema = new mongoose.Schema(
{
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },

  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
      },
      quantity: Number,
    },
  ],

  status: {
    type: String,
    enum: [
      "borrowed",
      "return_submitted",
      "returned",
      "overdue"
    ],
    default: "borrowed",
  },

  dueAt: Date,
  returnedAt: Date,
  verifiedAt: Date,

  returnProof: {
    type: String,
    default: null,
  },

},
{ timestamps: true }
);

module.exports = mongoose.model("EquipmentBorrow", equipmentBorrowSchema);