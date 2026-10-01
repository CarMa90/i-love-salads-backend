const Restaurant = require("../models/restaurant");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const ForbiddenError = require("../errors/forbidden-err");

module.exports.createRestaurant = (req, res, next) => {
  const { _id: adminId, userType } = req.user;
  const { name, logoUrl, description, foodTypes } = req.body;

  if (userType !== "admin") {
    return next(
      new ForbiddenError(
        "Acceso denegado: Se requieren permisos de administrador para registrar una marca",
      ),
    );
  }

  // 1. Validaciones básicas del negocio
  if (!name || name.trim().length < 2) {
    return next(
      new BadRequestError(
        "El nombre de la marca gastronómica es obligatorio y debe tener al menos 2 caracteres",
      ),
    );
  }

  if (!foodTypes || !Array.isArray(foodTypes) || foodTypes.length === 0) {
    return next(
      new BadRequestError(
        "Debes seleccionar al menos una categoría de comida (ej. Ensaladas, Sopas)",
      ),
    );
  }

  // 2. Bloquear si este administrador ya tiene un restaurante registrado
  Restaurant.findOne({ ownerId: adminId })
    .then((existingRestaurant) => {
      if (existingRestaurant) {
        throw new ConflictError(
          "Acceso denegado: Este usuario administrador ya tiene una marca de restaurante registrada",
        );
      }

      // 3. Forzamos a minúsculas las etiquetas de comida para que los filtros del frontend sean inmunes a mayúsculas
      const cleanFoodTypes = foodTypes.map((type) => type.toLowerCase().trim());

      // 4. Creamos el payload esencial y ligero
      const restaurantPayload = {
        name: name.trim(),
        logoUrl: logoUrl || null,
        description: description ? description.trim() : "",
        foodTypes: cleanFoodTypes,
        ownerId: adminId,
      };

      return Restaurant.create(restaurantPayload);
    })
    .then((newRestaurant) => {
      return res.status(201).send({
        status: "success",
        data: {
          id: newRestaurant._id,
          name: newRestaurant.name,
          logoUrl: newRestaurant.logoUrl,
          description: newRestaurant.description,
          foodTypes: newRestaurant.foodTypes,
          ownerId: newRestaurant.ownerId,
          isActive: newRestaurant.isActive,
        },
        message: `¡Bienvenido! Tu marca comercial "${newRestaurant.name}" ha sido registrada con éxito. Ya puedes configurar tus sucursales y menú.`,
      });
    })
    .catch((err) => {
      if (err.code === 11000 || err.cause?.code === 11000) {
        return next(
          new ConflictError(
            "Este administrador ya cuenta con un restaurante registrado.",
          ),
        );
      }
      return next(err);
    });
};
