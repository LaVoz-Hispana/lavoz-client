import { useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import "./user.scss";

const User = ({ user }) => {
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;
  const selected = user.id;
  const handleFollow = (id) => {
    // mutation.mutate(user.following === true);
    return makeRequest.post[("/relationships/follow", id)];
  };

  const mutation = useMutation({
    mutationFn: (following) => {
      const endpoint = following
        ? "/relationships/unfollow"
        : "/relationships/follow";
      return makeRequest[following ? "delete" : "post"](endpoint, { selected });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["relationship"]);
    },
  });

  console.log(user);

  return (
    <div className="user-icon" key={user.id}>
      <img className="profilePic" src={user.profilePic} />
      <span>{user.username}</span>
      <button onClick={handleFollow(user.id)}>
        {user.following === 1 ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default User;
