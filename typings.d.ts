import { Models } from "appwrite";

type TypedColumn = "todo" | "inprogress" | "done";

interface Image {
  bucketId: string;
  fileId: string;
}

interface Todos {
  $id: string;
  $createdAt: string;
  id: string;
  title: string;
  status: TypedColumn;
  image?: Image;
}

interface Column {
  id: TypedColumn;
  todos: Todos[];
}

interface Board {
  columns: Map<TypedColumn, Column>;
}
