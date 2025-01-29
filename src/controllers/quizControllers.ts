import { Request, Response } from "express";
import { Ollama } from "ollama";
import { ollamaNoStream } from "../service/ollamaChat";
import { AppDataSource } from "../config";
import { Quiz } from "../entity/quiz.entity";
import { UserInfo } from "../entity/user.entity";
import { extractQuizArray } from "../utils/quizEnchement";

export const quiz = async (req: Request, res: Response) => {
  const { topic } = req.body;
  const generateQuiz = AppDataSource.getRepository(Quiz);
  const userRepo = AppDataSource.getRepository(UserInfo);

  if (!topic) {
    return res.status(400).json({ message: "Topic is required." });
  }

  try {
    const user = await userRepo.findOne({ where: { id: req.params?.id } });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    const query = `You are a helpful coding assistant. I want you to create a exercise quizzes in the form of an array of objects. Each object should contain 3 properties: 
        
'question': the question base on topic of user input.
'options': 5 options, 4 incorrect answer and for correct answer.
'correctAnswer': the correction answer.

        Your response only be in this format without any other text outside of array:
        [
        {
            "question": "question 1",
            "options": ["option 1", "option 2", "option 3", "option 4", "option 5"] 
            "correctAnswer": "correct option"
        },
        ]

        Now, create a ${topic} quizzes.`

    const response = await ollamaNoStream([{ role: 'user', content: query }]);
    const extractQuiz = JSON.parse(response.message.content);
    console.log(extractQuiz)


    for (const items of extractQuiz) {
      const generate = new Quiz();
      generate.question = items.question;
      generate.options = items.options;
      generate.correctAnswer = items.correctAnswer;
      generate.user = user;
      await generateQuiz.save(generate);
    }


    if (topic) {
      return res.status(200).json({
        response: {
          quiz: extractQuiz
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
};
// getall
export const getAllQuiz = async (_req: Request, res: Response) => {
  const repoQuizz = AppDataSource.getRepository(Quiz);
  try {
    const quiz = await repoQuizz.find();
    return res.status(201).json({
      quiz
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// getbyid
export const getByID = async (_req: Request, res: Response) => {
  const repoQuiz = AppDataSource.getRepository(Quiz);
  try {
    const quiz = await repoQuiz.findOne({ where: { id: _req.params.id } });
    return res.status(201).json({ quiz });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

//  delete
export const deleteQuiz = async (_req: Request, res: Response) => {
  const repoQuiz = AppDataSource.getRepository(Quiz);
  const deleteByID = _req.params.id;
  try {
    const deleteID = await repoQuiz.findOneBy({ id: deleteByID });
    await repoQuiz.delete({ id: deleteByID })
    if (!deleteID) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    return res.status(200).json({ message: "Quiz deleted success" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}








