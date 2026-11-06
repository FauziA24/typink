import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  User,
  LogOut,
  NotebookPen,
  Banknote,
  Search,
  Loader2,
  LogIn,
  Bell,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { defaultUserIcon, getApiURL } from "@/util/constants";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import axios from "axios";
import { LiteratureData } from "@/util/interfaces";
import { getStoredSession, loadSession, logout, SessionUser } from "@/api/client";

interface NavbarProps {
  sticky?: boolean;
}

export default function Navbar({ sticky = false }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [literatureData, setLiteratureData] = useState<LiteratureData[]>([]);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(() => getStoredSession());
  const username = session?.username;
  const uid = session?.userId;
  const uimg = session?.imageUrl;

  const navigate = useNavigate();

  const fetchData = async (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setLiteratureData([]);
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      const literatureResponse = await axios.get(
        `${getApiURL()}/literature/search?query=${encodeURIComponent(trimmedQuery)}&limit=8`
      );
      setLiteratureData(literatureResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadSession()
      .then((user) => { setSession(user); setIsLoggedIn(true); })
      .catch(() => { setSession(null); setIsLoggedIn(false); });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchData(search);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    setSession(null);
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div
      className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-1 py-2 sm:gap-4 ${
        sticky ? "sticky top-0 z-50 bg-white/95 backdrop-blur" : ""
      }`}
    >
      <div className="shrink-0 cursor-pointer" onClick={() => navigate("/")}>
        <svg
          width="120"
          height="60"
          viewBox="0 0 120 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <svg
            width="115"
            height="60"
            viewBox="0 0 115 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.29151 11.2624V5.25685H19.0498V11.2624H13.238V50.4597H7.1033V11.2624H1.29151ZM23.8515 50.4597C21.8712 50.4597 20.2784 49.9 19.073 48.7807C17.9106 47.6183 17.3294 46.1762 17.3294 44.4541V24.1775H16.3608L17.0065 18.1719H23.4641V44.4541H27.2095V18.1719H33.3441V53.4947C33.3441 55.1737 32.763 56.5082 31.6006 57.4984C30.4382 58.5316 28.9961 59.0482 27.274 59.0482H23.3995C21.5914 59.0482 20.1277 58.4885 19.0084 57.3692C17.8891 56.293 17.3294 54.8508 17.3294 53.0427V51.7512H23.4641V53.4947H27.2095V47.9412L25.5951 50.4597H23.8515ZM42.4871 59.0482H36.3524V24.1775H34.8026L35.4484 18.1719H42.4871V20.6904L44.1015 18.1719H45.845C47.8253 18.1719 49.3967 18.7316 50.559 19.8509C51.7644 20.9702 52.3671 22.4124 52.3671 24.1775V44.4541C52.3671 46.1762 51.7644 47.6183 50.559 48.7807C49.3967 49.9 47.8253 50.4597 45.845 50.4597H45.5867C44.4244 50.4597 43.3912 50.1798 42.4871 49.6202V59.0482ZM45.9096 24.1775H42.4871V44.4541H45.9096C46.1249 44.4541 46.2325 44.3465 46.2325 44.1313V24.5003C46.2325 24.2851 46.1249 24.1775 45.9096 24.1775Z"
              fill="black"
            />
            <path
              d="M68.5422 50.6014V24.3192H66.9924L67.6382 18.3137H74.6769V20.8322L76.2913 18.3137H78.0348C80.0151 18.3137 81.5865 18.8734 82.7488 19.9927C83.9542 21.112 84.557 22.5542 84.557 24.3192V44.5959H86.1713L85.5256 50.6014H78.4223V24.6421C78.4223 24.4269 78.3147 24.3192 78.0994 24.3192H74.6769V50.6014H68.5422ZM87.9224 50.6014V11.4041H86.3726L87.0184 5.39864H94.0571V28.8395L99.2231 18.3137H105.229L98.3837 32.1974L105.874 50.6014H99.8689L94.0571 36.3303V50.6014H87.9224ZM106.651 44.5959H112.656V50.6014H106.651V44.5959Z"
              fill="black"
            />
            <path
              d="M56.9375 49.0929L58.8356 2.9615C58.8356 2.9615 58.543 1.67266 61.1001 1.30782C63.6572 0.942987 63.4171 2.30784 63.4171 2.30784L61.3059 48.4697C59.6928 50.5558 58.9149 49.4161 57.704 49.1316C57.4681 49.0762 57.2157 49.0532 56.9375 49.0929Z"
              fill="#04D192"
              stroke="black"
              strokeWidth="1.07626"
            />
            <path
              d="M56.1945 51.5053L57.4415 55.6739L57.4269 57.0953L61.1949 51.5015L58.1005 54.9589L56.1945 51.5053Z"
              fill="#D9D9D9"
            />
            <path
              d="M57.2695 49.1343L57.2498 49.758L56.1945 51.5053M56.1945 51.5053L57.4415 55.6739L57.4269 57.0953L61.1949 51.5015M56.1945 51.5053L58.1005 54.9589L61.1949 51.5015M61.1949 51.5015L61.0359 48.863"
              stroke="black"
              strokeWidth="1.07626"
            />
            <path
              d="M58.3873 51.6359L59.0018 51.3708L59.3017 51.949L58.5807 52.2293L58.3873 51.6359Z"
              fill="#04D192"
            />
            <path
              d="M59.2988 49.6431L59.0018 51.3708M59.0018 51.3708L58.3873 51.6359L58.5807 52.2293M59.0018 51.3708L59.3017 51.949L58.5807 52.2293M58.5807 52.2293L58.1004 54.959"
              stroke="black"
              strokeWidth="1.07626"
            />
            <path
              d="M78.8647 46.6428H93.8966"
              stroke="black"
              strokeWidth="5.38129"
            />
          </svg>
        </svg>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="h-10 w-10 shrink-0 justify-center px-0 font-semibold text-gray-500 sm:w-full sm:max-w-sm sm:justify-start sm:px-4" variant={"outline"} aria-label="Search novels">
            <Search className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Search</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="mb-4">Search Novels</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                autoFocus
                value={search}
                placeholder="Cari judul, sinopsis, atau tema cerita"
                className="h-11 pl-10 pr-10"
                onChange={(e) => setSearch(e.target.value)}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </DialogHeader>
          <div className="flex flex-row w-full justify-between text-xs font-semibold uppercase text-gray-500">
            <span>Title</span>
            <span>Author</span>
          </div>
          <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
            {search.trim().length < 2 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                Ketik minimal 2 karakter untuk mulai mencari.
              </div>
            )}
            {search.trim().length >= 2 && !searchLoading && literatureData.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                Tidak ada cerita yang cocok.
              </div>
            )}
            {literatureData.map((v, i) => (
              <DialogClose
                key={`k${i}`}
                className="cursor-pointer min-h-16 w-full border rounded-lg flex flex-row items-center px-4 justify-between gap-4 text-left hover:border-black hover:bg-gray-50"
                onClick={() => navigate(`/read/${v.literatureId}`)}
              >
                <div className="min-w-0">
                  <h1 className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
                    {v.title}
                  </h1>
                  <p className="line-clamp-1 text-xs text-gray-500">{v.synopsis}</p>
                </div>
                <h2 className="w-24 shrink-0 line-clamp-1 text-sm font-semibold">
                  {v.users.username}
                </h2>
              </DialogClose>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
        <Button className="hidden sm:inline-flex" onClick={() => navigate("/forum")} variant={"link"}>
          Forum
        </Button>
        {isLoggedIn && (
          <Button
            className="hidden md:inline-flex"
            onClick={() => navigate(`/profile/${uid}`)}
            variant={"link"}
          >
            My List
          </Button>
        )}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-8 h-8 cursor-pointer">
                <img
                  src={uimg && uimg != "null" ? uimg : defaultUserIcon}
                  alt="Profile"
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate(`/profile/${uid}`)}>
                <User className="mr-2" />
                {username}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/novel/create")}>
                <Plus color="#04D192" className="mr-2" /> Create
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile/creations")}>
                <NotebookPen color="#04D192" className="mr-2" /> Creations
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile/transactions")}
              >
                <Banknote className="mr-2" /> Transactions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut color="#D10404" className="mr-2" /> Log Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/library")}>
                <Bell className="mr-2" /> Library & notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/author/dashboard")}>
                <LayoutDashboard className="mr-2" /> Author dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-white hover:bg-gray-50">
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/auth")}>
                <LogIn className="mr-2" />
                Log In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/auth?mode=signup")}>
                <User className="mr-2" />
                Sign Up
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")}>
                Continue as guest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
