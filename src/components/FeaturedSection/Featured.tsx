import { useState, useEffect } from "react";
import axios from "axios";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiURL } from "@/util/constants";
import { Literature } from "@/util/interfaces";
import { useNavigate } from "react-router-dom";

export default function Featured({ literatureIds = [] }: { literatureIds?: number[] }) {
  const navigate = useNavigate();
  const [featuredData, setFeaturedData] = useState<Literature[]>([]);
  const [loading, setLoading] = useState(true);
  const literatureIdKey = literatureIds.join(",");

  useEffect(() => {
    async function fetchData() {
      try {
        const selectedIds = literatureIdKey
          ? literatureIdKey.split(",").map(Number).filter(Number.isFinite)
          : [];
        if (selectedIds.length) {
          const responses = await Promise.all(selectedIds.slice(0, 8).map((id) => axios.get<Literature>(`${getApiURL()}/literature/id/${id}`)));
          setFeaturedData(responses.map((response) => response.data));
        } else {
          const response = await axios.get<Literature[]>(`${getApiURL()}/literature/top-picks`);
          setFeaturedData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [literatureIdKey]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-[500px] w-full rounded" />
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="font-bold text-4xl">Featured</h1>
        <h6 className="mb-3">Today's Top Picks</h6>
        <hr />
      </div>
      <Carousel
        className="w-full"
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
      >
        <CarouselContent>
          {featuredData.map((v, i) => (
            <CarouselItem key={v.literatureId}>
              <div
                className="rounded h-[500px] mt-4"
                style={{
                  backgroundImage: `url(${v.imageUrl})`,
                  backgroundSize: "cover",
                }}
              >
                <div className="h-full w-full backdrop-blur-lg rounded flex flex-row bg-black/60 overflow-hidden">
                  <img
                    src={v.imageUrl}
                    alt={v.title}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="object-cover w-[40%] h-full"
                  />
                  <div className="w-full h-full pt-16 px-10 flex flex-col justify-between ">
                    <div
                      onClick={() => navigate(`/read/${v.literatureId}`)}
                      className="cursor-pointer"
                    >
                      <h1 className="text-white text-4xl capitalize font-semibold mb-4">
                        {v.title}
                      </h1>
                      <p className="text-white text-sm">{v.synopsis}</p>
                    </div>
                    <div className="flex flex-row justify-between items-center text-white">
                      <span>{v.users.username}</span>
                      <div className="flex flex-row gap-4 my-4">
                        <CarouselPrevious
                          className="carousel-btn"
                          variant={"link"}
                          style={{
                            all: "initial",
                            color: "white",
                            cursor: "pointer",
                          }}
                        />
                        {i + 1} of {featuredData.length}
                        <CarouselNext
                          className="carousel-btn"
                          variant={"link"}
                          style={{
                            all: "initial",
                            color: "white",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
}
