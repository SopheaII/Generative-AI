import { Request, Response } from "express";
import { Roadmap } from "../entity/roadmap.entity";
import { AppDataSource } from "../config";
import { UserInfo } from "../entity/user.entity";
import { Milestone } from "../entity/milestone.entity";
// import { Ollama} from "ollama";
import { extractArrayRoadmap } from "../utils/extractTransaction";
import {ollamaNoStream,ollamaStream} from "../service/ollamaChat";
export const generateRoadmap = async (req: Request, res: Response) => {
  const roadmapRepo = AppDataSource.getRepository(Roadmap);
  const milestoneRepo = AppDataSource.getRepository(Milestone);


  const { title } = req.body;
  if(!title){
    return res.status(400).json({message:"title is required"})
  }
  try {
  const query=`you are a helpful sofware development assistant. I want you to create a learning roadmap in the form of an array of objects. Each object should contain two properties: 
        

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

        Now, create a ${title} roadmap.
`


  const response=await ollamaNoStream([{role: 'user', content: query}])
  console.log(response.message.content)
  const extra=extractArrayRoadmap(response.message.content);

    const usre = req.user as UserInfo;
    const roadmap = new Roadmap();
    roadmap.title = title,
    roadmap.user = usre
    const master = await roadmapRepo.save(roadmap);
    console.log(master)
    for (const milestone of extra?extra:roadmap.milestones) {
      const newMilestone = new Milestone();
      newMilestone.title = milestone.title;
      newMilestone.description = milestone.description;
      newMilestone.roadmap = master;
      await milestoneRepo.save(newMilestone);
      console.log(milestone);

    }

    return res.status(200).json({
      message: "create roadmap successful and milestones",roadmapId:roadmap.id,
      title,
      milestones:extra?extra:roadmap.milestones
    })


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" })
  }


}
export const getRoadmaps = async (req: Request, res: Response) => {
  const roadmapRepo = AppDataSource.getRepository(Roadmap);
  try {
    // const roadmap = await roadmapRepo.find();
    const roadmap = await roadmapRepo.find({
      relations: ["milestones"],
    });
    return res.status(200).json(roadmap);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }

}


export const getRoadmap = async (req: Request, res: Response) => {

  const roadmapRepo = AppDataSource.getRepository(Roadmap);
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(404).json({ message: "Roadmap not found" })
    }
    // const roadmap = await roadmapRepo.find();
    const roadmap = await roadmapRepo.findOne({
      where: { id },
      relations: ["milestones"],
      select: {
        milestones: {
          id: true, title: true, description: true
        }, id: true,
        title: true

      }
    });
    return res.status(200).json({message:"Roadmap unique",roadmap});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }

}


export const deleteRoadmap = async (req: Request, res: Response) => {

  const roadmapRepo = AppDataSource.getRepository(Roadmap);
  const id = req.params.id;
  try {
    // const roadmap = await roadmapRepo.find();
    const roadmap = await roadmapRepo.delete({
      id: id
    });
    return res.status(200).json({ message: "delete successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }

}







