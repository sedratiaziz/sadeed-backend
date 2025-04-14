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
        const allOperationals = await User.find({ role: "engineer" }).populate([
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

        const conceptAttachedToUser = await Concept.find({ owner: user._id }).populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ])
        res.json(conceptAttachedToUser)

    }
    catch (err) {
        res.status(500).json({ err: err.message })
    }
})

//create a concept
router.post("/", verifyToken, async (req, res) => {

    const io = req.app.get("io"); //extra
    const onlineUsers = req.app.get("onlineUsers"); //exrea

    try {
        const user = req.user
        const { selectedManagers = [], selectedOperational = [], title, description } = req.body;

        if (user.role !== "engineer") {
            return res.status(400).json({ err: "You are not an engineer, you cannot create a concept!" })
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


        // Notify managers in batch
        const managerNotifications = selectedManagers.map(id => ({
            user: id,
            message: `You have been assigned to a new concept titled "${title}".`,
            conceptId: createdConcept._id,
        }));

        // Notify operational staff in batch
        const operationalNotifications = selectedOperational.map(id => ({
            user: id,
            message: `You have been assigned to a new concept titled "${title}".`,
            conceptId: createdConcept._id,
        }));

        const allNotifications = await Notification.insertMany([...managerNotifications, ...operationalNotifications]);

        //extra
        allNotifications.forEach((notification) => {
            const managerId = notification.user.toString();
            const socketId = onlineUsers.get(managerId);

            if (socketId) {
                io.to(socketId).emit("new-notification", notification);
            }
        });
        //end of the extra

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

        const fetchedConcept = await Concept.findById(req.params.id).populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ])

        if (fetchedConcept.owner._id.toString() !== user._id) {
            return res.status(403).json({ message: "Forbidden: You are not the owner of this concept" });
        }

        res.status(200).json(fetchedConcept)


    } catch (err) {
        res.status(500).json({ err: err.message })
    }

})

//update the fetched concpt
router.put("/:userId/concept/:id", verifyToken, async (req, res) => {

    const io = req.app.get("io"); //extra
    const onlineUsers = req.app.get("onlineUsers"); //exrea


    try {
        const user = req.user
        const { selectedManagers = [], selectedOperational = [], title, description } = req.body;

        const fetchedConcept = await Concept.findById(req.params.id).populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ])

        if (!fetchedConcept) {
            return res.status(404).json({ err: "Concept not found" });
        }

        if (fetchedConcept.owner._id.toString() !== user._id) {
            return res.status(403).json({ err: "Cannot edit concept that you didn't make" })
        }

        const selectedManagersFullObj = await Promise.all(selectedManagers.map(async (e) => {
            const obj = await User.findOne({ _id: e })
            return obj
        }))

        const selectedOperationalFullObj = await Promise.all(selectedOperational.map(async (e) => {
            const obj = await User.findOne({ _id: e })
            return obj
        }))

        for (const manager of selectedManagersFullObj) {
            if (manager.role !== "manager") {
                return res.status(400).json({ err: "One or more of the managers do not have the role 'manager'!" })
            }
        }

        for (const operational of selectedOperationalFullObj) {
            if (operational.role !== "operational") {
                return res.status(400).json({ err: "One or more of the operational staff do not have the role 'operational'!" })
            }
        }

        //for notification
        //old managers and operational from fetched concept
        const oldManagerIds = fetchedConcept.selectedManagers.map(e => e._id.toString())
        const oldOperationalIds = fetchedConcept.selectedOperational.map(e => e._id.toString())

        //all managers and operational from the req.body. i.e. old + new
        const newManagerIds = selectedManagers.map(id => id.toString())
        const newOperationalIds = selectedOperational.map(id => id.toString())

        //newly added, so the be notifited alone
        const newlyAddedManagers = newManagerIds.filter(id => !oldManagerIds.includes(id))
        const newlyAddedOperational = newOperationalIds.filter(id => !oldOperationalIds.includes(id))

        //update the concept
        const updatedConcept = await Concept.findByIdAndUpdate(req.params.id, {
            selectedManagers: selectedManagers,
            selectedOperational: selectedOperational,
            title,
            description
        }, { new: true }).populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ]);

        const newlyAddedManagersNotifications = newlyAddedManagers.map(id => ({
            user: id,
            message: `You have been newly assigned as Manager to the updated concept titled "${title || fetchedConcept.title}".`,
            conceptId: updatedConcept._id,
        }))

        const newlyAddedOperationalNotifications = newlyAddedOperational.map(id => ({
            user: id,
            message: `You have been newly assigned to the updated concept titled "${title || fetchedConcept.title}".`,
            conceptId: updatedConcept._id,
        }))

        const allNotifications = [...newlyAddedManagersNotifications, ...newlyAddedOperationalNotifications];

        if (allNotifications.length > 0) {
            await Notification.insertMany(allNotifications);
        }

        //extra
        allNotifications.forEach((notification) => {
            const managerId = notification.user.toString();
            const socketId = onlineUsers.get(managerId);

            if (socketId) {
                io.to(socketId).emit("new-notification", notification);
            }
        });
        //end of the extra

        res.status(200).json(updatedConcept)

    } catch (err) {
        res.status(500).json({ err: err.message })
    }
})

