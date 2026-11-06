import CommentCard from "@/components/Comments/Comments";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/ui/layout";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { timeSince } from "@/lib/utils";
import { getApiURL } from "@/util/constants";
import { LiteratureComment, LiteratureData } from "@/util/interfaces";
import axios from "axios";
import {
  Check,
  Coins,
  Eraser,
  Forward,
  Grid2X2,
  Layers2,
  Pencil,
  Plus,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import VoteButtons from "@/components/VoteButtons/VoteButtons";
import ReportButton from "@/components/ReportButton/ReportButton";
import LiteratureCard from "@/components/LiteratureCard/LiteratureCard";

export default function LiteratureRead() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [literatureData, setLiteratureData] = useState<LiteratureData | null>(
    null
  );
  const [comments, setComments] = useState<LiteratureComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const token = sessionStorage.getItem("typink_web_session");
  const [currSec, setCurrSec] = useState(1);
  const currentUserId = sessionStorage.getItem("typink_user_id");

  const [saveButtonHover, setSaveButton] = useState(false);
  const [following, setFollowing] = useState(false);
  const [related, setRelated] = useState<LiteratureData[]>([]);

  const [alertOpen, setAlertOpen] = useState(0);
  const [literatureAlertOpen, setLAlertOpen] = useState(false);

  const toggleFollow = async () => {
    if (!token || !literatureData) return navigate("/auth");
    const url = `${getApiURL()}/authors/${literatureData.authorId}/follow`;
    const config = { headers: { } };
    if (following) await axios.delete(url, config); else await axios.post(url, {}, config);
    setFollowing(!following);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const literatureResponse = await axios.get(
          `${getApiURL()}/literature/id/${id}`,
          {
            headers: { },
          }
        );
        setLiteratureData(literatureResponse.data);
        axios.get(`${getApiURL()}/literature/${id}/related`).then((response) => setRelated(response.data)).catch(() => undefined);

        const commentsResponse = await axios.get(
          `${getApiURL()}/literature/comments/${id}`,
          {
            headers: { },
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
        `${getApiURL()}/voting/literature-comment`,
        { literatureCommentId: commentId, voteType },
        {
          headers: { },
        }
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.literatureCommentId === commentId
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

  const handleAddToCollection = async () => {
    try {
      await axios.post(
        `${getApiURL()}/collection/add`,
        { literatureId: Number(id) },
        {
          headers: { },
        }
      );
      toast({
        title: "Added to collection",
        description: "This literature has been added to your collection.",
      });
      setLiteratureData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          saved: true,
        };
      });
    } catch (error) {
      console.error("Error adding to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add to collection.",
      });
    }
  };

  const handleDeleteCollection = async () => {
    try {
      await axios.delete(
        `${getApiURL()}/collection/${literatureData?.literatureId}`,
        {
          headers: { },
        }
      );
      toast({
        title: "Deleted From Collection",
        description: "This literature has been deleted from your collection.",
      });
      setLiteratureData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          saved: false,
        };
      });
    } catch (error) {
      console.error("Error adding to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add to collection.",
      });
    }
  };

  const handleAddComment = async () => {
    try {
      await axios.post(
        `${getApiURL()}/literature/${id}/comment`,
        { literatureId: Number(id), content: newComment },
        {
          headers: { },
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
      const commentsResponse = await axios.get(
        `${getApiURL()}/literature/comments/${id}`
      );
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    try {
      await axios.delete(`${getApiURL()}/chapter/delete`, {
        data: { chapterId },
        headers: { },
      });
      toast({
        title: "Chapter deleted",
        description: "The chapter has been successfully deleted.",
      });
      setLiteratureData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          chapters: prevData.chapters.filter(
            (chapter) => chapter.chapterId !== chapterId
          ),
        };
      });
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  };

  const handleDeleteLiterature = async () => {
    try {
      await axios.delete(
        `${getApiURL()}/literature/delete/${literatureData?.literatureId}`,
        {
          headers: { },
        }
      );
      toast({
        title: "Literature deleted",
        description: "The Literature has been successfully deleted.",
      });
      setTimeout(() => {
        navigate(`/profile`);
      }, 1000);
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!token) {
      toast({
        title: "Login required",
        description: "Please log in from the profile menu to vote.",
      });
      navigate("/auth");
      return;
    }

    try {
      await axios.post(
        `${getApiURL()}/voting/literature`,
        { literatureId: Number(id), voteType },
        {
          headers: { },
        }
      );
      setLiteratureData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          vote: prevData.vote === voteType ? "blank" : voteType,
          voteCount:
            prevData.vote === voteType
              ? voteType === "upvote"
                ? prevData.voteCount - 1
                : prevData.voteCount + 1
              : voteType === "upvote"
              ? prevData.vote === "downvote"
                ? prevData.voteCount + 2
                : prevData.voteCount + 1
              : prevData.vote === "upvote"
              ? prevData.voteCount - 2
              : prevData.voteCount - 1,
        };
      });
    } catch (error) {
      console.error("Error voting on literature:", error);
    }
  };

  return (
    <Layout leftBar={false} rightBar={false} sticky>
      <div className="relative my-6 flex min-w-0 flex-col gap-6 md:my-10 md:flex-row">
        {literatureData?.authorId === currentUserId && (
          <>
            <div className="absolute top-0 right-0 flex flex-col">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="" variant="ghost">
                    <Settings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(`/novel/edit/${literatureData?.literatureId}`)
                    }
                  >
                    <Pencil color="#04D192" className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLAlertOpen(!literatureAlertOpen)}
                  >
                    <Eraser className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog open={literatureAlertOpen}>
                <AlertDialogTrigger asChild></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the literature.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setLAlertOpen(!literatureAlertOpen)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteLiterature()}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
        <img
          className="mx-auto aspect-[4/5] h-auto w-full max-w-80 rounded-sm object-cover md:mx-0 md:h-[450px]"
          src={`${literatureData?.imageUrl}`}
          alt=""
        />
        <div className="flex min-w-0 w-full flex-col justify-between gap-8 p-0 md:p-10">
          <div className="flex flex-col gap-4">
            <span className="block w-full break-words text-3xl font-bold sm:text-4xl md:text-5xl">
              {literatureData?.title}
            </span>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex flex-row gap-2">
                <Grid2X2 />
                {literatureData?.genre.genreTitle}
              </div>
              <div className="flex flex-row gap-2">
                <Layers2 />
                {literatureData?.chapters.length} chapters
              </div>
            </div>
            <span>Author: {literatureData?.users.username}</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {literatureData?.authorId !== currentUserId && (
                <><Button variant="outline" onClick={toggleFollow}>{following ? "Following" : "Follow author"}</Button><Button
                  className="w-fit bg-[#FBBC04] hover:bg-[#EAAF00] rounded-xl"
                  onClick={() =>
                    navigate(`/donate/${literatureData?.authorId}`)
                  }
                >
                  <Coins className="mr-4" />
                  Donate To Author
                </Button></>
              )}
              {literatureData?.donated === true && (
                <Check className="text-[#04D192]" />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant={"default"}
              className="w-36 rounded-xl bg-[#04D192] hover:bg-[#00855C]"
              onClick={() =>
                navigate(`/read/${id}/${literatureData?.chapters[0].chapterId}`)
              }
            >
              Read
            </Button>
            {token && (
              <>
                {!literatureData?.saved === true ? (
                  <Button
                    variant={"default"}
                    onClick={handleAddToCollection}
                    className="w-36 rounded-xl bg-[#04D192] hover:bg-[#00855C]"
                  >
                    Add To Library
                  </Button>
                ) : (
                  <Button
                    variant={"outline"}
                    onClick={handleDeleteCollection}
                    className="w-36 rounded-xl"
                    onMouseEnter={() => setSaveButton(true)}
                    onMouseLeave={() => setSaveButton(false)}
                  >
                    {saveButtonHover ? "Remove ? " : "Already added"}
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <VoteButtons
              className="mb-0 items-center flex flex-row"
              downvoteFn={() => handleVote("downvote")}
              upvoteFn={() => handleVote("upvote")}
              value={literatureData?.voteCount || 0}
              status={literatureData?.vote as "upvote" | "downvote" | "blank"}
            />
            <ReportButton targetType="literature" targetId={Number(id)} />
            {literatureData?.authorId === currentUserId && (
              <Button
                variant="outline"
                onClick={() => navigate(`/novel/${id}/create-chapter`)}
              >
                <Plus color="#04D192" />
                Add Chapter
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex w-full">
          <Button
            className={`h-12 flex-1 rounded-none text-lg font-bold sm:max-w-44 sm:text-2xl ${
              currSec == 1 && "border-b-2 border-black"
            }`}
            variant={"ghost"}
            onClick={() => setCurrSec(1)}
          >
            Info
          </Button>
          <Button
            className={`h-12 flex-1 rounded-none text-lg font-bold sm:max-w-44 sm:text-2xl ${
              currSec == 2 && "border-b-2 border-black"
            }`}
            variant={"ghost"}
            onClick={() => setCurrSec(2)}
          >
            Chapters
          </Button>
        </div>
        <hr className="mb-4" />
        {currSec == 1 && (
          <>
            <p className="my-6">{literatureData?.synopsis}</p>
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
              comments={comments}
              handleCommentVote={handleCommentVote}
              commentType="Literature"
              targetId={Number(id)}
            />
            {related.length > 0 && <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Related stories</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.slice(0, 4).map((item) => <LiteratureCard key={item.literatureId} item={item} />)}</div></section>}
          </>
        )}
        {currSec == 2 && (
          <>
            {literatureData?.chapters.map((v, i) => (
              <div key={`o${i}`} className="flex min-w-0 flex-row items-center">
                <div
                  className="hover:bg-secondary cursor-pointer my-2 w-full"
                  onClick={() =>
                    navigate(
                      `/read/${id}/${v.chapterId}`
                    )
                  }
                >
                  <div className="flex min-h-16 w-full flex-col justify-center gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:w-[20%]">Chapter {v.chapterNumber}</span>
                    <span className="min-w-0 flex-1 break-words">{v.chapterTitle}</span>
                    <span className="text-sm text-gray-500 sm:w-[20%] sm:text-right">
                      {timeSince(new Date(v.created_at))}
                    </span>
                  </div>
                  <hr />
                </div>
                {currentUserId === literatureData.authorId && (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          className=""
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/novel/edit-chapter/${v.chapterId}`);
                          }}
                          variant="ghost"
                        >
                          <Settings />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/novel/edit-chapter/${v.chapterId}`)
                          }
                        >
                          <Pencil color="#04D192" className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setAlertOpen(v.chapterId)}
                        >
                          <Eraser className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialog open={v.chapterId === alertOpen}>
                      <AlertDialogTrigger asChild></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the chapter.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setAlertOpen(0)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteChapter(v.chapterId)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </Layout>
  );
}
