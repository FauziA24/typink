/* eslint-disable react-refresh/only-export-components */
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
export const categories = [
  "Cyberpunk",
  "Horror",
  "Young Adult",
  "Adventure",
  "Bildungsroman",
  "Children's",
  "Romance",
  "Fantasy",
  "Historycal Fiction",
  "Dark",
];

export default function LeftBar() {
  const navigate = useNavigate();

  return (
    <div className="bg-white pt-4 rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Categories</h2>
      <ul className="space-y-3">
        {categories.map((category, index) => (
          <li key={index} className="text-sm text-gray-700 hover:underline">
            <Button
              variant={"link"}
              onClick={() => navigate(`/novels/category/${index + 1}`)}
            >
              {category}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
