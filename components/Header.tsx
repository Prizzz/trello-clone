"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Avatar from "react-avatar";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { SiOpenai } from "react-icons/si";
import { useBoardStore } from "@/store/BoardStore";
import { fetchSuggestion } from "@/lib/fetchSuggestion";
import { useUserStore } from "@/store/UserStore";
import { logout } from "@/appwrite";
import { useRouter } from "next/navigation";

import logo from "../public/logo.png";

const Header = () => {
  const [name] = useUserStore((state) => [state.name]);
  const [board, searchString, setSearchString] = useBoardStore((state) => [
    state.board,
    state.searchString,
    state.setSearchString,
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (board.columns.size === 0) return;
    setLoading(true);

    const fetchSuggestionFunc = async () => {
      const suggestion = await fetchSuggestion(board, name);
      setSuggestion(suggestion);
      setLoading(false);
    };

    fetchSuggestionFunc();
  }, [board]);

  const handleLogOut = () => {
    logout().then(() => router.push("/login"));
  };

  return (
    <header>
      <div className="flex flex-col md:flex-row justify-between items-center p-5 bg-gray-500/10 rounded-b-2xl">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-pink-400 to-[#0055D1] rounded-md filter blur-3xl opacity-50 -z-50" />

        <Image
          src={logo}
          alt="Trello Logo"
          width={300}
          height={100}
          className="w-44 md:w-56 pb-10 md:pb-0 object-contain"
        />

        <div className="w-full md:w-auto flex items-center gap-x-5 mr-[12px]">
          <form className="flex items-center gap-x-5 bg-white rounded-md p-2 shadow-md flex-1 md:flex-initial">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-600" />
            <input
              type="text"
              placeholder="Search"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="w-full outline-none"
            />
            <button type="submit" hidden>
              Search
            </button>
          </form>
          <Avatar
            name={name}
            round
            size="50"
            color="#0055D1"
            className="cursor-pointer"
            onClick={() => setModalOpen(!modalOpen)}
          />
          {modalOpen && (
            <div className="absolute right-[16px] top-[155px] md:right-[20px] md:top-[80px] p-2 rounded-md bg-white shadow-xl">
              <button className="text-red-500 font-medium" onClick={handleLogOut}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-2 md:py-5">
        <p className="flex items-center w-fit max-w-3xl p-5 text-sm font-light shadow-xl rounded-xl bg-white italic">
          <SiOpenai
            color="#0055D1"
            className={`inline-block flex-none h-10 w-10 mr-1 ${loading && "animate-spin"}`}
          />
          {suggestion && !loading ? suggestion : "GPT is summarising your tasks for the day..."}
        </p>
      </div>
    </header>
  );
};

export default Header;
