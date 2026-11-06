import "./style.scss";
import { useNavigate } from "react-router-dom";

// Define the interface for props
interface Genre {
  genreId: number;
  genreTitle: string;
}

interface User {
  userId: string;
  username: string;
}

interface Literature {
  literatureId: number;
  title: string;
  synopsis: string;
  imageUrl: string;
  genre: Genre;
  users: User;
}

interface LiteratureCardProps {
  item: Literature;
}

export default function LiteratureCard({ item }: LiteratureCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="literature-card group cursor-pointer w-full"
      onClick={() => navigate(`/read/${item.literatureId}`)}
    >
      <div className="relative h-[350px] overflow-hidden rounded-sm bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100">
          <p className="line-clamp-5 p-4 text-sm text-white">{item.synopsis}</p>
        </div>
      </div>
      <h4 className="font-semibold mt-2 line-clamp-2">{item.title}</h4>
      <p className="text-sm text-gray-500 line-clamp-1">{item.users.username}</p>
    </div>
  );
}
