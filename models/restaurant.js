const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del restaurante es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe contener al menos dos caracteres"],
      maxlength: [50, "El nombre comercial no puede exceder los 50 caracteres"],
    },
    logoUrl: {
      type: String,
      default: null, // Almacenará la URL de la imagen en tu CDN (Cloudinary / AWS S3)
    },

    // 📝 Breve descripción del concepto del restaurante
    description: {
      type: String,
      maxlength: [250, "La descripción no puede exceder los 250 caracteres"],
      trim: true,
      default: "",
    },

    // 🍕 Etiquetas de categorías de comida para los filtros de delivery
    foodTypes: {
      type: [String],
      required: [
        true,
        "Debes seleccionar al menos una categoría de comida que describa tu restaurante",
      ],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message:
          "El restaurante debe contener al menos una etiqueta de comida para los filtros.",
      },
    },

    // 🏪 RELACIÓN CORE: Conecta la franquicia directamente con su dueño (Administrador)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "El restaurante debe estar asociado obligatoriamente a un usuario administrador",
      ],
      unique: true, // Un administrador solo puede ser dueño de una marca en este flujo
    },

    // 🎁 CONFIGURACIÓN DEL SISTEMA DE LOYALTY (Fidelización de Marca)
    loyaltyConfig: {
      programType: {
        type: String,
        required: true,
        enum: {
          values: ["disabled", "wallet", "points"],
          message: (props) =>
            `${props.value} no es un tipo de programa de lealtad válido`,
        },
        default: "disabled",
      },

      // ESQUEMA A: Monedero Electrónico (Porcentaje de cashback)
      walletSettings: {
        cashbackPercentage: {
          type: Number,
          default: 0,
          min: [0, "El porcentaje de cashback no puede ser negativo"],
          max: [100, "El porcentaje de cashback no puede exceder el 100%"],
        },
      },

      // ESQUEMA B: Sistema de Puntos con Metas y Recompensas
      pointsSettings: {
        pesosPerPoint: {
          type: Number,
          default: 20, // Cada \$20 pesos de compra = 1 punto
          min: [1, "El valor en pesos por punto debe ser al menos $1 peso"],
        },
        pointsThreshold: {
          type: Number,
          default: 100, // Meta para reiniciar a 0 (Ej: 100 puntos)
          min: [1, "La meta de puntos debe ser al menos de 1 punto"],
        },
        rewardCouponAmount: {
          type: Number,
          default: 150, // Cupón de dinero de regalo al cumplir la meta
          min: [0, "El valor del cupón de recompensa no puede ser negativo"],
        },
      },
    },

    // 📣 CONFIGURACIÓN DE CAMPAÑAS DE MARKETING (Descuentos contra fraudes)
    promotions: {
      firstPurchaseDiscount: {
        type: Number,
        default: 0, // Porcentaje de descuento (ej. 15 para 15% de descuento)
        min: [0, "El descuento de cortesía no puede ser negativo"],
        max: [100, "El descuento no puede exceder el 100%"],
      },
      isFirstPurchaseDiscountActive: {
        type: Boolean,
        default: false, // Inicia apagado por defecto hasta que el admin lo configure
      },
    },

    isActive: {
      type: Boolean,
      default: true, // Inhabilitación lógica completa de la marca
    },
  },
  { timestamps: true },
);

// 📌 ÍNDICES DE SEGURIDAD CONTRA DUPLICADOS
restaurantSchema.index({ ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Restaurant", restaurantSchema);
