const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")



const Concept = require("../models/Concept");
const User = require("../models/User");


//get all manager
router.get("/mangagers", verifyToken, async (req, res) => {
    try {
        const allManagers = await User.find({ role: "manager" }).populate([
            "projects",
        ])
        res.json(allManagers)
    }
    catch (err) {
        res.status(500).json({ err: err.message })
    }
})

//get all the concept attached to the user
router.get("/", verifyToken, async (req, res) => {
    try {
        const user = req.user

        const conceptAttachedToUser = await Concept.find({ owner: user._id })
        res.json(conceptAttachedToUser)

    }
    catch (err) {
        res.status(500).json({ err: err.message })
    }

    //create a concept
    router.post("/", verifyToken, async (req, res) => {
        try {
            const user = req.user

            const selectedManagers = req.body.selectedManagers
            const selectedOperational= req.body.selectedOperational

            if (user.role != "admin")
                return res.status(400).json({ err: "you are not an admin, you cannot create a concept!" })

            selectedManagers.forEach((e)=>{
                if(e.role != "manager")
                    return res.status(400).json({ err: "One or more of the managers doesnot match!" })
            });

            selectedOperational.forEach((e)=>{
                if(e.role != "manager")
                    return res.status(400).json({ err: "One or more of the employee doesnot match!" })
            });

            const createdConcept = await Concept.create({
                owner: user.username,
                title: req.body.title,
                selectedManagers: req.body.selectedManagers,
                selectedOperatoinl: req.body.selectedOperatoinl,
                description: req.body.description
            })
            console.log(createdConcept)


            res.json(createdConcept)





        }
        catch (err) {
            res.status(500).json({ err: err.message })
        }
    })


})



router.post("/", verifyToken, async (req, res) => {
    const { title, selectedManagers } = req.body;

    // Check that selectedManagers are actual managers
    // const users = await User.find({ _id: { $in: selectedManagers }, role: "manager" });

    // if (users.length !== selectedManagers.length) {
    //     return res.status(400).json({ error: "One or more selected users are not managers." });
    // }

    // Create Concept
    const concept = await Concept.create({ title, selectedManagers })
    // new Concept({ title, selectedManagers });
    // await concept.save();

    res.status(201).json(concept);
})


module.exports = router