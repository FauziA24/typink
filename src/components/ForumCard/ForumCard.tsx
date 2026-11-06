import { timeSince } from "@/lib/utils";
import { defaultUserIcon } from "@/util/constants";
import { ForumData } from "@/util/interfaces";
import { Lock, MessageSquare, Megaphone, Pin, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ForumCardProps {
  forumData: ForumData;
  clamp: boolean;
}

export default function ForumCard({ forumData, clamp = true }: ForumCardProps) {
  const navigate = useNavigate();

  const { forumId, created_at, users, title, content, genreId, forumType } =
    forumData;

  return (
    <article
      className={`w-full bg-[#F8FAFC] border border-slate-200 p-4 rounded-lg my-4 transition ${
        clamp ? "hover:cursor-pointer hover:border-slate-400 hover:bg-white" : ""
      }`}
      onClick={() => navigate(`/forum/${genreId}/${forumId}`)}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
        <img
          src={
            forumData.users.imgUrl ? forumData.users.imgUrl : defaultUserIcon
          }
          alt="Profile"
          className="rounded-full object-cover w-8 h-8"
        />
        <span className="font-bold">{users.username}</span>
        <span className="text-sm text-gray-500">{timeSince(new Date(created_at))}</span>
      </div>
      <div className="flex flex-col my-2">
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          {forumData.isPinned && <span className="flex items-center rounded bg-amber-100 px-2 py-1"><Pin className="mr-1 h-3 w-3" />Pinned</span>}
          {forumData.isLocked && <span className="flex items-center rounded bg-slate-200 px-2 py-1"><Lock className="mr-1 h-3 w-3" />Locked</span>}
          {forumType === "Announcement" && <span className="flex items-center rounded bg-emerald-100 px-2 py-1"><Megaphone className="mr-1 h-3 w-3" />Announcement</span>}
        </div>
        <span className="text-2xl font-bold line-clamp-3">{title}</span>
        <span className={`text-gray-700 ${clamp ? "line-clamp-2" : ""}`}>{content}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-[#001C54] px-4 py-1 text-sm text-white sm:px-6">
          {forumType}
        </div>
        <div className="flex flex-row items-center gap-4 sm:ml-2 sm:gap-6">
          <div className="flex flex-row gap-2">
            <TrendingUp />
            <span>{forumData.voteCount}</span>
          </div>
          <div className="flex flex-row gap-2">
            <MessageSquare />
            <span>{forumData._count?.forumComments ?? forumData.forumComments.length}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
