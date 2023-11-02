import { create } from "zustand";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { Board, Column, Todos, TypedColumn, Image } from "@/typings";
import { databases, ID, storage } from "@/appwrite";
import uploadImage from "@/lib/uploadImage";

interface BoardState {
  board: Board;
  getBoard: (id: string) => void;
  setBoardState: (board: Board) => void;
  updateTodoInDB: (todo: Todos, columnId: TypedColumn) => void;
  newTaskInput: string;
  newTaskType: TypedColumn;
  image: File | null;

  setNewTaskInput: (input: string) => void;
  setNewTaskType: (columnId: TypedColumn) => void;
  setImage: (image: File | null) => void;

  searchString: string;
  setSearchString: (searchString: string) => void;

  addTask: (id: string, todo: string, columnId: TypedColumn, image?: File | null) => void;
  deleteTask: (taskIndex: number, todo: Todos, id: TypedColumn) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  searchString: "",
  newTaskInput: "",
  newTaskType: "todo",
  image: null,
  setSearchString: (searchString) => set({ searchString }),

  getBoard: async (id) => {
    const board = await getTodosGroupedByColumn(id);
    set({ board });
  },

  setBoardState: (board) => set({ board }),

  deleteTask: async (taskIndex, todo, id) => {
    const newColumns = new Map(get().board.columns);

    newColumns.get(id)?.todos.splice(taskIndex, 1);
    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },

  setNewTaskInput: (input) => set({ newTaskInput: input }),
  setNewTaskType: (columnId) => set({ newTaskType: columnId }),
  setImage: (image) => set({ image }),

  updateTodoInDB: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },

  addTask: async (id: string, todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: Image | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        id: id,
        title: todo,
        status: columnId,
        // ? include the image if it exists
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTaskInput: "" });

    set((state) => {
      const newColumns = new Map(state.board.columns);
      const newTodo: Todos = {
        $id,
        $createdAt: new Date().toISOString(),
        id: id,
        title: todo,
        status: columnId,
        ...(file && { image: file }),
      };

      const column = newColumns.get(columnId);

      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newColumns,
        },
      };
    });
  },
}));
