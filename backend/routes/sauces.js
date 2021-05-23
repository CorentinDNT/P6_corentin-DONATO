const express = require("express");
const router = express.Router();

const saucesCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

//CRUD\\

/* CREATE */
router.post("/", auth, multer, saucesCtrl.createSauce);
/* READ */
router.get("/", auth, saucesCtrl.getAllSauce);
router.get("/:id", auth, saucesCtrl.getSauce);
/* UPDATE */
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
/* DELETE */
router.delete("/:id", auth, saucesCtrl.deleteSauce);

/* LIKE */
router.post("/:id/like", auth, saucesCtrl.like);

module.exports = router;
