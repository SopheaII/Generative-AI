interface QuizItem {
    question: string;
    options: string[];
    correctAnswer: string;
  }
  
  export const extractQuizArray = (responseText: string): QuizItem[] | null => {
    try {
      // Extract JSON array using a regular expression
      const match = responseText.match(/\[([\s\S]*)\]/);
      if (!match) {
        console.error("No array found in the response.");
        return null;
      }
  
      // Parse the extracted array into a strongly-typed object
      const arrayText = match[0];
      const parsedArray: QuizItem[] = JSON.parse(arrayText);
  
      // Validate the structure of the parsed array
      if (
        Array.isArray(parsedArray) &&
        parsedArray.every(
          (item) =>
            typeof item.question === "string" &&
            Array.isArray(item.options) &&
            item.options.length === 5 &&
            typeof item.correctAnswer === "string"
        )
      ) {
        return parsedArray;
      } else {
        console.error("Invalid quiz array structure.");
        return null;
      }
    } catch (error) {
      console.error("Failed to parse quiz JSON array:", error);
      return null;
    }
  };