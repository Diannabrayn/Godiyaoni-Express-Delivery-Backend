"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeliveryRequest = exports.validateMyRestaurantrequest = exports.validateMyUserRequest = exports.validateLoginRequest = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validateLoginRequest = [
    (0, express_validator_1.body)("email").isString().notEmpty().withMessage("Email"),
    (0, express_validator_1.body)("password").isString().notEmpty().withMessage("password"),
];
exports.validateMyUserRequest = [
    (0, express_validator_1.body)("name").isString().notEmpty().withMessage("enter your name"),
    (0, express_validator_1.body)("addressLine1").isString().notEmpty().withMessage("enter your address"),
    (0, express_validator_1.body)("city").isString().notEmpty().withMessage("enter your city"),
    (0, express_validator_1.body)("country").isString().notEmpty().withMessage("enter your country"),
    handleValidationErrors,
];
exports.validateMyRestaurantrequest = [
    (0, express_validator_1.body)("restaurantName").notEmpty().withMessage("restaurant name is required!"),
    (0, express_validator_1.body)("city").notEmpty().withMessage("city name is required!"),
    (0, express_validator_1.body)("country").notEmpty().withMessage("country is required!"),
    (0, express_validator_1.body)("deliveryPrice")
        .toFloat()
        .isFloat({ min: 0 })
        .withMessage("delivery price is must be positive number!"),
    (0, express_validator_1.body)("estimatedDeliveryTime")
        .toInt()
        .isInt({ min: 1 })
        .withMessage("estimated Delivery Time must be an integer!"),
    (0, express_validator_1.body)("cuisines")
        .isArray({ min: 1 })
        .withMessage("cuisines must be an Array!")
        .not()
        .isEmpty()
        .withMessage("sorry! cuisines cannot be empty"),
    (0, express_validator_1.body)("menuItem")
        .isArray({ min: 1 })
        .withMessage("sorry menu items cannot be empty!"),
    (0, express_validator_1.body)("menuItem.*.name")
        .notEmpty()
        .withMessage("Each menu item must have a name!"),
    (0, express_validator_1.body)("menuItem.*.price")
        .isFloat({ min: 0 })
        .withMessage("Each menu item price must be a positive number!"),
    handleValidationErrors,
];
exports.validateDeliveryRequest = [
    // Sender validations
    (0, express_validator_1.body)("sender.name")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Sender name is required"),
    (0, express_validator_1.body)("sender.phone")
        .isNumeric()
        .withMessage("Sender phone is required")
        .isLength({ min: 11 }),
    // Receiver validations
    (0, express_validator_1.body)("receiver.name")
        .isString()
        .trim()
        .isLength({ min: 3 })
        .withMessage("Receiver name is required"),
    (0, express_validator_1.body)("receiver.phone")
        .isNumeric()
        .isLength({ min: 11 })
        .withMessage("Receiver phone is required"),
    // Package validations
    (0, express_validator_1.body)("package.description")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Package description must be at least 3 characters"),
    (0, express_validator_1.body)("package.weight")
        .notEmpty()
        .withMessage("Package weight is required")
        .isFloat({ min: 0.1 }),
    (0, express_validator_1.body)("package.value")
        .notEmpty()
        .withMessage("Package value is required")
        .isFloat({ min: 0 }),
    // Delivery type
    (0, express_validator_1.body)("deliveryType")
        .isIn(["standard", "express", "same-day"])
        .withMessage("Delivery type must be one of: standard, express, same-day"),
    // Addresses
    (0, express_validator_1.body)("pickupAddress")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Pickup address must be at least 3 characters"),
    (0, express_validator_1.body)("dropoffAddress")
        .isString()
        .isLength({ min: 3 })
        .withMessage("Dropoff address must be at least 3 characters"),
    // Optionally validate imageUrl if passed
    (0, express_validator_1.body)("imageUrl")
        .optional()
        .isString()
        .withMessage("Image URL must be a string"),
    handleValidationErrors,
];
//# sourceMappingURL=validation.js.map