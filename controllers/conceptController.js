const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")



const Concept = require("../models/Concept");
const User = require("../models/User");
const Notification = require("../models/Notification");


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
        const { selectedManagers = [], selectedOperational = [], title, description } = req.body;
        console.log(selectedManagers)

        const selectedManagersFullObj = await Promise.all(selectedManagers.map(async (e) => {
            const obj = await User.findOne({ _id: e })
            console.log(obj)
            return obj
        }))

        const selectedOperationalFullObj = await Promise.all(selectedOperational.map(async (e) => {
            const obj = await User.findOne({ _id: e })
            console.log(obj)
            return obj
        }))

        if (user.role !== "admin") {
            return res.status(400).json({ err: "You are not an admin, you cannot create a concept!" })
        }

        for (const manager of selectedManagersFullObj) {
            if (manager.role !== "manager") {
                console.log(typeof (manager))
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

        await createdConcept.populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ])

        // Trigger notifications to selected managers
        for (let managerId of selectedManagers) {
            console.log(managerId)
            const manager = await User.findById(managerId);
            await Notification.create({
                user: manager._id,
                message: `You have been assigned to a new concept titled "${title}".`,
            }).then(notification => {
                console.log("Notification created:", notification);
            }).catch(err => {
                console.error("Error creating notification:", err);
            });
        }

        // Trigger notifications to selected employee
        for (let operationalId of selectedOperational) {
            const operational = await User.findById(operationalId);
            await Notification.create({
                user: manager._id,
                message: `You have been assigned to a new concept titled "${title}".`,
            });
        }

        res.json(createdConcept)
    }
    catch (err) {
        res.status(500).json({ err: err.message })
    }
})


//retrive unread notification
router.get("/:userId/notifications/:id", verifyToken, async (req, res) => {
    try {
        const user = req.user
        // Get unread notifications for the logged-in user
        const notifications = await Notification.find({ user: user._id, isReadead: false })
                                                .sort({ created_at: -1 })

        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})

//mark notification as read
router.put("/:userId/notifications/:id", verifyToken, async (req, res) => {
    try {
        const user = req.user
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isReadead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});







module.exports = router