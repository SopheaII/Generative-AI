import { Request, Response, response } from "express";
import ollama from "ollama";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { AppDataSource } from "../config";
import { Quiz } from "../entity/quiz.entity";
import { UserInfo } from "../entity/user.entity";


export const quiz = async (req: Request, res: Response) => {
    const { keyword } = req.body;
    const generateQuiz = AppDataSource.getRepository(Quiz);
    const userRepo = AppDataSource.getRepository(UserInfo);    
  
    if (!keyword) {
      return res.status(400).json({ message: "keyword is required." });
    }
  
    try {
      const user = await userRepo.findOne({where: {id: req.params?.id}})
      if (!user) {
          return res.status(404).json({
              message:"user not found"
          });
      }
      const generate = new Quiz();
      generate.question = "Saw";
      generate.options = ["25"];
      generate.correctAnswer = "yes";
      generate.user = user;
      await generateQuiz.save(generate);
  
      if (keyword) {
        res.status(200).json({
          response: {
            quiz: [
              {
                id: "1",
                question: "What is JavaScript?",
                options: [
                  "A programming language",
                  "A database",
                  "A web server",
                  "None of the above",
                ],
                correctAnswer: "A programming language",
              },
            ],
          },
        });
      }
    } catch (error) {
      console.error(error);
      res.write(
        `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
      );
      res.end();
    }
  };