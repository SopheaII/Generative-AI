import { Request, Response, response } from "express";
import ollama from "ollama";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { AppDataSource } from "../config";
import { Quiz } from "../entity/quiz.entity";
import { UserInfo } from "../entity/user.entity";
import { extractQuizArray } from "../utils/quiz";

export const quiz = async (req: Request, res: Response) => {
  const { topic } = req.body;
  // connect to database
  const generateQuiz = AppDataSource.getRepository(Quiz);
  // use entity like a model
  const userRepo = AppDataSource.getRepository(UserInfo);

  if (!topic) {
    return res.status(400).json({ message: "Topic is required." });
  }

  try {
    const user = await userRepo.findOne({ where: { id: req.user?.id } });
    if (!user) {
      return res.status(404).json({
        message: "user not found",
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

        Now, create a ${topic} quizzes.`;
    const response = await ollamaNoStream([{ role: "user", content: query }]);
    const extracteQuiz = JSON.parse(response.message.content);
    console.log(extracteQuiz);
    const generate = new Quiz();
    for (const item of extracteQuiz) {
      generate.question = item.question;
      generate.options = item.options;
      generate.correctAnswer = item.correctAnswer;
      generate.user = user;
      const Quiz = await generateQuiz.save(generate);

      if(topic){
        res.status(200).json({
          quiz: {
            id: Quiz.id, 
            question: Quiz.question,
            options: Quiz.options,
            correctAnswer: Quiz.correctAnswer,
          },
        });
      }
      }
  } catch (error) {
    console.error(error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
  }
};

export const getAll = async (req: Request, res: Response) => {
  const generateQuiz = AppDataSource.getRepository(Quiz);
  try {
    const quizzes = await generateQuiz.find();
    if (!quizzes) {
      return res.status(404).json({ message: "quiz not fund" });
    }
    res.status(200).json({ message: "get by id success", quizzes });
  } catch (error) {
    console.error(error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
  }
};

export const getById = async (req: Request, res: Response) => {
  const generateQuiz = AppDataSource.getRepository(Quiz);
  try {
    const quizId = await generateQuiz.findOneBy({ id: req.params?.id });
    if (!quizId) {
      return res.status(404).json({ message: "quiz not fund" });
    }
    res.status(200).json({
      message: "get by id success",
      quizId,
    });
  } catch (error) {
    console.error(error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  const generateQuiz = AppDataSource.getRepository(Quiz);
  try {
    const quizUpdate = await generateQuiz.findOneBy({ id: req.params?.id });
    if (!quizUpdate) {
      return res.status(404).json({ message: "quiz not fund" });
    }
    const { question, options, correctAnswer } = req.body;
    quizUpdate.question = question;
    quizUpdate.options = options;
    quizUpdate.correctAnswer = correctAnswer;
    await generateQuiz.save(quizUpdate);
    res.status(200).json({
      message: "update quiz success",
      quizUpdate,
    });
  } catch (error) {
    console.error(error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  const generateQuiz = AppDataSource.getRepository(Quiz);
  try {
    const deleteQuiz = await generateQuiz.findOneBy({ id: req.params?.id });

    if (!deleteQuiz) {
      return res.status(404).json({ message: "quiz not fund" });
    }
    await generateQuiz.remove(deleteQuiz);
    res.status(200).json({
      message: "delete quiz success",
      deleteQuiz,
    });
  } catch (error) {
    console.error(error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
  }
};
