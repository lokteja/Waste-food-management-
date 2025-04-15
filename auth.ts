import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { createId } from "@paralleldrive/cuid2";
import { storage } from "./storage";
import { User, RegisterUserData } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

// Setup email transporter - for development we'll log to console
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

// Fallback to console in development
if (process.env.NODE_ENV !== "production") {
  transporter.verify((error) => {
    if (error) {
      console.log("Email server not configured, emails will be logged to console");
      transporter.sendMail = async (mailOptions) => {
        console.log("----------- EMAIL -----------");
        console.log(`From: ${mailOptions.from}`);
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(mailOptions.text || mailOptions.html);
        console.log("-----------------------------");
        return { messageId: createId() };
      };
    }
  });
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

export async function sendVerificationEmail(user: User, baseUrl: string): Promise<void> {
  const token = createId();
  await storage.updateUser(user.id, { verificationToken: token });
  
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"FoodShare" <no-reply@foodshare.org>',
    to: user.email,
    subject: "Verify your FoodShare account",
    html: `
      <h1>Welcome to FoodShare!</h1>
      <p>Thank you for registering. Please click the link below to verify your account:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(user: User, baseUrl: string): Promise<void> {
  const token = createId();
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour
  
  await storage.updateUser(user.id, { 
    resetToken: token,
    resetTokenExpiry
  });
  
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"FoodShare" <no-reply@foodshare.org>',
    to: user.email,
    subject: "Reset your FoodShare password",
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
    `,
  });
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "this-should-be-a-secret-in-production";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          if (!user.isVerified) {
            return done(null, false, { message: "Please verify your email before logging in" });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { confirmPassword, ...userData } = req.body as RegisterUserData;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create new user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // If user is an NGO, create NGO record
      if (userData.role === "ngo" && req.body.organizationName) {
        await storage.createNGO({
          userId: user.id,
          organizationName: req.body.organizationName,
          description: req.body.description || "",
          website: req.body.website || "",
        });
      }

      // Send verification email
      const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
      await sendVerificationEmail(user, baseUrl);

      res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/verify-email", async (req, res, next) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid token" });
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      await storage.updateUser(user.id, {
        isVerified: true,
        verificationToken: null,
      });

      res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal whether a user is registered
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
      }

      const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
      await sendPasswordResetEmail(user, baseUrl);

      res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}
