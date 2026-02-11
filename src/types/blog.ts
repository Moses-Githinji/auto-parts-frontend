export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  categoryId?: string;
  publishedAt?: string;
  featuredImage?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  tags?: { tag: { id: string; name: string; slug: string } }[];
  // Interaction state (populated when authenticated)
  isLiked?: boolean;
  isSaved?: boolean;
  userRating?: number;
  // Aggregates
  averageRating?: number;
  ratingsCount?: number;
  _count?: {
    likes: number;
    comments: number;
    saves: number;
    ratings: number;
  };
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
}

export interface BlogPostResponse {
  post: BlogPost;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
  _count?: {
    posts: number;
  };
}

export interface BlogCategoriesResponse {
  categories: BlogCategory[];
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export interface BlogCommentListResponse {
  comments: BlogComment[];
  total: number;
}

export interface RateBlogPostRequest {
  value: number;
}

export interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  published?: boolean;
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {}

export interface AddCommentRequest {
  content: string;
}

export interface LikeResponse {
  liked: boolean;
}

export interface SaveResponse {
  saved: boolean;
}

export interface RatingResponse {
  rating: { id: string; value: number };
  averageRating: number;
  ratingsCount: number;
}
