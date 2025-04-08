const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")



const Concept = require("../models/Concept");
const User = require("../models/User");


//get all manager
router.get("/managers", verifyToken, async (req, res) => {
    try {
        const allManagers = await User.find({ role: "manager" }).populate([
            "projects",
        ])

        allManagersToSend = allManagers.map((e) => {
            const managerAsObj = e.toObject()
            delete managerAsObj.hashedPassword
            return managerAsObj
        })

        res.json(allManagersToSend)
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
})

//create a concept
router.post("/", verifyToken, async (req, res) => {
    try {
        const user = req.user
        const { selectedManagers=[] , selectedOperational=[] , title, description } = req.body;
        console.log(selectedManagers)

        const selectedManagersFullObj = await Promise.all( selectedManagers.map(async (e)=>{
            const obj = await User.findOne({_id: e})
            console.log(obj)
            return obj
        }))
        
        const selectedOperationalFullObj = await Promise.all( selectedOperational.map(async (e)=>{
            const obj = await User.findOne({_id: e})
            console.log(obj)
            return obj
        }))

        if (user.role !== "admin") {
            return res.status(400).json({ err: "You are not an admin, you cannot create a concept!" })
        }

        for (const manager of selectedManagersFullObj) {
            if (manager.role !== "manager") {
                console.log(typeof(manager))
                console.log(manager.role)
                return res.status(400).json({ err: "One or more of the managers do not have the role 'manager'!" })
            }
        }


        for (const employee of selectedOperationalFullObj) {
            if (employee.role !== "employee") {
                return res.status(400).json({ err: "One or more of the operational staff do not have the role 'employee'!" })
            }
        }

        const createdConcept = await Concept.create({
            owner: user._id,
            title,
            selectedManagers,
            selectedOperational,
            description
        })

        res.json(createdConcept)
    }
    catch (err) {
        res.status(500).json({ err: err.message })
    }
})






module.exports = router