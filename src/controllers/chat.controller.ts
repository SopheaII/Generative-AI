import { Request, Response } from "express";
import ollama from 'ollama';
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";

export const askQuery = async (req: Request, res: Response) => {
  const { query, isStream = false } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required." });
  }

  try {
    if(isStream){
        await ollamaStream([{role: 'user', content: query}], res)
    }else {
        const response  = await ollamaNoStream([{role: 'user', content: query}])
        res.status(200).json({ response: response.message.content });
    }
  } catch (error) {
    console.error(error);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
};
