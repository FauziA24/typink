import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ForumCard from "@/components/ForumCard/ForumCard";
import Layout from "@/components/ui/layout";
import VoteButtons from "@/components/VoteButtons/VoteButtons";
import { getApiURL } from "@/util/constants";
import CommentCard from "@/components/Comments/Comments";
import { ForumComment, ForumData } from "@/util/interfaces";
import ReportButton from "@/components/ReportButton/ReportButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Forward } from "lucide-react";

export default function ForumRead() {
  const { id } = useParams<{ id: string }>();
  const [forumData, setForumData] = useState<ForumData | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const token = sessionStorage.getItem("typink_web_session");

  useEffect(() => {
    async function fetchData() {
      try {
        const forumResponse = await axios.get<ForumData>(
          `${getApiURL()}/forum/id/${id}`,
          {
            headers: {
              
            },
          }
        );
        setForumData(forumResponse.data);

        const commentsResponse = await axios.get<ForumComment[]>(
          `${getApiURL()}/forum/comments/${id}`,
          {
            headers: {
              
            },
          }
        );
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, token]);

  const handleVote = async (
    forumId: number,
    voteType: "upvote" | "downvote"
  ) => {
    if (!token) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to vote.",
      });
      return;
    }

    try {
      await axios.post(
        `${getApiURL()}/voting/forum`,
        { forumId, voteType },
        {
          headers: {
            
          },
        }
      );

      setForumData((prevForumData) =>
        prevForumData
          ? {
              ...prevForumData,
              vote: prevForumData.vote === voteType ? "blank" : voteType,
              voteCount:
                prevForumData.vote === voteType
                  ? voteType === "upvote"
                    ? prevForumData.voteCount - 1
                    : prevForumData.voteCount + 1
                  : voteType === "upvote"
                  ? prevForumData.vote === "downvote"
                    ? prevForumData.voteCount + 2
                    : prevForumData.voteCount + 1
                  : prevForumData.vote === "upvote"
                  ? prevForumData.voteCount - 2
                  : prevForumData.voteCount - 1,
            }
          : null
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCommentVote = async (
    commentId: number,
    voteType: "upvote" | "downvote"
  ) => {
    if (!token) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to vote on comments.",
      });
      return;
    }

    try {
      await axios.post(
        `${getApiURL()}/voting/forum-comment`,
        { forumCommentId: commentId, voteType },
        {
          headers: {
            
          },
        }
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.forumCommentId === commentId
            ? {
                ...comment,
                vote: comment.vote === voteType ? "blank" : voteType,
                voteCount:
                  comment.vote === voteType
                    ? voteType === "upvote"
                      ? comment.voteCount - 1
                      : comment.voteCount + 1
                    : voteType === "upvote"
                    ? comment.vote === "downvote"
                      ? comment.voteCount + 2
                      : comment.voteCount + 1
                    : comment.vote === "upvote"
                    ? comment.voteCount - 2
                    : comment.voteCount - 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error voting on comment:", error);
    }
  };

  const handleAddComment = async () => {
    try {
      await axios.post(
        `${getApiURL()}/forum/comment`,
        { forumId: Number(id), content: newComment },
        {
          headers: {
            
          },
        }
      );
      toast({
        title: "Comment added",
        description: "Your comment has been successfully added.",
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsResponse = await axios.get<ForumComment[]>(
        `${getApiURL()}/forum/comments/${id}`,
        {
          headers: {
            
          },
        }
      );
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!forumData) {
    return <div>Error loading forum data.</div>;
  }

  return (
    <Layout>
      <ForumCard forumData={forumData} clamp={false} />
      <VoteButtons
        upvoteFn={() => handleVote(forumData.forumId, "upvote")}
        downvoteFn={() => handleVote(forumData.forumId, "downvote")}
        value={forumData.voteCount}
        status={forumData.vote as "upvote" | "downvote" | "blank"}
      />
      <ReportButton targetType="forum" targetId={forumData.forumId} />
      <hr className="mt-6" />
      {token && (
        <div className="flex flex-col">
          <h2 className="text-xl font-bold my-6">Comment</h2>
          <Textarea
            placeholder="Type your Comment here here."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button className="mt-4 w-20" onClick={handleAddComment}>
            <Forward />
          </Button>
          <hr className="mt-6" />
        </div>
      )}

      <h2 className="text-xl font-bold my-6">Comments</h2>
      <CommentCard
        commentType="Forum"
        comments={comments}
        handleCommentVote={handleCommentVote}
        targetId={Number(id)}
      />
    </Layout>
  );
}
