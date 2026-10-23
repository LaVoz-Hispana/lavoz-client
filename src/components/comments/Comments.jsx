import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Comment from "../comment/Comment";
import InputEmoji from 'react-input-emoji';

const Comments = ({ post }) => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const queryClient = useQueryClient();

  const handleClick = () => {
    const postId = post.id;
    const postUserId = post.userId;
    mutation.mutate({ desc, postId, postUserId });
    setDesc("");
  };

  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["comments"]);
    },
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", currentUser?.id || "anonymous", post.id],
    queryFn: () => makeRequest.get("/comments?postId=" + post.id).then((res) => {return res.data})
  });


  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.profilePic} alt="" />
        <InputEmoji 
          placeholder="write a comment" 
          value={desc}
          onChange={setDesc}
          borderRadius = {10}
        />
        <button className="submit" onClick={handleClick}>Send</button>
      </div>
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((comment) => (
          (<Comment comment={comment} key={comment.id} />)
        )
      )}
    </div>
  );
};

export default Comments;
