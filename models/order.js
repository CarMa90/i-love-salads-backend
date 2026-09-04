const { required } = require("joi");
const mongoose = require("mongoose");

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
      enum: ["Enviado", "Cancelado", "Aceptado", "Listo", "Entregado"],
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

module.exports = mongoose.model("Order", orderSchema);
