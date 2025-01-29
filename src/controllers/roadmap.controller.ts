import { Request, Response } from "express";
import ollama from "ollama";
import { AppDataSource } from "../config";
import { Roadmap } from "../entity/roadmap.entity";
import { UserInfo } from "../entity/user.entity";
import { Milestone } from "../entity/milestone.entity";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { extractArrayRoadmap } from "../utils/roadmap";

export const roadMap = async (req: Request, res: Response) => {
  const { title } = req.body;
  const roadMap = AppDataSource.getRepository(Roadmap);
  const userRepo = AppDataSource.getRepository(UserInfo);
  const milestoneRepo = AppDataSource.getRepository(Milestone);
  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  try {
    const query = `You are a helpful sofware development assistant. I want you to create a learning roadmap in the form of an array of objects. Each object should contain two properties: 
        
'title': A milestone or step in the roadmap.
'description': A detail (50 words) description of that step.

        Your response only be in this format without any other text outside of array
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

        Now, create a ${title} roadmap.`;

    const user = await userRepo.findOne({ where: { id: req.user?.id } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const response = await ollamaNoStream([{ role: "user", content: query }]);
    console.log(response.message.content);

    const milestones = extractArrayRoadmap(response.message.content);

    const roadData = new Roadmap();
    roadData.user = user;
    roadData.title = title;
    await roadMap.save(roadData);

    const milestoneResponse = []

    for (const item of milestones ? milestones : roadData.milestones) {
      const mile = new Milestone();
      // console.log(mile.id)
      mile.title = item.title;
      mile.description = item.description;
      await milestoneRepo.save(mile);
      milestoneResponse.push({milestoneId: mile.id, title: mile.title, description: mile.description})
    }

    return res.status(200).json({
      response: {
        message: "Roadmap created successfully",
        roadmapId: roadData.id,
        title,
        milestones: milestoneResponse
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRoadMap = async (req: Request, res: Response) => {
  const roadMapRepo = AppDataSource.getRepository(Roadmap);
  try {
    const roadmap = await roadMapRepo.find({
      relations: {
        milestones: true,
      },
      select: {
        milestones: {
          id: true,
          title: true,
          description: true,
        },
        id: true,
        title: true,
      },
    });

    return res.status(201).json(roadmap);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRoadMapById = async (req: Request, res: Response) => {
  const roadMapRepo = AppDataSource.getRepository(Roadmap);
  const roadmapId = req.params.id;

  try {
    const roadmap = await roadMapRepo.findOne({
      where: { id: roadmapId },
      relations: {
        milestones: true,
      },
      select: {
        milestones: {
          id: true,
          title: true,
          description: true,
        },
        id: true,
        title: true,
      },
    });
    console.log(roadmap);
    if (!roadmap) {
      return res.status(400).json({ message: "Roadmap not found" });
    }
    return res.status(201).json(roadmap);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteRoadMapById = async (req: Request, res: Response) => {
  const roadMapRepo = AppDataSource.getRepository(Roadmap);
  const roadmapId = req.params.id;

  try {
    const roadmap = await roadMapRepo.findOneBy({ id: roadmapId });
    await roadMapRepo.delete({ id: roadmapId });

    if (!roadmap) {
      return res.status(400).json({ message: "Roadmap not found" });
    }
    return res.status(200).json({ message: "Roadmap deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const updateRoadMapById = async (req: Request, res: Response) => {
//   const roadMap = AppDataSource.getRepository(Roadmap);
//   const roadmapId = req.params.id;
//   const roadmapData = req.body;
//   try {
//     const roadmap = await roadMap.update({ id: roadmapId }, roadmapData);
//     if (!roadmap || !roadmapId || !roadmapData) {
//       return res.status(400).json({ message: "Roadmap not found" });
//     }
//     return res.status(200).json({ message: "Roadmap updated successfully" });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
