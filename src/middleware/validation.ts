import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateLoginRequest = [
  body("email").isString().notEmpty().withMessage("Email"),
  body("password").isString().notEmpty().withMessage("password"),
];

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("enter your name"),
  body("addressLine1").isString().notEmpty().withMessage("enter your address"),
  body("city").isString().notEmpty().withMessage("enter your city"),
  body("country").isString().notEmpty().withMessage("enter your country"),
  handleValidationErrors,
];

export const validateMyRestaurantrequest = [
  body("restaurantName").notEmpty().withMessage("restaurant name is required!"),
  body("city").notEmpty().withMessage("city name is required!"),
  body("country").notEmpty().withMessage("country is required!"),
  body("deliveryPrice")
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage("delivery price is must be positive number!"),
  body("estimatedDeliveryTime")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("estimated Delivery Time must be an integer!"),
  body("cuisines")
    .isArray({ min: 1 })
    .withMessage("cuisines must be an Array!")
    .not()
    .isEmpty()
    .withMessage("sorry! cuisines cannot be empty"),
  body("menuItem")
    .isArray({ min: 1 })
    .withMessage("sorry menu items cannot be empty!"),
  body("menuItem.*.name")
    .notEmpty()
    .withMessage("Each menu item must have a name!"),
  body("menuItem.*.price")
  .isFloat({min:0})
    .withMessage("Each menu item price must be a positive number!"),
  handleValidationErrors,
];

export const validateDeliveryRequest = [
  // Sender validations
  body("sender.name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Sender name is required"),
  body("sender.phone")
    .isNumeric()
    .withMessage("Sender phone is required")
    .isLength({ min: 11 }),
  // Receiver validations
  body("receiver.name")
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Receiver name is required"),
  body("receiver.phone")
    .isNumeric()
    .isLength({ min: 11 })
    .withMessage("Receiver phone is required"),

  // Package validations
  body("package.description")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Package description must be at least 3 characters"),
  body("package.weight")
    .notEmpty()
    .withMessage("Package weight is required")
    .isFloat({ min: 0.1 }),
  body("package.value")
    .notEmpty()
    .withMessage("Package value is required")
    .isFloat({ min: 0 }),
  // Delivery type
  body("deliveryType")
    .isIn(["standard", "express", "same-day"])
    .withMessage("Delivery type must be one of: standard, express, same-day"),

  // Addresses
  body("pickupAddress")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Pickup address must be at least 3 characters"),
  body("dropoffAddress")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Dropoff address must be at least 3 characters"),
  // Optionally validate imageUrl if passed
  body("imageUrl")
    .optional()
    .isString()
    .withMessage("Image URL must be a string"),

  handleValidationErrors,
];

