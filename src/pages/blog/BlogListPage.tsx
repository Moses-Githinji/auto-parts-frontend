import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Search, 
  Calendar, 
  User, 
  Tag as TagIcon, 
  ChevronLeft, 
  ChevronRight,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useBlogStore } from "../../stores/blogStore";

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  
  const { 
    posts, 
    categories, 
    isLoadingPosts, 
    isLoadingCategories, 
    postsPagination, 
    fetchPosts, 
    fetchCategories 
  } = useBlogStore();

  const page = parseInt(searchParams.get("page") || "1");
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");

  useEffect(() => {
    console.log("BlogListPage: Posts from store:", posts);
  }, [posts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Construct search string for API
    // The store's fetchPosts handles the API call logic
    // We might need to adjust the store to accept more filters if not already supported
    // For now assuming fetchPosts accepts (search, page)
    
    // NOTE: The current store implementation only accepts search and page.
    // Ideally we'd pass category/tag too. 
    // To support category/tag filters with the existing store, we'd need to update the store 
    // or just pass them as part of the search string if the API supports it, 
    // or update the store to accept query params object.
    
    // For this implementation, I'll pass the search term and page. 
    // If the backend store needs update for category, I'll do that next.
    fetchPosts(searchTerm, page, categorySlug || "", tagSlug || "");
  }, [fetchPosts, searchTerm, page, categorySlug, tagSlug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchTerm) prev.set("search", searchTerm);
      else prev.delete("search");
      prev.set("page", "1"); // Reset to page 1 on search
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set("page", newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (slug: string) => {
    setSearchParams(prev => {
      if (slug === categorySlug) prev.delete("category");
      else prev.set("category", slug);
      prev.set("page", "1");
      return prev;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text">AutoParts Blog</h1>
          <p className="mt-2 text-slate-600 dark:text-dark-textMuted">
            Tips, guides, and news for car enthusiasts and mechanics.
          </p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-dark-text">Categories</h3>
            {isLoadingCategories ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-dark-bg"></div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategoryClick("")}
                    className={`block w-full text-left text-sm transition-colors ${
                      !categorySlug 
                        ? "font-semibold text-[#FF9900]" 
                        : "text-slate-600 dark:text-dark-textMuted hover:text-[#FF9900]"
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category.slug)}
                      className={`flex w-full items-center justify-between text-sm transition-colors ${
                        categorySlug === category.slug
                          ? "font-semibold text-[#FF9900]"
                          : "text-slate-600 dark:text-dark-textMuted hover:text-[#FF9900]"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="rounded-full bg-slate-100 dark:bg-dark-bg px-2 py-0.5 text-xs text-slate-500 dark:text-dark-textMuted">
                        {category._count?.posts || category.postCount || 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isLoadingPosts ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
                  <div className="h-48 w-full animate-pulse bg-slate-200 dark:bg-dark-bg"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-dark-bg"></div>
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-dark-bg"></div>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-dark-bg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <article 
                    key={post.id} 
                    className="flex flex-col rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <Link to={`/blog/${post.slug}`} state={{ id: post.id }} className="group relative block h-48 overflow-hidden bg-slate-100 dark:bg-dark-bg">
                      {post.featuredImage ? (
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-dark-textMuted">
                          <TagIcon className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      {post.category && (
                        <span className="absolute left-4 top-4 rounded bg-[#FF9900] px-2 py-1 text-xs font-bold text-[#131921]">
                          {post.category.name}
                        </span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-center gap-4 text-xs text-slate-500 dark:text-dark-textMuted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "Draft"}
                        </span>
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author.firstName} {post.author.lastName}
                          </span>
                        )}
                      </div>
                      <Link to={`/blog/${post.slug}`} state={{ id: post.id }} className="mb-2 block">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text transition-colors hover:text-[#FF9900]">
                          {post.title}
                        </h2>
                      </Link>
                      <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-dark-textMuted">
                        {post.excerpt || "No excerpt available."}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/blog/${post.slug}`}
                          state={{ id: post.id }}
                          className="text-sm font-semibold text-[#FF9900] hover:underline"
                        >
                          Read Article →
                        </Link>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 2).map((tagWrapper) => (
                              <Badge key={tagWrapper.tag.id} variant="outline" className="text-[10px] bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-textMuted">
                                {tagWrapper.tag.name}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <span className="text-[10px] text-slate-500">+{post.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {postsPagination.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(postsPagination.page - 1)}
                    disabled={postsPagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-dark-textMuted">
                    Page {postsPagination.page} of {postsPagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(postsPagination.page + 1)}
                    disabled={postsPagination.page === postsPagination.pages}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-dark-border p-12 text-center">
              <div className="mb-4 rounded-full bg-slate-100 dark:bg-dark-bg p-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">No articles found</h3>
              <p className="mt-1 text-slate-600 dark:text-dark-textMuted">
                Try adjusting your search or category filter.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSearchParams({});
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
