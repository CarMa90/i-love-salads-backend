const router = require("express").Router();
const { getUsers, getUserInfo } = require("../controllers/users");

router.get("/", getUsers);

router.get("/me", getUserInfo);

module.exports = router;
