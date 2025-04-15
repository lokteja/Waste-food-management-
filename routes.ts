import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertFoodPickupSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get stats for home page
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Food Pickup API routes
  app.post("/api/food-pickups", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Validate request body with Zod schema
      const validatedData = insertFoodPickupSchema.parse(req.body);
      
      // Create new food pickup
      const foodPickup = await storage.createFoodPickup(validatedData);
      res.status(201).json(foodPickup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create food pickup" });
      }
    }
  });

  app.get("/api/food-pickups", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const foodPickups = await storage.getAllFoodPickups();
      res.json(foodPickups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food pickups" });
    }
  });

  app.get("/api/food-pickups/available", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const foodPickups = await storage.getAvailableFoodPickups();
      res.json(foodPickups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available food pickups" });
    }
  });

  app.get("/api/food-pickups/ngo/:ngoId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const ngoId = parseInt(req.params.ngoId);
      if (isNaN(ngoId)) {
        return res.status(400).json({ message: "Invalid NGO ID" });
      }

      const foodPickups = await storage.getNGOFoodPickups(ngoId);
      res.json(foodPickups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NGO food pickups" });
    }
  });

  app.get("/api/food-pickups/volunteer", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const foodPickups = await storage.getVolunteerFoodPickups(req.user!.id);
      res.json(foodPickups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch volunteer food pickups" });
    }
  });

  app.post("/api/food-pickups/:id/assign", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user!.role !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers can assign pickups" });
    }

    try {
      const pickupId = parseInt(req.params.id);
      if (isNaN(pickupId)) {
        return res.status(400).json({ message: "Invalid pickup ID" });
      }

      const updatedPickup = await storage.assignFoodPickup(pickupId, req.user!.id);
      if (!updatedPickup) {
        return res.status(404).json({ message: "Food pickup not found or already assigned" });
      }

      res.json(updatedPickup);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign food pickup" });
    }
  });

  app.post("/api/food-pickups/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const pickupId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(pickupId)) {
        return res.status(400).json({ message: "Invalid pickup ID" });
      }

      if (!status || !['pending', 'assigned', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const pickup = await storage.getFoodPickup(pickupId);
      
      if (!pickup) {
        return res.status(404).json({ message: "Food pickup not found" });
      }

      // Only allow volunteers assigned to this pickup to update status
      if (req.user!.role === 'volunteer' && pickup.volunteerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this pickup" });
      }

      // Only allow NGOs that created the pickup to update status
      if (req.user!.role === 'ngo') {
        const ngo = await storage.getNGOByUserId(req.user!.id);
        if (!ngo || ngo.id !== pickup.ngoId) {
          return res.status(403).json({ message: "Not authorized to update this pickup" });
        }
      }

      const updatedPickup = await storage.updateFoodPickupStatus(pickupId, status);
      res.json(updatedPickup);
    } catch (error) {
      res.status(500).json({ message: "Failed to update food pickup status" });
    }
  });

  // NGO API routes
  app.get("/api/ngos", async (req, res) => {
    try {
      const ngos = await storage.getAllNGOs();
      res.json(ngos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NGOs" });
    }
  });

  app.get("/api/ngos/:id", async (req, res) => {
    try {
      const ngoId = parseInt(req.params.id);
      if (isNaN(ngoId)) {
        return res.status(400).json({ message: "Invalid NGO ID" });
      }

      const ngo = await storage.getNGO(ngoId);
      if (!ngo) {
        return res.status(404).json({ message: "NGO not found" });
      }

      res.json(ngo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch NGO" });
    }
  });
  
  // Admin routes
  app.post("/api/admin/approve-ngo/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Only admins can approve NGOs" });
    }

    try {
      const ngoId = parseInt(req.params.id);
      if (isNaN(ngoId)) {
        return res.status(400).json({ message: "Invalid NGO ID" });
      }

      const updatedNGO = await storage.approveNGO(ngoId);
      if (!updatedNGO) {
        return res.status(404).json({ message: "NGO not found" });
      }

      res.json(updatedNGO);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve NGO" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
