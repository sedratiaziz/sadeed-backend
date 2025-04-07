const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")



const Concept = require("../models/Concept");
const User = require("../models/User");


router.get("/mangagers",verifyToken,async(req,res)=>{
    try{
        const allManagers = await User.find({ role: "manager" }).populate([
            "projects",
        ])
        res.json(allManagers)    
    }
    catch(err){
        res.status(500).json({err:err.message})
    }
})



router.post("/" , verifyToken, async (req, res)=> {
    const { title, selectedManagers } = req.body;

    // Check that selectedManagers are actual managers
    const users = await User.find({ _id: { $in: selectedManagers }, role: "manager" });

    if (users.length !== selectedManagers.length) {
        return res.status(400).json({ error: "One or more selected users are not managers." });
    }

    // Create Concept
    const concept = new Concept({ title, selectedManagers });
    await concept.save();

    res.status(201).json(concept);
})


module.exports = router