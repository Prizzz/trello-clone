import { Board } from "@/typings";
import { formatTodosForAI } from "./formatTodosForAI";

export const fetchSuggestion = async (board: Board, name: string) => {
  const todos = formatTodosForAI(board);
  // console.log("formated TODOS: ", todos);

  const res = await fetch("/api/generateSummary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todos, name }),
  });

  const GPTdata = await res.json();
  const { content } = GPTdata;

  return content;
};
