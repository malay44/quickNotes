"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const model = groq("llama3-groq-8b-8192-tool-use-preview");

export type GlossaryState = {
  text: string;
  terms: Record<string, string>;
};

export async function identifyKeyTerms(
  prevState: GlossaryState,
  formData: { text: string }
): Promise<GlossaryState> {
  const { text } = formData;
  console.log("text", text);
  try {
    const response = await generateObject({
      model,
      schema: z.object({
        items: z.array(
          z.object({
            term: z.string().describe("The key term"),
            definition: z
              .string()
              .describe("A brief definition of the key term"),
          })
        ),
      }),
      prompt: `Identify the key terms and provide a brief definition for each term in the following text : ${text}`,
    });
    const initialTerms = {} as Record<string, string>;
    const terms = response.object.items.reduce((acc, item) => {
      item.term && item.definition && (acc[item.term] = item.definition);
      return acc;
    }, initialTerms);

    return { text: "", terms };
  } catch (error) {
    console.error("Error identifying key terms", error);
    return { text: "", terms: {} };
  }
}
