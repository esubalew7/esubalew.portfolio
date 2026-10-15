import Project from "../models/Project.js";
import cloudinary from "../config/cloudinary.js";
import { emitProjectCreated, emitProjectUpdated, emitProjectDeleted } from "../socket/emitters.js";
import { createNotification } from "../services/notificationService.js";

// ===============================
// @desc    Create new project
// @route   POST /api/projects
// @access  Admin
// ===============================
export const createProject = async (req, res) => {
    try {
        const { title, description, category, technologies, image, imagePublicId, liveLink, githubLink, caseStudy } = req.body;

        // VALIDATION
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        const normalizedCategory = category?.toLowerCase().trim() || "mern";

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Project image is required. Upload an image or provide an image URL.",
            });
        }

        // Normalize technologies to array
        const techArray = typeof technologies === "string"
            ? technologies.split(",").map(t => t.trim()).filter(Boolean)
            : (Array.isArray(technologies) ? technologies : []);

        // SAVE TO DATABASE
        const newProject = await Project.create({
            title: title.trim(),
            description: description.trim(),
            category: normalizedCategory,
            technologies: techArray,
            image: image.trim(),
            imagePublicId: imagePublicId || '',
            liveLink: liveLink || '',
            githubLink: githubLink || '',
            caseStudy: caseStudy || undefined,
        });

        await createNotification({
            type: "project",
            title: "New project added",
            description: title,
            message: description,
            relatedId: newProject._id,
            relatedModel: "Project",
        });

        emitProjectCreated(newProject);

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// ===============================
// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
// ===============================
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// ===============================
// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
// ===============================
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// ===============================
// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin
// ===============================
export const updateProject = async (req, res) => {
    try {
        const { title, description, category, technologies, image, imagePublicId, liveLink, githubLink, caseStudy } = req.body;

        // -------------------------------
        // VALIDATION
        // -------------------------------

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required",
            });
        }

        const normalizedCategory = category?.toLowerCase().trim() || "mern";

        // Normalize technologies to array
        const techArray = typeof technologies === "string"
            ? technologies.split(",").map(t => t.trim()).filter(Boolean)
            : (Array.isArray(technologies) ? technologies : []);

        // Find the existing project to preserve its image if no new one is provided
        const existing = await Project.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Use new image if provided, otherwise keep the existing one
        const imageUrl = (image && image.trim()) || existing.image;
        const publicId = imagePublicId !== undefined ? imagePublicId : existing.imagePublicId;

        // -------------------------------
        // UPDATE IN DATABASE
        // -------------------------------
        const updateData = {
            title: title.trim(),
            description: description.trim(),
            category: normalizedCategory,
            technologies: techArray,
            image: imageUrl,
            imagePublicId: publicId,
            liveLink: liveLink !== undefined ? liveLink : existing.liveLink,
            githubLink: githubLink !== undefined ? githubLink : existing.githubLink,
        };

        if (caseStudy !== undefined) {
            updateData.caseStudy = caseStudy;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,          // Return updated document
                runValidators: true, // Run schema validators
            }
        );

        emitProjectUpdated(updatedProject);

        await createNotification({
            type: "project",
            title: "Project updated",
            description: title,
            message: description,
            relatedId: updatedProject._id,
            relatedModel: "Project",
        });

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// ===============================
// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
// ===============================
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // -----------------------------------------------
        // DELETE IMAGE FROM CLOUDINARY (non-blocking)
        // -----------------------------------------------
        if (project.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(project.imagePublicId);
                console.log(`Cloudinary image deleted: ${project.imagePublicId}`);
            } catch (cloudErr) {
                // Log but don't block — always remove from DB
                console.error("Failed to delete Cloudinary image:", cloudErr.message);
            }
        }

        await Project.findByIdAndDelete(req.params.id);

        emitProjectDeleted(req.params.id);

        res.status(200).json({
            success: true,
            message: "Project and associated image deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
