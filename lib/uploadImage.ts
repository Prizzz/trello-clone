import { ID, storage } from "@/appwrite";

const uploadImage = async (file: File) => {
  if (!file) return;

  const fileUploaded = await storage.createFile(
    String(process.env.NEXT_PUBLIC_BUCKET_ID),
    ID.unique(),
    file
  );

  return fileUploaded;
};

export default uploadImage;
