const { required } = require("joi");
const mongoose = require("mongoose");
const Counter = require("./counter");

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El ID del cliente es requerido"],
    },
    products: [
      {
        name: {
          type: String,
          required: [true, "El nombre del producto es requerido"],
        },
        price: {
          type: Number,
          required: [true, "El precio del producto es requerido"],
          min: [0, "El precio no puede ser negativo"],
        },
        _id: {
          type: String,
          required: [true, "El ID del producto es requerido"],
        },
        quantity: {
          type: Number,
          min: [1, "La cantidad debe ser al menos 1"],
          required: [true, "La cantidad es requerida"],
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["Enviado", "Cancelado", "Aceptado", "Listo", "Entregado"],
        message: "{VALUE} no es un estado válido",
      },
      default: "Enviado",
      required: [true, "El status de la orden es requerido"],
    },
    cancelMessage: {
      type: String,
      default: "",
      trim: true,
    },
    cancelAcceptance: {
      type: Boolean,
      default: false,
    },
    orderNumber: {
      type: Number,
      unique: true,
      sparse: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "El total de la orden es requerido"],
      min: [0, "El total no puede ser negativo"],
    },
  },
  { timestamps: true },
);

orderSchema.pre("save", async function () {
  if (!this.isNew) {
    return;
  }

  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "orderNumber" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true },
    );

    this.orderNumber = counter.seq;
  } catch (err) {
    throw err;
  }
});

module.exports = mongoose.model("Order", orderSchema);
