const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribed: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: "website",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);

//mongodb+srv://kumbhsevak_db_user:ayurvedakumbh2025@ayurvedakumbh.sicppen.mongodb.net/?retryWrites=true&w=majority&appName=ayurvedakumbh
