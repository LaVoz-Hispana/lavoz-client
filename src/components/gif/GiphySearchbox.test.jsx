import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GiphySearchbox from "./GiphySearchbox";

jest.mock("@giphy/react-components", () => {
  const React = require("react");
  const SearchContext = React.createContext({
    fetchGifs: jest.fn(),
    searchKey: "trending",
  });
  return {
    SearchContext,
    SearchContextManager: ({ children }) => children,
    SearchBar: () => <input aria-label="Search GIPHY" />,
    Grid: ({ onGifClick, noLink, columns, width }) => (
      <button
        data-columns={columns}
        data-width={width}
        onClick={(event) => {
          onGifClick(
            { id: "123", embed_url: "https://giphy.com/embed/123" },
            event,
          );
          if (!noLink || !event.defaultPrevented)
            throw new Error("GIF selection must not navigate");
        }}
      >
        Select GIF
      </button>
    ),
  };
});

test("selecting a GIF preserves the embed URL used by comments without navigating", () => {
  const onSelect = jest.fn();
  render(<GiphySearchbox apiKey="test-key" onSelect={onSelect} />);
  expect(
    screen.getByRole("textbox", { name: "Search GIPHY" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Select GIF" }));
  expect(onSelect).toHaveBeenCalledWith({
    id: "123",
    embed_url: "https://giphy.com/embed/123",
  });
});

test("the GIF grid retains the mobile and desktop layouts", () => {
  const originalWidth = window.innerWidth;
  try {
    window.innerWidth = 390;
    render(<GiphySearchbox apiKey="test-key" onSelect={jest.fn()} />);
    const grid = screen.getByRole("button", { name: "Select GIF" });
    expect(grid).toHaveAttribute("data-columns", "2");
    expect(grid).toHaveAttribute("data-width", "225");
    window.innerWidth = 1024;
    fireEvent(window, new Event("resize"));
    expect(grid).toHaveAttribute("data-columns", "3");
    expect(grid).toHaveAttribute("data-width", "370");
  } finally {
    window.innerWidth = originalWidth;
  }
});
