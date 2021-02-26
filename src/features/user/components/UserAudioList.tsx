import { Button } from "@chakra-ui/react";
import React from "react";
import { useUserAudiosInfiniteQuery } from "~/features/audio/hooks/queries";
import AudioListItem from "../../audio/components/List/Item";

interface UserAudioListProps {
  username: string;
}

export default function UserAudioList(
  props: UserAudioListProps & Record<string, any>
) {
  const { username, ...params } = props;
  const {
    items: audios,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserAudiosInfiniteQuery(username, params);

  return (
    <React.Fragment>
      {audios.length === 0 && <p>No uploads.</p>}
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
    </React.Fragment>
  );
}
