import { create } from "zustand";

interface UserState {
  id: string | null;
  name: string;
  setId: (id: string) => void;
  setName: (name: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: null,
  name: "",
  setId: (id) => set({ id: id }),
  setName: (name) => set({ name: name }),
}));
