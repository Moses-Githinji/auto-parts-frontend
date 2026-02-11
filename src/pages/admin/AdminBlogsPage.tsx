import { useEffect, useState, useCallback } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ImageUpload } from "../../components/ui/ImageUpload";
import { BlogEditor } from "../../components/ui/BlogEditor";
import { notify } from "../../stores/notificationStore";
import { useBlogStore } from "../../stores/blogStore";
import type {
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from "../../types/blog";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  featuredImage: string;
  isPublished: boolean;
}

const initialFormData: BlogFormData = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  category: "",
  tags: "",
  featuredImage: "",
  isPublished: false,
};

export function AdminBlogsPage() {
  // notify is imported directly from the store module
  const {
    posts,
    categories,
    isLoadingPosts,
    postsError,
    postsPagination,
    fetchPosts,
    fetchCategories,
    createPost,
    updatePost,
    deletePost,
    clearError,
  } = useBlogStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  const handleSearch = useCallback(() => {
    fetchPosts(searchQuery);
  }, [fetchPosts, searchQuery]);

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug || "",
        content: post.content,
        excerpt: post.excerpt || "",
        category: post.category?.id || "",
        tags: post.tags?.join(", ") || "",
        featuredImage: post.featuredImage || "",
        isPublished: post.isPublished,
      });
    } else {
      setEditingPost(null);
      setFormData(initialFormData);
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setFormData(initialFormData);
    setFormError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      // Auto-generate slug from title if title changes and slug is empty or was auto-generated
      ...(name === "title" &&
      (!prev.slug || prev.slug === generateSlug(prev.title))
        ? { slug: generateSlug(value) }
        : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug || undefined,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category: formData.category || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        featuredImage: formData.featuredImage || undefined,
        published: formData.isPublished,
      };

      if (editingPost) {
        await updatePost(editingPost.id, postData as UpdateBlogPostRequest);
        notify.success("Post updated successfully!");
      } else {
        await createPost(postData as CreateBlogPostRequest);
        notify.success("Post created successfully!");
      }

      // Clear draft from localStorage
      localStorage.removeItem("blog-draft");
      handleCloseModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save post";
      setFormError(errorMessage);
      notify.error("Failed to save post: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(id);
        notify.success("Post deleted successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete post";
        notify.error("Failed to delete post: " + errorMessage);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleUploadError = (message: string) => {
    setFormError(message);
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Blog Posts</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Manage blog posts, categories, and tags.
            </p>
          </div>
          <Button
            className="bg-[#2b579a] text-white hover:bg-[#2b579a]/90 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => handleOpenModal()}
          >
            Create Post
          </Button>
        </div>

        {postsError && (
          <div className="mb-4 rounded bg-red-50 p-4 text-sm text-red-600">
            {postsError}
            <button className="ml-2 underline" onClick={() => clearError()}>
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded border border-slate-300 dark:border-dark-border px-4 py-2 text-sm focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none focus:ring-1 focus:ring-[#2b579a] dark:bg-dark-bgLight dark:text-dark-text"
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            className="border-slate-300 dark:border-dark-border dark:text-gray-500 dark:bg-dark-bgLight dark:hover:bg-dark-bgLight dark:hover:text-dark-text "
          >
            Search
          </Button>
        </div>

        {isLoadingPosts ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2b579a] border-t-transparent"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white dark:bg-dark-bgLight p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">No blog posts found.</p>
            <Button
              className="mt-4 bg-[#2b579a] text-white hover:bg-[#2b579a]/90"
              onClick={() => handleOpenModal()}
            >
              Create your first post
            </Button>
          </div>
        ) : (
          <div className="rounded-sm border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-bg">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Author
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Date
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-700 dark:text-dark-text">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-slate-200 dark:border-dark-border">
                    <td className="px-4 py-3 text-slate-900 dark:text-dark-text">{post.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                      {post.author
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                      {post.category?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {post.isPublished ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {postsPagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-[#c8c8c8] dark:border-dark-border px-4 py-3">
                <span className="text-sm text-slate-600 dark:text-dark-textMuted">
                  Showing {(postsPagination.page - 1) * 20 + 1} to{" "}
                  {Math.min(postsPagination.page * 20, postsPagination.total)}{" "}
                  of {postsPagination.total} posts
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={postsPagination.page === 1}
                    onClick={() =>
                      fetchPosts(searchQuery, postsPagination.page - 1)
                    }
                    className="border-slate-300 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={postsPagination.page === postsPagination.pages}
                    onClick={() =>
                      fetchPosts(searchQuery, postsPagination.page + 1)
                    }
                    className="border-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-dark-bgLight p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-[#2b579a] dark:focus:ring-blue-500 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-[#2b579a] dark:focus:ring-blue-500 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                    placeholder="Auto-generated from title if empty"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-[#2b579a] dark:focus:ring-blue-500 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                    placeholder="Brief description of the post"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                    Content *
                  </label>
                  <BlogEditor
                    value={formData.content}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, content }))
                    }
                    onImageUpload={(url) => console.log("Image uploaded:", url)}
                    placeholder="Write your content in Markdown..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-[#2b579a] dark:focus:ring-blue-500 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-[#2b579a] dark:focus:ring-blue-500 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div>
                  <ImageUpload
                    value={formData.featuredImage}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, featuredImage: url }))
                    }
                    onError={handleUploadError}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300 text-[#2b579a] focus:ring-[#2b579a]"
                  />
                  <label
                    htmlFor="isPublished"
                    className="text-sm font-medium text-slate-700 dark:text-dark-text"
                  >
                    Publish immediately
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="border-slate-300 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2b579a] text-white hover:bg-[#2b579a]/90 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingPost
                      ? "Update Post"
                      : "Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BackofficeLayout>
  );
}
