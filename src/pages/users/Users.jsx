import ProfileLink from "../../components/profile/ProfileLink";
import { useContext, useState } from "react";

import { AuthContext } from "../../context/authContext";
import "./users.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";

const Users = () => {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);
  const [followerInputText, setFollowerInputText] = useState("");
  const [followingInputText, setFollowingInputText] = useState("");

  let followerInputHandler = (e) => {
    // convert input text to lowercase
    var lowerCase = e.target.value.toLowerCase();
    setFollowerInputText(lowerCase);
  };

  let followingInputHandler = (e) => {
    // convert input text to lowercase
    var lowerCase = e.target.value.toLowerCase();
    setFollowingInputText(lowerCase);
  };

  const {
    isLoading: isFollowersLoading,
    error: followerError,
    data: followerData,
  } = useQuery({
    queryKey: ["followers"],
    queryFn: () => makeRequest.get("/users/followers").then((res) => res.data),
  });

  const {
    isLoading: isFollowingLoading,
    error: followingError,
    data: followingData,
  } = useQuery({
    queryKey: ["following"],
    queryFn: () => makeRequest.get("/users/following").then((res) => res.data),
  });

  const getFollowerList = () => {
    if (followerError) {
      console.error("Error fetching user data:", followerError);
      return null;
    }

    if (!isFollowersLoading && followerData && Array.isArray(followerData)) {
      const filteredUsers = followerData.filter((user) =>
        user.username.includes(followerInputText),
      );
      return (
        <div className="user-list">
          {filteredUsers.slice(0, 16).map((user) => (
            <ProfileLink
              to={"/profile/" + user.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="user" key={user.id}>
                <img className="profilePic" src={user.profilePic} />
                <span>{user.username}</span>
                {/* <button>{user.following === 1 ? "Following" : "Follow"}</button> */}
              </div>
            </ProfileLink>
          ))}
        </div>
      );
    }

    return null;
  };

  const getFollowingList = () => {
    if (followingError) {
      console.error("Error fetching user data:", followingError);
      return null;
    }

    if (!isFollowingLoading && followingData && Array.isArray(followingData)) {
      const filteredUsers = followingData.filter((user) =>
        user.username.includes(followingInputText),
      );
      return (
        <div className="user-list">
          {filteredUsers.slice(0, 16).map((user) => (
            <ProfileLink
              to={"/profile/" + user.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="user" key={user.id}>
                <img className="profilePic" src={user.profilePic} />
                <span>{user.username}</span>
                {/* <button>Following</button> */}
              </div>
            </ProfileLink>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="users">
      <h1>{t("users.build")}</h1>
      <div className="user-category">
        <div className="row">
          <h3>{t("users.following")}</h3>
          {followingData && !isFollowingLoading && (
            <span>({followingData.length})</span>
          )}
        </div>
        <div className="search">
          <TextField
            id="outlined-basic"
            onChange={followingInputHandler}
            variant="outlined"
            fullWidth
            label={t("users.search")}
          />
        </div>
        {isFollowingLoading || !followingData ? "loading" : getFollowingList()}
      </div>
      <div className="user-category">
        <div className="row">
          <h3>{t("users.followers")}</h3>
          {followerData && !isFollowersLoading && (
            <span>({followerData.length})</span>
          )}
        </div>
        <div className="search">
          <TextField
            id="outlined-basic"
            onChange={followerInputHandler}
            variant="outlined"
            fullWidth
            label={t("users.search")}
          />
        </div>
        {isFollowersLoading || !followerData ? "loading" : getFollowerList()}
      </div>
    </div>
  );
};

export default Users;
