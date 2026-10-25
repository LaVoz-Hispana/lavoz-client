import { useContext, useEffect, useState } from "react";
import {
  Grid,
  SearchBar,
  SearchContext,
  SearchContextManager,
} from "@giphy/react-components";

function SearchResults({ onSelect }) {
  const { fetchGifs, searchKey } = useContext(SearchContext);
  const [wide, setWide] = useState(() => window.innerWidth >= 700);

  useEffect(() => {
    const updateWidth = () => setWide(window.innerWidth >= 700);
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const columns = wide ? 3 : 2;
  const width = columns * (wide ? 120 : 110) + (columns - 1) * 5;

  return (
    <div style={{ width }}>
      <SearchBar />
      <Grid
        key={searchKey}
        fetchGifs={fetchGifs}
        columns={columns}
        width={width}
        gutter={5}
        noLink
        onGifClick={(gif, event) => {
          event.preventDefault();
          onSelect(gif);
        }}
      />
    </div>
  );
}

export default function GiphySearchbox({ apiKey, onSelect }) {
  return (
    <SearchContextManager apiKey={apiKey}>
      <SearchResults onSelect={onSelect} />
    </SearchContextManager>
  );
}
