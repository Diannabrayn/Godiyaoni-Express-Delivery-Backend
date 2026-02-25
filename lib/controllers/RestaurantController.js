"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRestaurants = exports.getRestaurant = void 0;
const firebase_admin_1 = require("firebase-admin");
const db = (0, firebase_admin_1.firestore)();
const getRestaurant = async (req, res) => {
    try {
        const firebaseId = req.params.firebaseId;
        if (!firebaseId) {
            res.status(400).json({ message: "firebaseId is required" });
            return;
        }
        const snapshot = await db
            .collection("restaurant")
            .where("firebaseId", "==", firebaseId)
            .limit(1)
            .get();
        if (snapshot.empty) {
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        // ✅ No need to fetch from subcollection
        res.status(200).json(Object.assign(Object.assign({}, data), { id: doc.id }));
        return;
    }
    catch (error) {
        console.error("Get restaurant failed:", error);
        res.status(500).json({ message: "Something went wrong" });
        return;
    }
};
exports.getRestaurant = getRestaurant;
const searchRestaurants = async (req, res) => {
    try {
        const city = (req.params.city || "").trim().toLowerCase();
        const searchQuery = (req.query.searchQuery || "")
            .trim()
            .toLowerCase();
        const selectedCuisines = (req.query.selectedCuisines || "")
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
        const sortOption = req.query.sortOption || "lastUpdated";
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        if (!city) {
            res.status(400).json({ message: "City parameter is required" });
            return;
        }
        // Allowed sort options
        const allowedSortOptions = ["lastUpdated", "restaurantName", "rating"];
        const sortField = allowedSortOptions.includes(sortOption)
            ? sortOption
            : "lastUpdated";
        let query = db
            .collection("restaurant")
            .where("cityLower", "==", city); // <-- use cityLower field for case-insensitive search
        // Filter by cuisines
        if (selectedCuisines.length > 0) {
            query = query.where("cuisines", "array-contains-any", selectedCuisines);
        }
        // Filter by restaurant name
        if (searchQuery) {
            query = query
                .where("restaurantNameLower", ">=", searchQuery)
                .where("restaurantNameLower", "<=", searchQuery + "\uf8ff");
        }
        // Sorting
        query = query.orderBy(sortField, "asc");
        // Count total results
        const countSnap = await query.count().get();
        const total = countSnap.data().count;
        // Pagination
        const offset = (page - 1) * pageSize;
        const restaurantDocs = await query.offset(offset).limit(pageSize).get();
        const restaurants = restaurantDocs.docs.map((doc) => (Object.assign(Object.assign({}, doc.data()), { id: doc.id })));
        res.json({
            data: restaurants,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error("Search restaurants failed:", error);
        res.status(500).json({ message: "Something went wrong!" });
    }
};
exports.searchRestaurants = searchRestaurants;
//# sourceMappingURL=RestaurantController.js.map