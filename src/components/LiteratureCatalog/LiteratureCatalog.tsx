import { useState, useEffect } from "react";
import axios from "axios";
import LiteratureCard from "../LiteratureCard/LiteratureCard";

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

export default function Catalog({ genreId }: { genreId: number }) {
  const [catalogData, setCatalogData] = useState<Literature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get<Literature[]>(
          `${getApiURL()}/literature/genre/${genreId}?limit=6`
        );
        setCatalogData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [genreId]);

  if (loading) {
    return (
      <div className="mt-6">
        <h1 className="font-bold text-2xl">Loading genre...</h1>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} className="h-[350px] w-full rounded" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {catalogData.length > 0 && (
        <>
          <div>
            <h1 className="font-bold text-4xl mb-2">
              {catalogData.length > 0 && catalogData[0].genre.genreTitle}
            </h1>
            <hr />
          </div>
          <div className="mt-6">
            <Carousel className="w-full flex flex-col" opts={{ loop: false }}>
              <CarouselContent>
                {catalogData.slice(0, 6).map((item) => (
                  <CarouselItem key={item.literatureId} className="basis-1/3">
                    <LiteratureCard item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex flex-row gap-4 my-4 self-center">
                <CarouselPrevious
                  className="carousel-btn"
                  variant={"link"}
                  style={{
                    all: "initial",
                    color: "black",
                    cursor: "pointer",
                  }}
                />
                1 of {catalogData.length}
                <CarouselNext
                  className="carousel-btn"
                  variant={"link"}
                  style={{
                    all: "initial",
                    color: "black",
                    cursor: "pointer",
                  }}
                />
              </div>
            </Carousel>
          </div>
        </>
      )}
    </div>
  );
}
