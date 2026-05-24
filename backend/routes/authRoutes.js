const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

router.post("/register",registerUser);

router.post("/login",loginUser);

router.get("/profile", protect, (req,res)=>{

    res.json({
        success:true,
        user:req.user
    });

});

module.exports = router;