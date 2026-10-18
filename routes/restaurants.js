const router = require("express").Router();
const { adminAuth } = require("../middlewares/auth");
const {
  createRestaurantValidator,
  updateRestaurantValidator,
} = require("../middlewares/restaurantValidations");
const {
  createRestaurant,
  getMyRestaurant,
  updateBasicInfo,
  updateLoyaltyConfig,
  updateFirstPurchaseDiscount,
} = require("../controllers/restaurants");

router.post("/", adminAuth, createRestaurantValidator, createRestaurant);

router.get("/me", adminAuth, getMyRestaurant);

router.patch(
  "/update/basic",
  adminAuth,
  updateRestaurantValidator,
  updateBasicInfo,
);

router.patch("/update/loyalty", adminAuth, updateLoyaltyConfig);

router.patch("/update/promotions", adminAuth, updateFirstPurchaseDiscount);

module.exports = router;
