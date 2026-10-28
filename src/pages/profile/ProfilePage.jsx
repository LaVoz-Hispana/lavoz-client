import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import Posts from "../../components/posts/Posts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
import Update from "../../components/update/Update";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { useTranslation } from "react-i18next";
import Profile from "../../components/profile/Profile";

function ProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="profile">
      <Profile userId={userId} />
    </div>
  );
}

export default ProfilePage;
