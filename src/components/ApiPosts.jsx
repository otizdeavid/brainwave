
import { useCallback, useEffect, useState } from "react";
import { apiGetPosts } from "../services/api";

function ApiPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGetPosts();
      setPosts(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading) {
    return (
      <p className="p-4 text-sm text-n-3" role="status">
        Loading posts...
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 p-4">
        <p className="text-sm text-red-500" role="alert">
          Could not load posts: {error}
        </p>
        <button
          onClick={loadPosts}
          className="rounded-xl bg-color-1 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="p-4 text-sm text-n-3">
        No posts are available right now.
      </p>
    );
  }

  return (
    <section className="w-full min-w-0 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-n-1">
          API Practice
        </h2>
        <p className="mt-1 text-sm text-n-3">
          Sample posts loaded from an external API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="min-w-0 rounded-2xl border border-n-6 bg-n-7 p-4"
          >
            <p className="mb-2 text-xs text-n-3">
              Post #{post.id}
            </p>
            <h3 className="break-words font-semibold text-n-1">
              {post.title}
            </h3>
            <p className="mt-3 break-words text-sm leading-6 text-n-3">
              {post.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ApiPosts;