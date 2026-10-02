import mongoose from "mongoose";
const { Mixed } = mongoose.Schema.Types;

const statSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  suffix: { type: String, default: "" },
}, { _id: false });

const ctaSchema = new mongoose.Schema({
  text: { type: String, default: "" },
  link: { type: String, default: "" },
}, { _id: false });

const heroSchema = new mongoose.Schema({
  greeting: { type: String, default: "Hello, I am" },
  name: { type: String, default: "" },
  titles: [{ type: String }],
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  backgroundImage: { type: String, default: "" },
  available: { type: Boolean, default: true },
  cta: {
    primary: { type: ctaSchema, default: () => ({}) },
    secondary: { type: ctaSchema, default: () => ({}) },
  },
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  title: { type: String, default: "About Me" },
  subtitle: { type: String, default: "" },
  description: { type: String, default: "" },
  image: { type: String, default: "" },
  stats: [statSchema],
  cta: { type: ctaSchema, default: () => ({}) },
}, { _id: false });

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 0 },
}, { _id: false });

const skillCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [skillItemSchema],
}, { _id: false });

const skillsSchema = new mongoose.Schema({
  title: { type: String, default: "Core Skills" },
  subtitle: { type: String, default: "" },
  categories: [skillCategorySchema],
}, { _id: false });

const experienceItemSchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  role: { type: String, required: true },
  title: { type: String, default: "" },
  company: { type: String, default: "" },
  duration: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  current: { type: Boolean, default: false },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  skills: [{ type: String }],
  tags: [{ type: String }],
  bullets: [{ type: String }],
  logo: { type: String, default: "" },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { _id: false, strict: false });

const experienceCategorySchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  slug: { type: String, default: "" },
  description: { type: String, default: "" },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  items: [experienceItemSchema],
}, { _id: false, strict: false });

const experienceSchema = new mongoose.Schema({
  title: { type: String, default: "Where I've built\nreal systems." },
  subtitle: { type: String, default: "" },
  eyebrow: { type: String, default: "Career Record" },
  resumeUrl: { type: String, default: "/resume.pdf" },
  resumeText: { type: String, default: "Resume" },
  categories: [experienceCategorySchema],
}, { _id: false, strict: false });

const certificateSchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  issuer: { type: String, default: "" },
  issuerColor: { type: String, default: "#FF4D00" },
  date: { type: String, default: "" },
  image: { type: String, default: "" },
  credentialUrl: { type: String, default: "" },
  url: { type: String, default: "" },
  skills: [{ type: String }],
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { _id: false, strict: false });

const testimonialItemSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous client" },
  role: { type: String, default: "" },
  company: { type: String, default: "" },
  platform: { type: String, default: "Upwork" },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  text: { type: String, default: "" },
  feedback: { type: String, default: "" },
  date: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
  image: { type: String, default: "" },
}, { _id: false, strict: false });

const testimonialsSchema = new mongoose.Schema({
  title: { type: String, default: "Client Feedback" },
  subtitle: { type: String, default: "What clients say about working with me." },
  items: [testimonialItemSchema],
}, { _id: false });

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  title: { type: String, default: "Resume" },
  url: { type: String, default: "" },
  buttonText: { type: String, default: "Download Resume" },
}, { _id: false });

const contactInfoSchema = new mongoose.Schema({
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  formTitle: { type: String, default: "Get in touch" },
  formDescription: { type: String, default: "" },
  formButtonText: { type: String, default: "Send Message" },
  successMessage: { type: String, default: "Thank you! Your message has been sent successfully." },
}, { _id: false });

const seoSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  ogImage: { type: String, default: "" },
  keywords: { type: String, default: "" },
}, { _id: false });

const navItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  id: { type: String, required: true },
}, { _id: false });

const navbarSchema = new mongoose.Schema({
  logo: { type: String, default: "" },
  navItems: [navItemSchema],
}, { _id: false });

const sectionsSchema = new mongoose.Schema({
  hero: { type: Boolean, default: true },
  about: { type: Boolean, default: true },
  skills: { type: Boolean, default: true },
  projects: { type: Boolean, default: true },
  experience: { type: Boolean, default: true },
  testimonials: { type: Boolean, default: true },
  terminal: { type: Boolean, default: false },
  contact: { type: Boolean, default: true },
}, { _id: false });

const footerSocialSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, default: "" },
  enabled: { type: Boolean, default: true },
}, { _id: false });

const footerSchema = new mongoose.Schema({
  copyright: { type: String, default: "All rights reserved." },
  socials: [footerSocialSchema],
}, { _id: false });

const portfolioContentSchema = new mongoose.Schema({
  sections: { type: sectionsSchema, default: () => ({}) },
  navbar: { type: navbarSchema, default: () => ({}) },
  footer: { type: footerSchema, default: () => ({}) },
  hero: { type: heroSchema, default: () => ({}) },
  about: { type: aboutSchema, default: () => ({}) },
  skills: { type: skillsSchema, default: () => ({}) },
  experience: { type: experienceSchema, default: () => ({}) },
  certificates: [certificateSchema],
  testimonials: { type: testimonialsSchema, default: () => ({}) },
  socialLinks: [socialLinkSchema],
  resume: { type: resumeSchema, default: () => ({}) },
  contactInfo: { type: contactInfoSchema, default: () => ({}) },
  seo: { type: seoSchema, default: () => ({}) },
  structuredData: { type: Mixed, default: {} },
}, {
  timestamps: true,
});

const PortfolioContent = mongoose.model("PortfolioContent", portfolioContentSchema);

export default PortfolioContent;
