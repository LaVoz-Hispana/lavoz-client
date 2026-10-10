import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../context/authContext";
import { makeRequest } from "../axios";

export function useResumes() {
  const { currentUser } = useContext(AuthContext);
  return useQuery({
    queryKey: ["resumes", currentUser?.id],
    queryFn: () => makeRequest.get("/resumes").then((res) => res.data),
    enabled: currentUser?.account_type === "student",
  });
}
