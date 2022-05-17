const express = require("express");

const { getAllServices } = require("../controllers/serviceController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/services").get(getAllServices);

module.exports = router;
