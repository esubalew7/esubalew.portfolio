import mongoose from "mongoose";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Ensures local MongoDB is started if it is not already running.
 */
const startLocalMongoDaemon = async () => {
    return new Promise((resolve) => {
        const mongoBin = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
        const userProfile = process.env.USERPROFILE || "C:\\Users\\M  K  T";
        const dataDir = path.join(userProfile, ".mongodb", "data");

        if (!fs.existsSync(dataDir)) {
            try {
                fs.mkdirSync(dataDir, { recursive: true });
            } catch (err) {
                console.warn(`Could not create data directory ${dataDir}:`, err.message);
            }
        }

        if (fs.existsSync(mongoBin)) {
            console.log("🚀 Spawning local mongod daemon process...");
            const child = spawn(mongoBin, [
                "--dbpath", dataDir,
                "--bind_ip", "127.0.0.1",
                "--port", "27017"
            ], {
                detached: true,
                stdio: "ignore"
            });
            child.unref();
            setTimeout(resolve, 2500);
        } else {
            resolve();
        }
    });
};

/**
 * Connect to MongoDB with automatic fallback from Atlas to Local.
 */
const connectDB = async () => {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/portfolio-db";

    // 1. Try Primary MongoDB URI (e.g. Atlas cluster)
    if (primaryUri) {
        try {
            console.log("Connecting to primary MongoDB URI...");
            const conn = await mongoose.connect(primaryUri, {
                serverSelectionTimeoutMS: 4000,
            });
            console.log(`✅ MongoDB Connected to primary: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.warn(`⚠️ Primary MongoDB unavailable (${error.message}).`);
        }
    }

    // 2. Try Fallback Local MongoDB
    console.log(`🔄 Attempting connection to local MongoDB: ${fallbackUri}...`);
    try {
        const conn = await mongoose.connect(fallbackUri, {
            serverSelectionTimeoutMS: 3000,
        });
        console.log(`✅ Connected to local MongoDB fallback: ${conn.connection.host}`);
        return conn;
    } catch (fallbackError) {
        console.log("Local MongoDB not responding, attempting to launch daemon...");
        await startLocalMongoDaemon();

        try {
            const conn = await mongoose.connect(fallbackUri, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log(`✅ Connected to local MongoDB after daemon launch: ${conn.connection.host}`);
            return conn;
        } catch (retryError) {
            console.error(`❌ Failed to connect to any MongoDB instance: ${retryError.message}`);
            throw retryError;
        }
    }
};

export default connectDB;
