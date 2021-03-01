import { Box, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAudiosInfinite } from "../../hooks/queries";
import AudioListItem from "./Item";

interface AudioListProps {
  queryKey: string;
  queryParams?: Record<string, any>;
  size?: number;
}

let hasMounted = false;

export default function AudioList(props: AudioListProps) {
  const { queryKey, queryParams = {}, size = 15 } = props;
  const [key, setKey] = useState(queryKey);
  const [params, setParams] = useState(queryParams);

  useEffect(() => {
    setKey(queryKey);
  }, [queryKey]);

  useEffect(() => {
    setParams(queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (!hasMounted) hasMounted = true;
  }, []);

  const {
    items: audios,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAudiosInfinite(key, params, size);

  return (
    <Box>
      {audios.length === 0 && <p>No audio found.</p>}
      {audios.map((audio) => (
        <AudioListItem key={audio.id} audio={audio} />
      ))}
      {hasNextPage && (
        <Button
          width="100%"
          variant="outline"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </Box>
  );
}
