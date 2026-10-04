const router = require("express").Router();
const { adminAuth } = require("../middlewares/auth");
const {
  createRestaurantValidator,
} = require("../middlewares/restaurantValidations");
const { createRestaurant } = require("../controllers/restaurants");

router.post("/", adminAuth, createRestaurantValidator, createRestaurant);

module.exports = router;
