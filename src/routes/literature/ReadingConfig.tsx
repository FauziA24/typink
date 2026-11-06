import CommentCard from "@/components/Comments/Comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiURL } from "@/util/constants";
import { ChapterComment, LiteratureData } from "@/util/interfaces";
import axios from "axios";
import { Forward, Layers, MessageSquareMore, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ReadingConfigProps {
  bgColor: string;
  font: string;
  fontSize: number;
  onBgColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
}

interface chaptersInterface {
  chapterId: number;
  chapterNumber: number;
  chapterTitle: string;
}

export default function ReadingConfig({
  fontSize,
  onBgColorChange,
  onFontChange,
  onFontSizeChange,
}: ReadingConfigProps) {
  const navigate = useNavigate();

  const [tabMenu, setTabMenu] = useState<
    "config" | "comment" | "chapters" | "none"
  >("none");
  const [comments, setComments] = useState<ChapterComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [chapterList, setChapter] = useState<chaptersInterface[]>([]);
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const isAuthenticated = Boolean(sessionStorage.getItem("typink_web_session"));

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get<ChapterComment[]>(
        `${getApiURL()}/chapter/comments/${chapterId}`,
        {
          headers: {
            
          },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [chapterId]);

  const fetchChapters = useCallback(async () => {
    try {
      const response = await axios.get<LiteratureData>(
        `${getApiURL()}/literature/id/${id}`,
        {
          headers: {
            
          },
        }
      );

      const chapters = response.data.chapters.map((v) => ({
        chapterId: v.chapterId,
        chapterNumber: v.chapterNumber,
        chapterTitle: v.chapterTitle,
      }));

      setChapter(chapters);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [id]);

  useEffect(() => {
    if (tabMenu === "comment") {
      void fetchComments();
    }
  }, [fetchComments, tabMenu]);

  useEffect(() => {
    void fetchChapters();
  }, [fetchChapters]);

  const handleAddComment = async () => {
    try {
      await axios.post(
        `${getApiURL()}/chapter/comment`,
        { content: newComment, chapterId: chapterId },
        { headers: { } }
      );
      await fetchComments();
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentVote = async (commentId: number, voteType: "upvote" | "downvote") => {
    console.log({ chapterCommentId: commentId, voteType: voteType });
    try {
      await axios.post(
        `${getApiURL()}/voting/chapter-comment`,
        { chapterCommentId: commentId, voteType: voteType },
        { headers: { } }
      );
      await fetchComments();
    } catch (error) {
      console.error("Error voting on comment:", error);
    }
  };

  const handleBgColorChange = (color: string) => {
    onBgColorChange(color);
  };

  const handleFontChange = (font: string) => {
    onFontChange(font);
  };

  const handleFontSizeChange = (size: number) => {
    onFontSizeChange(size);
  };

  const ConfigElement = () => (
    <div className="h-[80vh] right-[80px] bg-white w-[300px] fixed p-12 flex flex-col justify-center">
      <h1 className="text-3xl text-center font-semibold">Config</h1>
      <div className="flex flex-col gap-4 my-6">
        <h6>Background Color</h6>
        <div className="flex flex-row gap-4">
          <Button
            className="rounded-full w-12 h-12 border hover:border-4 border-black"
            variant={"ghost"}
            onClick={() => handleBgColorChange("#FFFFFF")}
            style={{ backgroundColor: "#FFFFFF" }}
          />
          <Button
            className="rounded-full w-12 h-12 border bg-[#F6ECCA] hover:border-4 border-black"
            variant={"ghost"}
            onClick={() => handleBgColorChange("#F6ECCA")}
            style={{ backgroundColor: "#F6ECCA" }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 my-6">
        <h6>Font</h6>
        <div className="flex flex-row gap-4">
          <Button variant={"outline"} onClick={() => handleFontChange("Inter")}>
            Inter
          </Button>
          <Button
            variant={"outline"}
            onClick={() => handleFontChange("Montserrat")}
          >
            Montserrat
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 my-6">
        <h6>Font Size</h6>
        <div className="flex flex-row gap-4 items-center">
          <Button
            variant={"outline"}
            onClick={() => handleFontSizeChange(fontSize - 1)}
          >
            -
          </Button>
          {fontSize}
          <Button
            variant={"outline"}
            onClick={() => handleFontSizeChange(fontSize + 1)}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );

  const ChaptersElement = () => {
    return (
      <div className="h-[80vh] right-[80px] bg-white w-[300px] fixed p-6">
        <h1 className="my-6 text-3xl font-semibold">Chapters</h1>
        {chapterList?.map((v, i) => (
          <div
            className="hover:bg-secondary cursor-pointer my-2 w-full"
            onClick={() => navigate(`/read/${id}/${v.chapterId}`)}
            key={`p${i}`}
          >
            <div className="flex flex-row w-full justify-between  h-10 items-center p-3 py-8">
              <span className="w-[120px]">Chapter {v.chapterNumber}</span>
              <span className="w-[180px] line-clamp-1  text-ellipsis">
                {v.chapterTitle}
              </span>
            </div>
            <hr />
          </div>
        ))}
      </div>
    );
  };

  const ElementMap = {
    none: <></>,
    comment: <></>,
    config: <ConfigElement />,
    chapters: <ChaptersElement />,
  };

  const handleButtonClick = (menu: "config" | "comment" | "chapters") => {
    setTabMenu((prev) => (prev === menu ? "none" : menu));
  };

  return (
    <div className="fixed top-[14%] right-0 h-[80vh] w-[80px] flex flex-col justify-center gap-6 bg-white p-2">
      <Button
        variant={tabMenu === "chapters" ? "default" : "ghost"}
        className="h-14"
        onClick={() => handleButtonClick("chapters")}
      >
        <Layers />
      </Button>
      <Button
        variant={tabMenu === "config" ? "default" : "ghost"}
        className="h-14"
        onClick={() => handleButtonClick("config")}
      >
        <Settings2 />
      </Button>
      <Button
        variant={tabMenu === "comment" ? "default" : "ghost"}
        className="h-14"
        onClick={() => handleButtonClick("comment")}
      >
        <MessageSquareMore />
      </Button>
      {ElementMap[tabMenu]}
      {tabMenu == "comment" && (
        <div className="h-[80vh] right-[80px] bg-white w-[300px] fixed p-6 overflow-y-auto">
          {isAuthenticated && (
            <div className="flex flex-col mb-6">
              <h2 className="text-xl font-bold my-6">Comment</h2>
              <Textarea
                placeholder="Type your Comment here."
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
            commentType="Chapter"
            comments={comments}
            handleCommentVote={handleCommentVote}
            targetId={Number(chapterId)}
          />
        </div>
      )}
    </div>
  );
}
