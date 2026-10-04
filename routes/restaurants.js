const router = require("express").Router();
const { adminAuth } = require("../middlewares/auth");
const {
  createRestaurantValidator,
} = require("../middlewares/restaurantValidations");
const {
  createRestaurant,
  getMyRestaurant,
} = require("../controllers/restaurants");

router.post("/", adminAuth, createRestaurantValidator, createRestaurant);

router.get("/me", adminAuth, getMyRestaurant);

module.exports = router;
