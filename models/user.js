const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// Sub-esquema para las direcciones de entrega del cliente
const addressSchema = new mongoose.Schema(
  {
    alias: { type: String, default: "Casa" }, // Ej. Casa, Trabajo, Novia
    street: { type: String, required: [true, "La calle es obligatoria"] },
    exteriorNumber: {
      type: String,
      required: [true, "El número exterior es obligatorio"],
    },
    interiorNumber: { type: String },
    crossStreets: {
      type: String,
      required: [
        true,
        "Las entrecalles o esquinas son obligatorias para facilitar la entrega",
      ],
    },
    neighborhood: {
      type: String,
      required: [true, "La colonia es obligatoria"],
    },
    postalCode: {
      type: String,
      required: [true, "El código postal es obligatorio"],
    },
    references: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: true },
);

// Sub-esquema para el sistema de puntos/monedero por restaurante
const loyaltyPointsSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    points: { type: Number, default: 0, min: 0 },
    walletBalance: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El nombre debe contener al menos dos caracteres"],
      maxlength: [30, "El nombre debe contener máximo 30 caracteres"],
    },
    password: {
      type: String,
      required: [true, "El password es obligatorio"],
      minlength: [8, "El password debe tener al menos 8 caracteres"],
      validate: {
        validator(v) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
          return regex.test(v);
        },
        message: () =>
          "El password debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
      },
      select: false,
    },
    userType: {
      type: String,
      required: [true, "Ocurrió un error, intentar más tarde"],
      enum: {
        values: ["client", "restaurant", "admin"],
        message: (props) => `${props.value} no es un tipo de usuario válido`,
      },
      default: "client",
    },
    email: {
      type: String,
      required: [
        function isEmailRequired() {
          return this.userType === "admin";
        },
        "El email es obligatorio",
      ],
      trim: true,
      lowercase: true,
      validate: {
        validator(v) {
          if (!v && this.userType !== "admin") return true;
          return validator.isEmail(v);
        },
        message: (props) => `Lo sentimos ${props.value} no es un email válido`,
      },
    },
    mobile: {
      countryCode: {
        type: String,
        required: [
          function isCountryCodeRequired() {
            return this.userType !== "restaurant";
          },
          "El código de país es requerido",
        ],
        validate: {
          validator(v) {
            if (!v && this.userType === "restaurant") return true;
            const regex = /^\+\d{1,3}$/;
            return regex.test(v);
          },
          message: () => "El código de país es incorrecto",
        },
      },
      phone: {
        type: String,
        required: [
          function isPhoneRequired() {
            return this.userType !== "restaurant";
          },
          "El teléfono es requerido",
        ],
        validate: {
          validator(v) {
            if (!v && this.userType === "restaurant") return true;
            const regex = /^\d{6,14}$/;
            return regex.test(v);
          },
          message: () => "El teléfono solo debe contener números",
        },
      },
    },
    username: {
      type: String,
      required: [
        function isUsernameRequired() {
          return this.userType === "restaurant";
        },
        "El nombre de usuario es obligatorio",
      ],
      trim: true,
      lowercase: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [
        function isBranchRequired() {
          return this.userType === "restaurant";
        },
        "La sucursal es obligatoria",
      ],
    },
    addresses: [addressSchema],
    loyalty: [loyaltyPointsSchema],
    // 🔐 CONTROL DE VERIFICACIÓN Y TOKENS (Doble Candado)
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Almacenamiento seguro de tokens efímeros para SMS y Correo
    phoneVerificationToken: { type: String, select: false },
    phoneTokenExpires: { type: Date, select: false },

    emailVerificationToken: { type: String, select: false },
    emailTokenExpires: { type: Date, select: false },

    // Temporizador TTL integrado
    expireAt: {
      type: Date,
      expires: 600, // 10 minutos
      default: function getInitialExpiration() {
        // Si es cajero de restaurante, nace sin fecha de expiración (nunca se borra)
        if (this.userType === "restaurant") return undefined;

        // Si es cliente o admin, nace con la cuenta regresiva activa inmediatamente
        return new Date();
      },
    },
  },
  { timestamps: true },
);

// Celular único global (solo aplica si el teléfono existe)
userSchema.index(
  { "mobile.countryCode": 1, "mobile.phone": 1 },
  {
    unique: true,
    partialFilterExpression: { "mobile.phone": { $exists: true } },
  },
);

// Email único parcial (evita duplicar correos sin romper usuarios con email null)
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true } },
  },
);

// Username único parcial (evita duplicar usuarios de cajero)
userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { username: { $exists: true } },
  },
);

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  loginIdentifier,
  password,
) {
  const query = {};

  if (/^\d+$/.test(loginIdentifier)) {
    query["mobile.phone"] = loginIdentifier;
  } else if (validator.isEmail(loginIdentifier)) {
    query.email = loginIdentifier.toLowerCase();
  } else {
    query.username = loginIdentifier.toLowerCase();
  }

  return this.findOne(query)
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Verifique credenciales o contraseña"));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new Error("Verifique credenciales o contraseña"),
          );
        }

        return user;
      });
    });
};

module.exports = mongoose.model("User", userSchema);
