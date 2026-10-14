import User from "../models/User.js";
import PortfolioContent from "../models/PortfolioContent.js";
import Project from "../models/Project.js";
import { realContentData, realProjectsData } from "../scripts/seedData.js";

/**
 * Initializes the default admin user and default portfolio content
 * if the database is currently unpopulated.
 */
export const initDefaultAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'esubalew392@gmail.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. Ensure admin user exists
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Esubalew Molla',
        role: 'Administrator',
      });
      console.log(`👤 Initial admin account created: ${adminEmail} (password: ${adminPassword})`);
    } else if (!admin.password) {
      // If user was created via OAuth without a password, set default password
      admin.password = adminPassword;
      await admin.save();
      console.log(`🔑 Set password for existing admin: ${adminEmail}`);
    }

    // 2. Ensure portfolio content exists
    const contentCount = await PortfolioContent.countDocuments();
    if (contentCount === 0) {
      console.log('🌱 Populating initial portfolio content...');
      await PortfolioContent.create(realContentData);
      console.log('✅ Initial PortfolioContent initialized.');
    }

    // 3. Ensure projects exist
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('🌱 Populating initial projects...');
      await Project.insertMany(realProjectsData);
      console.log('✅ Initial Projects initialized.');
    }
  } catch (error) {
    console.error('⚠️ Database initialization warning:', error.message);
  }
};
