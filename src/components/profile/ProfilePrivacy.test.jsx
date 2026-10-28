import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import Profile from "./Profile";

jest.mock("../../axios", () => ({ makeRequest: { get: jest.fn() } }));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock("../../components/posts/Posts", () => () => null);
jest.mock("../../components/update/Update", () => () => null);
jest.mock("../../components/service/SubmitService", () => () => null);
jest.mock("../../components/escrow/InviteStudent", () => () => null);
jest.mock("../../components/service/ServiceCard", () => () => null);
jest.mock("../../components/project/ProjectCard", () => () => null);

beforeEach(() => {
  jest.clearAllMocks();
  makeRequest.get.mockImplementation(() => new Promise(() => {}));
});

function setup(user) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  client.setQueryData(["user", user?.id || "anonymous", 2], {
    id: 2,
    username: "Cached private identity",
    email: "private@example.com",
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuthContext.Provider value={{ currentUser: user }}>
          <Profile userId={2} />
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

test.each(["student", "local", "admin"])(
  "%s cannot render or request another user's profile, even from cache",
  (role) => {
    setup({ id: 3, account_type: role, is_admin: role === "admin" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "privacy.ownProfileOnly",
    );
    expect(
      screen.queryByText("Cached private identity"),
    ).not.toBeInTheDocument();
    expect(makeRequest.get).not.toHaveBeenCalled();
  },
);

test("guests see a login link and do not request a profile", () => {
  setup(null);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/login");
  expect(makeRequest.get).not.toHaveBeenCalled();
});

test.each(["student", "local", "admin"])(
  "%s can request their own profile",
  (role) => {
    setup({ id: 2, account_type: role });
    expect(makeRequest.get).toHaveBeenCalledWith("/users/find/2");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);
