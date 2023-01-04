const express = require("express")
const router = express.Router()

const IndexController = require("../controllers/index.controller")
// const { validate } = require("../middlewares/validators/wrapper.validator")
// const { indexValidator } = require("../middlewares/validators/index.validations")

router.get("/", IndexController.index)
router.post("/createVoucher", IndexController.createVoucher)
router.post("/test", IndexController.test)

module.exports = router
