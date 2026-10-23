import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../i18n";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import BrowseProjects from "./BrowseProjects";
jest.mock("../../axios", () => ({ makeRequest: { get: jest.fn() } }));
jest.mock("../../components/project/ProjectCard", () => ({ project }) => <p>{project.title}</p>);
jest.mock("../../components/project/SubmitProject", () => () => null);
test("provider cards open a working filtered project list instead of a private profile", async () => {
  await i18n.changeLanguage("en");
  makeRequest.get.mockImplementation(async (url) => ({ data: url.includes("/users")
    ? [{ id: 3, account_type: "local", providerDisplayName: "Example Company", provider_type: "company" }]
    : [{ id: 5, userId: 3, status: "open", title: "Design project" }, { id: 6, userId: 4, status: "open", title: "Other provider project" }] }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><I18nextProvider i18n={i18n}><AuthContext.Provider value={{ currentUser: { id: 2, account_type: "student" } }}><MemoryRouter><BrowseProjects /></MemoryRouter></AuthContext.Provider></I18nextProvider></QueryClientProvider>);
  const card = await screen.findByRole("link", { name: /Example Company/ });
  expect(card).toHaveAttribute("href", "/projects?tab=projects&provider=3");
  fireEvent.click(card);
  expect(await screen.findByText("Design project")).toBeInTheDocument();
  expect(screen.queryByText("Other provider project")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Show all providers" }));
  await waitFor(() => expect(screen.getByText("Other provider project")).toBeInTheDocument());
});
