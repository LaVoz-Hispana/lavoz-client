import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import Post from "../components/post/Post";
import { makeRequest } from "../axios";

const TestPosts = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["test"],
    queryFn: () => makeRequest.get("/posts/test").then((res) => res.data),
  });

  return (
    <div className="posts">
      {error
        ? "Something went wrong!"
        : isLoading
          ? "Loading..."
          : data.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
};

const Test = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <p>Testing</p>
        <TestPosts />
      </div>
    </QueryClientProvider>
  );
};

export default Test;
