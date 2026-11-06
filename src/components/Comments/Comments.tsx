import {
  ForumComment,
  LiteratureComment,
  ChapterComment,
} from "@/util/interfaces";
import VoteButtons from "../VoteButtons/VoteButtons";
import { timeSince } from "@/lib/utils";
import { defaultUserIcon } from "@/util/constants";
import axios from "axios";
import { Flag, Reply } from "lucide-react";
import { getApiURL } from "@/util/constants";

interface CommentProps {
  comments: (ForumComment | LiteratureComment | ChapterComment)[];
  handleCommentVote: (
    commentId: number,
    voteType: "upvote" | "downvote"
  ) => void;
  commentType: "Forum" | "Literature" | "Chapter";
  targetId: number;
}

export default function CommentCard({
  comments,
  handleCommentVote,
  commentType,
  targetId,
}: CommentProps) {
  const token = sessionStorage.getItem("typink_web_session");

  return (
    <>
      {comments.length === 0 && "No Comments"}
      {comments.map((comment) => {
        const commentId =
          commentType === "Forum"
            ? (comment as ForumComment).forumCommentId
            : commentType === "Literature"
            ? (comment as LiteratureComment).literatureCommentId
            : (comment as ChapterComment).chapterCommentId;

        return (
          <div key={commentId} className={`mt-4 ${comment.parentCommentId ? "ml-8 w-[calc(100%-2rem)] border-l-2 pl-4" : "w-full"}`}>
            <div className="flex flex-row items-center gap-4 justify-between">
              <div className="flex flex-row items-center gap-4 ">
                <img
                  src={
                    comment.users.imageUrl
                      ? comment.users.imageUrl
                      : defaultUserIcon
                  }
                  alt="Profile"
                  className="rounded-full object-cover w-8 h-8"
                />
                <span className="font-semibold">{comment.users.username}</span>
              </div>
              <span className="text-sm text-[#8E8E8E]">
                {timeSince(new Date(comment.created_at))}
              </span>
            </div>
            <p className="my-4">{comment.content}</p>
            {token && (
              <div className="flex items-center gap-3"><VoteButtons
                upvoteFn={() => handleCommentVote(commentId, "upvote")}
                downvoteFn={() => handleCommentVote(commentId, "downvote")}
                value={comment.voteCount}
                status={comment.vote as "upvote" | "downvote" | "blank"}
              /><button className="flex items-center text-sm" onClick={async () => { const content = window.prompt(`Reply to @${comment.users.username}`); if (!content) return; const headers = { }; if (commentType === "Literature") await axios.post(`${getApiURL()}/literature/${targetId}/comment`, { content: `@${comment.users.username} ${content}`, parentCommentId: commentId }, { headers }); else if (commentType === "Forum") await axios.post(`${getApiURL()}/forum/comment`, { forumId: targetId, content: `@${comment.users.username} ${content}`, parentCommentId: commentId }, { headers }); else await axios.post(`${getApiURL()}/chapter/comment`, { chapterId: targetId, content: `@${comment.users.username} ${content}`, parentCommentId: commentId }, { headers }); window.location.reload(); }}><Reply className="mr-1 h-4 w-4" />Reply</button><button className="flex items-center text-sm text-red-600" onClick={async () => { const reason = window.prompt("Report reason"); if (!reason) return; const map = { Forum: "forum-comment", Literature: "literature-comment", Chapter: "chapter-comment" }; await axios.post(`${getApiURL()}/reports`, { targetType: map[commentType], targetId: String(commentId), reason }, { headers: { } }); }}><Flag className="mr-1 h-4 w-4" />Report</button></div>
            )}
            <hr className="my-4" />
          </div>
        );
      })}
    </>
  );
}
