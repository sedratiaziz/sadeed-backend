const router = require("express").Router()


const Concept = require("../models/Concept");
const User = require("../models/User");

const verifyToken = require("../middleware/verify-token")

router.get("/",verifyToken,async(req,res)=>{
    try{
        const allManagers = await User.find({ role: "manager" }).select("_id username").populate([
            "username",
            "comments.author"
        ])
        res.json(allHoots)    
    }
    catch(err){
        res.status(500).json({err:err.message})
    }
})



router.get("/")
async function createConcept(req, res) {
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
}
