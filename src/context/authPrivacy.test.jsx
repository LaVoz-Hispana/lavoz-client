import { useContext } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, AuthContextProvider } from "./authContext";
import { makeRequest } from "../axios";

jest.mock("../axios", () => ({ makeRequest: { post: jest.fn() } }));
function Session() {
  const { currentUser, clearUser, login } = useContext(AuthContext);
  return (
    <>
      <span>{currentUser?.username || "Guest"}</span>
      <button onClick={clearUser}>Logout</button>
      <button onClick={() => login({})}>Login</button>
    </>
  );
}
function setup() {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <AuthContextProvider>
        <Session />
      </AuthContextProvider>
    </QueryClientProvider>,
  );
  client.setQueryData(["user", 3, 2], { email: "private@example.com" });
  client.setQueryData(
    ["applications", 3, "owner", 5],
    [{ applicant: { username: "Private Student" } }],
  );
  return client;
}
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
test("logout clears profile and applicant caches along with persisted credentials", () => {
  localStorage.setItem(
    "user",
    JSON.stringify({ id: 3, username: "Provider", account_type: "local" }),
  );
  localStorage.setItem("accessToken", "old-token");
  const client = setup();
  fireEvent.click(screen.getByText("Logout"));
  expect(screen.getByText("Guest")).toBeInTheDocument();
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(localStorage.getItem("user")).toBeNull();
  expect(localStorage.getItem("accessToken")).toBeNull();
});
test("login switches accounts with an empty private cache", async () => {
  makeRequest.post.mockResolvedValue({
    data: {
      id: 4,
      username: "New Student",
      account_type: "student",
      token: "new-token",
    },
  });
  const client = setup();
  fireEvent.click(screen.getByText("Login"));
  await screen.findByText("New Student");
  expect(client.getQueryCache().getAll()).toHaveLength(0);
  expect(localStorage.getItem("accessToken")).toBe("new-token");
});
test("account changes in another tab clear cached private data", () => {
  const client = setup();
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: 4,
      username: "Other Account",
      account_type: "student",
    }),
  );
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: "user" })));
  expect(screen.getByText("Other Account")).toBeInTheDocument();
  expect(client.getQueryCache().getAll()).toHaveLength(0);
});
test("legacy persisted registration passwords are removed on startup", async () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: 3,
      username: "Provider",
      password: "secret",
      confirmPassword: "secret",
    }),
  );
  setup();
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      id: 3,
      username: "Provider",
    }),
  );
});
