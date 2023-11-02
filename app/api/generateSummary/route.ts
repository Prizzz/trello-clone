import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { todos, name } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.8,
    n: 1,
    stream: false,
    messages: [
      {
        role: "system",
        content: `When responding, welcome the user always as ${name} and say welcome to the Trello Todo App! Limit the response to 200 characters`,
      },
      {
        role: "user",
        content: `Hi there, provide a summary of the following todos. Count how many todos are in each category such as To do, in progress and done, then tell the user to have a productive day! Here's the data; ${JSON.stringify(
          todos
        )}`,
      },
    ],
  });

  return NextResponse.json(response.choices[0].message);
}
