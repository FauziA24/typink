import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ForumData, TopPicks } from "@/util/interfaces";
import axios from "axios";
import { getApiURL } from "@/util/constants";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function RightBar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("typink_web_session");
  const [latestData, setLatestData] = useState<TopPicks[]>([]);
  const [forums, setForums] = useState<ForumData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [topPicksResponse, forumsResponse] = await Promise.all([
          axios.get<TopPicks[]>(`${getApiURL()}/literature/top-picks`),
          axios.get<ForumData[]>(`${getApiURL()}/forum/recent-activity`),
        ]);
        setLatestData(topPicksResponse.data);
        setForums(forumsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Top Recent Titles
      </h2>
      {latestData.map((book, index) => (
        <div
          key={index}
          className="md-3 flex items-center h-[140px] my-3 cursor-pointer"
          onClick={() => navigate(`/read/${book.literatureId}`)}
        >
          <img
            className="w-[70%] overflow-hidden h-full object-cover rounded-sm"
            alt=""
            loading="lazy"
            src={book.imageUrl}
          />

          <div className="h-full w-full p-3 flex flex-col justify-between">
            <div className="text-sm font-semibold text-gray-700">
              {book.title}
            </div>
            <div className="text-xs text-gray-800">{book.genre.genreTitle}</div>
            <div className="flex flex-row items-center gap-2">
              <TrendingUp />
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {book._count.Vote}
              </p>
            </div>
          </div>
        </div>
      ))}

      <h2 className="lg-2 text-lg font-bold text-gray-800 mt-8">
        Recent Activity
      </h2>
      <Button
        className="w-full my-4 rounded-xl p-2"
        onClick={() => navigate(token ? `/forum/create` : "/auth")}
      >
        Post New Topic
      </Button>
      <ul>
        {forums.slice(0, 10).map((activity, index) => (
          <Button
            variant={"ghost"}
            key={index}
            className="flex justify-between pb-2 border-b border-gray-300 w-[248px] max-w-[248px] rounded-none text-start"
            onClick={() =>
              navigate(`/forum/${activity.genreId}/${activity.forumId}`)
            }
          >
            <span className="text-sm text-gray-700 w-[80%] text-ellipsis overflow-hidden">
              {activity.title}
            </span>
            <span className="text-sm text-gray-500 w-[20%] text-center">
              {activity._count.forumComments}
            </span>
          </Button>
        ))}
      </ul>
    </>
  );
}
