const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: [true, "Verifique email o contraseña"],
      validate: {
        validator(v) {
          return validator.isEmail(v);
        },
        message: (props) => `Lo sentimos ${props.value} no es un email válido`,
      },
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
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [2, "El nombre debe contener al menos dos caracteres"],
      maxlength: [30, "El nombre debe contener máximo 30 caracteres"],
    },
    mobile: {
      countryCode: {
        type: String,
        required: [true, "El código de país es requerido"],
        validate: {
          validator(v) {
            const regex = /^\+\d{1,3}$/;
            return regex.test(v);
          },
          message: () => "El código de país es incorrecto",
        },
      },
      phone: {
        type: String,
        required: [true, "El teléfono es requerido"],
        validate: {
          validator(v) {
            const regex = /^\d{6,14}$/;
            return regex.test(v);
          },
          message: () => "El teléfono solo debe contener números",
        },
      },
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
  },
  { timestamps: true },
);

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password,
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Verifique email o contraseña"));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error("Verifique email o contraseña"));
        }

        return user;
      });
    });
};

module.exports = mongoose.model("User", userSchema);
