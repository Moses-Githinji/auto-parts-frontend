import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import {
  User,
  Tag as TagIcon,
  ThumbsUp,
  Bookmark,
  Share2,
  MessageSquare,
  Star,
  Loader2,
  ArrowLeft,
  Send
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { useBlogStore } from "../../stores/blogStore";
import { useAuthStore } from "../../stores/authStore";
import apiClient from "../../lib/apiClient";
import type { BlogComment, BlogCommentListResponse } from "../../types/blog";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { currentPost, isLoadingPosts, postsError, fetchPost, clearCurrentPost } = useBlogStore();

  console.log("BlogPostPage: Rendered", { slug, locationState: location.state });

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Interaction states (local optimistic updates)
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const stateParams = location.state as { id?: string } | null;
    const id = stateParams?.id;

    console.log("BlogPostPage: Effect running", { slug, id });

    if (id) {
      console.log("BlogPostPage: Fetching by ID", id);
      fetchPost(id);
    } else if (slug) {
      console.log("BlogPostPage: Fetching by slug", slug);
      fetchPost(slug);
    } else {
      console.warn("BlogPostPage: No ID or slug found!");
    }
    return () => clearCurrentPost();
  }, [slug, location.state, fetchPost, clearCurrentPost]);

  // Sync local state with fetched post
  useEffect(() => {
    console.log("BlogPostPage: currentPost from store:", currentPost);
    if (currentPost) {
      setIsLiked(currentPost.isLiked || false);
      setLikesCount(currentPost._count?.likes || 0);
      setIsSaved(currentPost.isSaved || false);
      setUserRating(currentPost.userRating || 0);
      fetchComments(currentPost.id);
    }
  }, [currentPost]);

  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await apiClient.get<BlogCommentListResponse>(
        `/api/blog/posts/${postId}/comments?limit=20`
      );
      setComments(response.comments);
      setTotalComments(response.total);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!currentPost) return;

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      await apiClient.post(`/api/blog/posts/${currentPost.id}/like`);
    } catch (err) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async () => {
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!currentPost) return;

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      await apiClient.post(`/api/blog/posts/${currentPost.id}/save`);
    } catch (err) {
      setIsSaved(!newSavedState);
    }
  };

  const handleRate = async (value: number) => {
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!currentPost) return;

    const oldRating = userRating;
    setUserRating(value);

    try {
      await apiClient.post(`/api/blog/posts/${currentPost.id}/rate`, { value });
    } catch (err) {
      setUserRating(oldRating);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!currentPost || !commentContent.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await apiClient.post<{ comment: BlogComment }>(
        `/api/blog/posts/${currentPost.id}/comments`, 
        { content: commentContent }
      );
      setComments(prev => [response.comment, ...prev]);
      setTotalComments(prev => prev + 1);
      setCommentContent("");
    } catch (err) {
      console.error("Failed to submit comment", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoadingPosts) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  if (postsError || !currentPost) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text">Post not found</h2>
        <p className="mt-2 text-slate-600 dark:text-dark-textMuted">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/blog">
          <Button className="mt-6">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(currentPost.content);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb / Back */}
      <Link 
        to="/blog" 
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#FF9900]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Articles
      </Link>

      {/* Header */}
      <header className="mb-8">
        {currentPost.category && (
          <Link to={`/blog?category=${currentPost.category.slug || currentPost.category.id}`}>
            <Badge className="mb-4 bg-[#FF9900] text-[#131921] hover:bg-[#FF9900]/80">
              {currentPost.category.name}
            </Badge>
          </Link>
        )}
        <h1 className="mb-4 text-3xl font-extrabold text-slate-900 dark:text-dark-text md:text-5xl">
          {currentPost.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-dark-textMuted">
          <div className="flex items-center gap-2">
            {currentPost.author?.avatarUrl ? (
              <img 
                src={currentPost.author.avatarUrl} 
                alt={currentPost.author.firstName}
                className="h-10 w-10 rounded-full object-cover" 
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-dark-bg">
                <User className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 dark:text-dark-text">
                {currentPost.author?.firstName} {currentPost.author?.lastName}
              </p>
              <p className="text-xs">
                {currentPost.publishedAt ? format(new Date(currentPost.publishedAt), "MMMM d, yyyy") : "Draft"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-dark-border pl-6">
            <div className="flex items-center gap-1" title={`${likesCount} likes`}>
              <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-blue-500 text-blue-500" : ""}`} />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-1" title={`${comments.length} comments`}>
              <MessageSquare className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>
            {currentPost.averageRating && (
              <div className="flex items-center gap-1" title={`Average rating: ${currentPost.averageRating}`}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{currentPost.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {currentPost.featuredImage && (
        <div className="mb-8 overflow-hidden rounded-xl bg-slate-100 dark:bg-dark-bg aspect-video">
          <img 
            src={currentPost.featuredImage} 
            alt={currentPost.title} 
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="grid gap-12 lg:grid-cols-[1fr_240px]">
        <main>
          <article 
            className="prose prose-slate dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-dark-border pt-6">
              <TagIcon className="h-4 w-4 text-slate-400" />
              {currentPost.tags.map((wrapper) => (
                <Link key={wrapper.tag.id} to={`/blog?tag=${wrapper.tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-slate-100 dark:hover:bg-dark-bg cursor-pointer">
                    {wrapper.tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="mb-12 flex items-center justify-between rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-4">
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={isLiked ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
                onClick={handleLike}
              >
                <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={isSaved ? "text-[#FF9900] bg-orange-50 dark:bg-orange-900/20" : ""}
                onClick={handleSave}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="mr-2 text-sm font-medium text-slate-600 dark:text-dark-textMuted">Rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  onClick={() => handleRate(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-5 w-5 ${
                      star <= userRating 
                        ? "fill-[#F7CA00] text-[#F7CA00]" 
                        : "text-slate-300 dark:text-slate-600"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <section id="comments" className="scroll-mt-20">
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-dark-text">
              Comments ({totalComments})
            </h3>
            
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8 flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#FF9900] flex items-center justify-center text-[#131921] font-bold">
                  {user.firstName?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={commentContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentContent(e.target.value)}
                    placeholder="Add to the discussion..."
                    className="mb-2 min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmittingComment || !commentContent.trim()}>
                      {isSubmittingComment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 rounded-lg bg-slate-50 dark:bg-dark-bg p-6 text-center">
                <p className="mb-4 text-slate-600 dark:text-dark-textMuted">Log in to join the conversation.</p>
                <Link to="/login" state={{ from: location.pathname }}>
                  <Button variant="outline">Log In / Register</Button>
                </Link>
              </div>
            )}

            <div className="space-y-6">
              {isLoadingComments ? (
                <div className="py-8 text-center text-slate-500">Loading comments...</div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    {comment.user?.avatarUrl ? (
                      <img 
                        src={comment.user.avatarUrl} 
                        alt={comment.user.firstName}
                        className="h-10 w-10 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-dark-bg text-slate-600 dark:text-dark-text">
                        {comment.user?.firstName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-dark-text">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-dark-textMuted">
                          {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-dark-textMuted leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-slate-500 italic">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </section>
        </main>

        {/* Sticky Sidebar (Share, etc) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-lg border border-slate-200 dark:border-dark-border p-4">
              <h4 className="mb-3 font-semibold text-slate-900 dark:text-dark-text">Share this article</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Share on Twitter">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </Button>
                <Button variant="outline" size="icon" title="Share on Facebook">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </Button>
                <Button variant="outline" size="icon" title="Copy Link" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // Could show toast here
                }}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg bg-[#F7CA00]/10 p-4 border border-[#F7CA00]/30">
              <h4 className="mb-2 text-sm font-bold text-[#131921] dark:text-[#F7CA00]">Join the Community</h4>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted mb-3">
                Get the latest auto maintenance tips delivered to your inbox.
              </p>
              <Input placeholder="Enter your email" className="mb-2 h-8 text-xs bg-white" />
              <Button size="sm" className="w-full bg-[#131921] text-white hover:bg-[#232F3E]">Subscribe</Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
