import { Box, Button, Divider } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { PagedList } from "~/lib/types";
import { useAudiosInfinite } from "../../hooks/queries";
import { Audio } from "../../types";
import AudioListItem from "./Item";

interface AudioListProps {
  initialData?: PagedList<Audio>;
  queryKey?: string;
  queryParams?: Record<string, any>;
  size?: number;
}

export default function AudioInfiniteList(props: AudioListProps) {
  const {
    initialData,
    queryKey = "audios",
    queryParams = {},
    size = 15,
  } = props;
  const [key, setKey] = useState(queryKey);
  const [params, setParams] = useState(queryParams);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  useEffect(() => {
    setKey(queryKey);
  }, [queryKey]);

  useEffect(() => {
    setParams(queryParams);
  }, [queryParams]);

  const {
    items: audios,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAudiosInfinite(key || "audios", params, size, {
    initialData: () => {
      if (hasMounted.current) return undefined;
      if (!initialData) return undefined;
      return {
        pages: [initialData],
        pageParams: [1],
      };
    },
  });

  return (
    <Box>
      {audios.length === 0 && <p>No audio found.</p>}
      {audios.map((audio, index) => (
        <Box marginTop={4} key={index}>
          <AudioListItem listIndex={index} audio={audio} />
          {index !== audios.length - 1 && <Divider />}
        </Box>
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
