type TransactionData = {
    apv?: string
    purchase?: string 
    amount?: string
    fromAccount?: string 
    trxId?: string
    seller?: string
    transactionDate?: string
}


export const extractTransactionData = (text: string) => {
    const regex = {
        apv: /APV:\s*(\d+)/,
        purchase: /Purchase #:\s*(\d+)/,
        amount: /Original amount:\s*([\d.]+)\s*USD/,
        fromAccount: /From account:\s*([\w]+)/,
        trxId: /Trx\. ID:\s*(\d+)/,
        seller: /Seller:\s*([A-Za-z0-9\s.]+)/,
        transactionDate: /Transaction date:\s*([A-Za-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [APM]+)/
    };

    const result: any = {};
    
    for (const [key, pattern] of Object.entries(regex)) {
        const match = text.match(pattern);
        result[key] = match ? match[1] : null;
    }

    return result as TransactionData;
}

interface RoadmapItem {
    title: string;
    description: string;
  }
  
 export const extractArrayRoadmap = (responseText: string): RoadmapItem[] | null => {
    try {
      const match = responseText.match(/\[([\s\S]*)\]/);
      if (!match) {
        console.error("No array found in the response.");
        return null;
      }
  
      const arrayText = match[0];
      const parsedArray: RoadmapItem[] = JSON.parse(arrayText);
  
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