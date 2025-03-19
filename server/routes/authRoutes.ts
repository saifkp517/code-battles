import express, { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

// Register User
router.post("/register", async (req, res): Promise<void> => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                provider: "credentials",
            },
        });

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login User
router.post("/login", async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/google-oauth", async (req: Request, res: Response): Promise<void> => {
    console.log("called")
    const { name, email } = req.body;

    try {
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: null, // No password for Google users
                    provider: "google",
                },
            });
        }

        res.status(200).json({ message: "Google OAuth user stored successfully", user });
    } catch (error) {
        console.error("Google OAuth error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


export default router;
