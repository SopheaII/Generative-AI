import { Request, Response } from "express";
import { AppDataSource } from "../config";
import { Roadmap } from "../entity/roadmap.entity";
import { UserInfo } from "../entity/user.entity";
import { Milestone } from "../entity/milestone.entity";
import { extractArrayRoadmap } from "../utils/extractArray";
import { ollamaNoStream } from "../service/ollamaChat";

export const roadmap = async (req: Request, res: Response) => {
    // We got the goal from Postman (client request)
    const { goal } = req.body;
    console.log(goal);
    
    // (roadmapRepo, userInfo, milestone) are repositories that connect to the database tables
    const roadmapRepo = AppDataSource.getRepository(Roadmap);
    const userInfo = AppDataSource.getRepository(UserInfo);
    const milestoneRepo = AppDataSource.getRepository(Milestone);

    // If goal is missing, return a 404 error with a message
    if (!goal) {
        return res.status(404).json({
            message: "Goal is required"
        });
    }

    try {
        // Find the user by their ID to know who is making this request
        const user = await userInfo.findOne({ where: { id: req.user?.id } });
        
        // If user not found, return an error response
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        // Create a new roadmap instance (object) for this goal
        const newRoadmap = new Roadmap();
        newRoadmap.user = user; // Associate roadmap with user
        newRoadmap.title = goal; // Set the title of the roadmap
        await roadmapRepo.save(newRoadmap); // Save the new roadmap to the databasez

        // AI-generated milestones
        const query = `
            You are a helpful software development assistant. I want you to create a learning roadmap in the form of an array of objects. Each object should contain two properties: 
            'title': A milestone or step in the roadmap.
            'description': A detailed (50-word) description of that step.
            Your response should only be in this format without any extra text outside of the array.
            [
                {
                    "title": "Step 1 Title",
                    "description": "Step 1 Description"
                },
                {
                    "title": "Step 2 Title",
                    "description": "Step 2 Description"
                }
            ]
            Now, create a ${goal} roadmap.
        `;

        // Call AI service to generate milestones based on the goal
        const response = await ollamaNoStream([{ role: 'user', content: query }]);
        const milestoneArray = extractArrayRoadmap(response.message.content) ?? [];

        console.log(milestoneArray);

        const milestones = [];
        for (const item of milestoneArray) {
            const newMilestone = new Milestone();
            newMilestone.roadmap = newRoadmap; // Link milestone to the roadmap
            newMilestone.title = item.title;
            newMilestone.description = item.description;
            await milestoneRepo.save(newMilestone); // Save milestone to the database

            // Formatting milestone object correctly
            milestones.push({
                milestoneId: newMilestone.id.toString(), // Convert ID to string
                title: newMilestone.title,
                description: newMilestone.description
            });
        }
        console.log("::::::::::::", milestones);
        
        // Return success response with roadmap details
        return res.status(200).json({
            roadmapId: newRoadmap.id.toString(), // Convert ID to string
            title: newRoadmap.title,
            milestones: milestones // Send formatted milestones array
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllRoadmap = async (req: Request, res: Response) => {
    const roadmapRepo = AppDataSource.getRepository(Roadmap);

    try {
        // Fetch all roadmaps with their milestones
        const roadmaps = await roadmapRepo.find({
            relations: ["milestones"] // Ensure milestones are included in the response
        });

        return res.status(200).json({
            message: "Roadmaps fetched successfully",
            roadmaps: roadmaps.map(roadmap => ({
                id: roadmap.id,
                title: roadmap.title,
                milestones: roadmap.milestones.map(milestone => ({
                    id: milestone.id,
                    title: milestone.title,
                    description: milestone.description
                }))
            }))
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getRoadmapById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const roadmapRepo = AppDataSource.getRepository(Roadmap);

    try {
        // Find a roadmap by its ID, including milestones
        const roadmap = await roadmapRepo.findOne({
            where: { id: String(id) },
            relations: ["milestones"]
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        return res.status(200).json({
            id: roadmap.id,
            title: roadmap.title,
            milestones: roadmap.milestones.map(milestone => ({
                id: milestone.id,
                title: milestone.title,
                description: milestone.description
            }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteRoadmap = async (req: Request, res: Response) => {
    const { id } = req.params;
    const roadmapRepo = AppDataSource.getRepository(Roadmap);

    try {
        // Find the roadmap by ID
        const roadmap = await roadmapRepo.findOne({ where: { id: String(id) } });
        
        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        // Delete the roadmap
        await roadmapRepo.remove(roadmap);
        return res.status(200).json({ message: "Roadmap deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