//delete the concept
router.delete("/:userId/concept/:id", verifyToken, async (req, res) => {
    try {
        const user = req.user
        const fetchedConcept = await Concept.findById(req.params.id).populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ])

        if (!fetchedConcept) {
            return res.status(404).json({ err: "Concept not found" });
        }

        if (fetchedConcept.owner._id.toString() !== user._id) {
            return res.status(403).json({ err: "Cannot edit concept that you didn't make" })
        }

        if (fetchedConcept.selectedManagers.length != fetchedConcept.aprovalCount.length) {
            return res.status(409).json({ err: "Cannot delete concept that not all selected managrs have voted on!" })
        }
        if (fetchedConcept.isAproved) {
            return res.status(409).json({ err: "Cannot delete concept that has been aproved!" })
        }

        await Concept.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: "Concept deleted successfully" })



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

// PUT /manager/managerId/concept/:id/vote
router.put("/manager/:managerId/concept/:id/vote", verifyToken, async (req, res) => {

    const io = req.app.get("io"); //extra
    const onlineUsers = req.app.get("onlineUsers"); //exrea

    try {
        const user = req.user;
        const { vote } = req.body; // vote: true or false

        const concept = await Concept.findById(req.params.id).populate([
            { path: "owner", select: "username role" },
            { path: "selectedManagers", select: "username role" },
            { path: "selectedOperational", select: "username role" }

        ]);
        //populate to get owner id to notify him about voting result

        if (!concept) return res.status(404).json({ err: "Concept not found" });

        // Check if user is a selectedManager
        const isManager = concept.selectedManagers.some(e => e._id.equals(user._id));
        if (!isManager) return res.status(403).json({ err: "Only assigned managers can vote" });

        // Remove previous vote if exists
        concept.aprovalCount = concept.aprovalCount.filter(v => !v.manager.equals(user._id));

        // Add new vote
        concept.aprovalCount.push({ manager: user._id, vote });

        // Count votes
        const totalManagers = concept.selectedManagers.length;
        const yesVotes = concept.aprovalCount.filter(v => v.vote).length;

        const approvalRate = (yesVotes / totalManagers)

        if (concept.aprovalCount.length == concept.selectedManagers.length) {
            if (approvalRate >= (2 / 3)) {
                concept.isAproved = true;
            }

            //create the notification
            const approvalMessage = concept.isAproved
                ? `Your concept "${concept.title}" has been approved.`
                : `Your concept "${concept.title}" has not been approved.`;
            const engineerNotification = await Notification.create(
                {
                    user: concept.owner._id,
                    message: approvalMessage
                }
            )

            //notify
            engineerId = engineerNotification.user.toString()
            const socketId = onlineUsers.get(engineerId)

            if (socketId) {
                io.to(socketId).emit("new-notification", notification);
            }

        }

        await concept.save();


        res.json({ concept: concept, isAproved: concept.isAproved });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});








module.exports = router