const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")



const Concept = require("../models/Concept");
const User = require("../models/User");
const Notification = require("../models/notification");


//get all manager
router.get("/managers", verifyToken, async (req, res) => {
    try {
        const allManagers = await User.find({ role: "manager" }).populate([
            "projects",
        ])

        const allManagersToSend = allManagers.map((e) => {
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

//get all operationals
router.get("/operationals", verifyToken, async (req, res) => {
    try {
        const allOperationals = await User.find({ role: "operational" }).populate([
            "projects",
        ])

        const allOperationalsToSend = allOperationals.map((e) => {
            const operationalsAsObj = e.toObject()
            delete operationalsAsObj.hashedPassword
            return operationalsAsObj
        })

        res.json(allOperationalsToSend)
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

        if (user.role !== "admin") {
            return res.status(400).json({ err: "You are not an admin, you cannot create a concept!" })
        }

        const selectedManagersFullObj = await Promise.all(selectedManagers.map(async (e) => {
            const obj = await User.findOne({ _id: e })
            if (!obj || obj.role !== "manager") throw new Error(`User with ID ${e} not found, or not a manager`)
                return obj
        }))

        const selectedOperationalFullObj = await Promise.all(selectedOperational.map(async (e) => {
            const obj = await User.findOne({ _id: e })
            if (!obj || obj.role !== "operational") throw new Error(`User with ID ${e} not found, or not an operational`)
                return obj
        }))



        for (const manager of selectedManagersFullObj) {
            if (manager.role !== "manager") {
                console.log(typeof (manager))
                console.log(manager.role)
                return res.status(400).json({ err: "One or more of the managers do not have the role 'manager'!" })
            }
        }


        for (const operational of selectedOperationalFullObj) {
            if (operational.role !== "operational") {
                return res.status(400).json({ err: "One or more of the operational staff do not have the role 'operational'!" })
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

        // Trigger notifications to selected operational
        for (let operationalId of selectedOperational) {
            const operational = await User.findById(operationalId);
            await Notification.create({
                user: operational._id,
                message: `You have been assigned to a new concept titled "${title}".`,
            });
        }

        res.json(createdConcept)
    }
    catch (err) {
        res.status(500).json({ err: err.message })
    }
})


//get a concept by its id
router.get("/:userId/concept/:id", verifyToken, async (req, res) => {
    try {
        const user = req.user

        const fetchedConcept = await Concept.findById(req.params.id)
        res.status(200).json(fetchedConcept)


    } catch (err) {
        res.status(500).json({ err: err.message })
    }

})

//update the fetched concpt
router.put("/:userId/concept/:id", verifyToken, async (req, res) => {
    try {
        const user = req.user
        const { selectedManagers = [], selectedOperational = [], title, description } = req.body;

        const fetchedConcept = await Concept.findById(req.params.id)
        if (!fetchedConcept) {
            return res.status(404).json({ err: "Concept not found" });
        }

        if (!fetchedConcept.owner.equals(user._id)) {
            return res.status(409).json({ err: "Cannot edit concept that you didn't make" })
        }

        const oldManagerIds = fetchedConcept.selectedManagers.map(id => id.toString())
        const oldOperationalIds = fetchedConcept.selectedOperationals.map(id => id.toString())

        const newManagerIds = selectedManagers.map(id => id.toString())
        const newOperationalIds = selectedOperational.map(id => id.toString())





        const updaredConcept = await Concept.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json(updaredConcept)


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

        // Trigger notifications to selected operational
        for (let operationalId of selectedOperational) {
            const operational = await User.findById(operationalId);
            await Notification.create({
                user: operational._id,
                message: `You have been assigned to a new concept titled "${title}".`,
            });
        }

    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})

//delete the concept
router.delete("/:userId/concept/:id", verifyToken, async (req, res) => {
    try {
        const user = req.user

        const fetchedConcept = await Concept.findById(req.params.id)

        if (!fetchedConcept.owner.equals(user._id)) {
            return res.status(409).json({ err: "Cannot delete concept that you didn't make" })
        }

        if (fetchedConcept.selectedManagers.length != fetchedConcept.aprovalCount.length) {
            return res.status(409).json({ err: "Cannot delete concept that not all selected managrs have voted on!" })
        }
        if (fetchedConcept.isAproved) {
            return res.status(409).json({ err: "Cannot delete concept that has been aproved!" })
        }


    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})


//retrive unread notification
router.get("/:userId/notifications", verifyToken, async (req, res) => {
    try {
        const user = req.user
        // Get unread notifications for the logged-in user
        const notifications = await Notification.find({ user: user._id, isRead: false })

        console.log("here is the notification: ", notifications)
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
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});







module.exports = router