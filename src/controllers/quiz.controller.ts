import { Request, Response } from "express";
import { Quiz } from "../entity/quiz.entity";
import { AppDataSource } from "../config";
import { UserInfo } from "../entity/user.entity";
import ollama from 'ollama';
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { extractQuizArray } from "../utils/extractarraytostrings";

// POST: Create a new quiz

export const createQuizGenerator = async (req: Request, res: Response) => {
    const quizRepo = AppDataSource.getRepository(Quiz);
    const userRepo = AppDataSource.getRepository(UserInfo);
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
    }

    const userId = await userRepo.findOne({ where: { id: req.user?.id } });
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    const staticQuizzes = `You are a helpful coding assistant. I want you to create a exercise quizzes in the form of an array of objects. Each object should contain 3 properties: 
        

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

    try {
        const response = await ollamaNoStream([{ role: 'user', content: staticQuizzes }]);

        console.log("Raw AI Response:", response.message.content);

        const milestonequiz = JSON.parse(response.message.content);

        if (!milestonequiz || !Array.isArray(milestonequiz)) {
            return res.status(500).json({ message: "Failed to extract quiz data" });
        }

        console.log("Parsed Quizzes:", milestonequiz);

        for (const quiz of milestonequiz) {
            const newQuiz = new Quiz();
            newQuiz.question = quiz.question;
            newQuiz.options = quiz.options;
            newQuiz.correctAnswer = quiz.correctAnswer;

            await quizRepo.save(newQuiz);
        }

        return res.status(201).json({
            message: "Quizzes created successfully",
            quizzes: milestonequiz
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllQuizzes = async (req: Request, res: Response) => {
    const quizRepo = AppDataSource.getRepository(Quiz);

    try {
        const databaseQuizzes = await quizRepo.find();

        const combinedQuizzes = databaseQuizzes.map(quiz => ({
            id: quiz.id,
            question: quiz.question,
            options: quiz.options,
            correctAnswer: quiz.correctAnswer
        }));

        return res.status(200).json(combinedQuizzes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    const quizRepo = AppDataSource.getRepository(Quiz);
    const quizId = req.params.id;

    console.log("Requested quiz ID:", quizId);

    try {
        const quiz = await quizRepo.findOne({ where: { id: quizId } });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        return res.status(200).json({
            id: quiz.id, 
            question: quiz.question,
            options: quiz.options,
            correctAnswer: quiz.correctAnswer
        });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

