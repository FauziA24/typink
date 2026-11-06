export interface Genre {
  genreId: number;
  genreTitle: string;
}

export interface User {
  userId: string;
  username: string;
  imgUrl: string;
  imageUrl?: string;
}

export interface Chapter {
  chapterId: number;
  chapterTitle: string;
  content: string;
  created_at: string;
  imageUrl: string;
  voteCount: number;
  vote: string;
}

export interface Literature {
  literatureId: number;
  title: string;
  synopsis: string;
  imageUrl: string;
  genre: Genre;
  users: User;
  chapters: Chapter[];
  language: string;
  copyright: number;
}

export interface TopPicks {
  literatureId: number;
  title: string;
  synopsis: string;
  imageUrl: string;
  genre: Genre;
  users: User;
  chapters: Chapter[];
  _count: {
    Vote: number;
  };
}

export interface ForumPost {
  forumId: number;
  created_at: string;
  userId: string;
  title: string;
  genreId: number;
  forumType: string;
  voteCount: number;
}

export interface ForumComment {
  forumCommentId: number;
  content: string;
  userId: string;
  users: {
    username: string;
    userId: string;
    imageUrl: string;
  };
  created_at: Date;
  vote: string;
  voteCount: number;
  parentCommentId?: number | null;
}

export interface LiteratureComment {
  literatureCommentId: number;
  content: string;
  userId: string;
  users: {
    username: string;
    userId: string;
    imageUrl: string;
  };
  created_at: Date;
  vote: string;
  voteCount: number;
  parentCommentId?: number | null;
}

export interface ChapterComment {
  chapterCommentId: number;
  content: string;
  userId: string;
  users: {
    username: string;
    userId: string;
    imageUrl: string;
  };
  created_at: Date;
  vote: string;
  voteCount: number;
  parentCommentId?: number | null;
}

export interface ForumData {
  forumId: number;
  title: string;
  content: string;
  genreId: number;
  forumType: string;
  userId: string;
  created_at: string;
  users: User;
  forumComments: ForumComment[];
  vote: string;
  voteCount: number;
  _count: {
    forumComments: number;
  };
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface Chapter {
  chapterId: number;
  created_at: string;
  literatureId: number;
  chapterTitle: string;
  chapterNumber: number;
  imageUrl: string;
  content: string;
  voteCount: number;
  status?: "draft" | "published";
  scheduledAt?: string | null;
}

export interface LiteratureData {
  literatureId: number;
  created_at: string;
  authorId: string;
  title: string;
  synopsis: string;
  imageUrl: string;
  genreId: number;
  language: string;
  copyright: number;
  voteCount: number;
  genre: {
    genreId: number;
    created_at: string;
    genreTitle: string;
  };
  chapters: Chapter[];
  users: {
    username: string;
    userId: string;
  };
  vote: string;
  donated: boolean;
  saved: boolean;
}

export interface Transaction {
  transactionId: number;
  userId: string;
  value: number;
  transactionType: string;
  created_at: Date;
  message: string;
  paymentMethod?: string;
  status?: string;
  provider?: string;
}
