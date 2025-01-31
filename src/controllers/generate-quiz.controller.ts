import { Request, Response } from "express";
import { AppDataSource } from "../config";
import { Roadmap } from "../entity/roadmap.entity";
import { UserInfo } from "../entity/user.entity";
import { Milestone } from "../entity/milestone.entity";

export const quize = async (req: Request, res: Response) => {
    const {topic} = req.body;
    const roadmapRepo = AppDataSource.getRepository(Roadmap);
    const userInfo = AppDataSource.getRepository(UserInfo);
    const milestone = AppDataSource.getRepository(Milestone);
   
    if(!topic){
        return res.status(404).json({
            message: "topic is required"
        })
    }
   try{
    const user = await userInfo.findOne ({where: {id: req.user?.id}});
    if(!user){
        return res.status(404).json({
            message:"User not found"
        })
    }
    if (topic){
        return res.status(200).json(
            {
                "quiz": [
                  {
                      "id": "1", 
                    "question": "What is JavaScript?",
                    "options": ["A programming language", "A database", "A web server", "None of the above"],
                    "correctAnswer": "A programming language"
                  }
                ]
              }
              
        );
    }
    }catch(error){
        console.error(error);
        res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
        res.end();
    }
   } 
   export default quize;