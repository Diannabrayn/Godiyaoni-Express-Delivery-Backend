import { Request, Response, NextFunction } from "express";

export const parseFormDataJson = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const body = req.body as any;

    if (body.cuisines && typeof body.cuisines === "string") {
      body.cuisines = JSON.parse(body.cuisines);
    }

    if (body.menuItem && typeof body.menuItem === "string") {
      body.menuItem = JSON.parse(body.menuItem);
    }

    if (body.restaurantAddress && typeof body.restaurantAddress === "string") {
      body.restaurantAddress = JSON.parse(body.restaurantAddress);
    }

    next();
  } catch {
    res.status(400).json({ message: "Invalid JSON format in form data" });
  }
};