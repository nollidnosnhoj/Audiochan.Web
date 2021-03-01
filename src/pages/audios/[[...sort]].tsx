import { GetServerSideProps } from "next";
import React from "react";
import Page from "~/components/Page";
import AudioInfiniteList from "~/features/audio/components/List/AudioInfiniteList";
import AudioListSubHeader from "~/features/audio/components/ListSubheader";
import { useAudiosInfinite } from "~/features/audio/hooks/queries";

type SortState = "latest" | "favorites";

const sortPageTitles: { [K in SortState]: string } = {
  latest: "Latest Audios",
  favorites: "Most Liked Audios",
};

interface AudioListPageProps {
  sort: SortState;
  filter: Record<string, any>;
}

export const getServerSideProps: GetServerSideProps<AudioListPageProps> = async ({
  query,
  params,
}) => {
  let sort: SortState;

  let sortParam = params?.sort || "latest";

  if (Array.isArray(sortParam)) {
    sortParam = sortParam[0].toLowerCase();
  } else {
    sortParam = sortParam.toLowerCase();
  }

  switch (sortParam) {
    case "latest":
      sort = "latest";
      break;
    case "favorites":
      sort = "favorites";
      break;
    default:
      return {
        notFound: true,
      };
  }

  const { page, ...filter } = query;

  return {
    props: {
      sort: sort,
      filter: filter,
    },
  };
};

export default function AudioListPage(props: AudioListPageProps) {
  const { sort, filter } = props;

  return (
    <Page
      title={sortPageTitles[sort]}
      beforeContainer={<AudioListSubHeader current={sort} />}
    >
      <AudioInfiniteList queryParams={{ ...filter, sort }} size={15} />
    </Page>
  );
}
