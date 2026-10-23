import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import ProfileLink from "./ProfileLink";

jest.mock("../../axios", () => ({ makeRequest: {} }));

test.each(["student", "local", "admin"])("%s sees another person's name without a blocked profile link", (role) => {
  render(<MemoryRouter><AuthContext.Provider value={{ currentUser: { id: 3, account_type: role } }}><ProfileLink to="/profile/2">Visible identity</ProfileLink></AuthContext.Provider></MemoryRouter>);
  expect(screen.getByText("Visible identity")).toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
test("the owner retains their profile link", () => {
  render(<MemoryRouter><AuthContext.Provider value={{ currentUser: { id: "2" } }}><ProfileLink to="/profile/2">My profile</ProfileLink></AuthContext.Provider></MemoryRouter>);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/profile/2");
});
