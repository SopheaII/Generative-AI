interface RoadmapItem {
    title: string;
    description: string;
  }
  
 export const extractArrayRoadmap = (responseText: string): RoadmapItem[] | null => {
    try {
      // Extract the array using a regular expression
      const match = responseText.match(/\[([\s\S]*)\]/);
      if (!match) {
        console.error("No array found in the response.");
        return null;
      }
  
      // Parse the extracted array into a strongly-typed object
      const arrayText = match[0];
      const parsedArray: RoadmapItem[] = JSON.parse(arrayText);
  
      // Optional: Validate the structure of the parsed array
      if (
        Array.isArray(parsedArray) &&
        parsedArray.every((item) => typeof item.title === "string" && typeof item.description === "string")
      ) {
        return parsedArray;
      } else {
        console.error("Invalid array structure.");
        return null;
      }
    } catch (error) {
      console.error("Failed to parse JSON array:", error);
      return null;
    }
  }


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
  