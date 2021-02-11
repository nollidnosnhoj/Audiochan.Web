import {
  Box,
  Button,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { QueryClient } from "react-query";
import { dehydrate } from "react-query/hydration";
import Page from "~/components/Shared/Page";
import Picture from "~/components/Shared/Picture";
import PictureDropzone from "~/components/Shared/Picture/PictureDropzone";
import AudioList from "~/components/Audio/List";
import {
  fetchUserProfile,
  useAddUserPicture,
  useFollow,
  useProfile,
} from "~/lib/services/users";
import useUser from "~/lib/contexts/user_context";
import { getAccessToken } from "~/utils/cookies";
import { successfulToast } from "~/utils/toast";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const username = context.params?.username as string;
  const accessToken = getAccessToken(context);
  try {
    await queryClient.fetchQuery(["users", username], () =>
      fetchUserProfile(username, { accessToken })
    );
    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};

export default function ProfilePage() {
  const { user } = useUser();
  const { query } = useRouter();
  const username = query.username as string;
  const { data: profile } = useProfile(username, { staleTime: 1000 });
  if (!profile) return null;
  const {
    mutateAsync: addPictureAsync,
    isLoading: isAdddingPicture,
  } = useAddUserPicture(username);

  const [picture, setPicture] = useState(() => {
    return profile?.picture
      ? `https://audiochan.s3.amazonaws.com/${profile.picture}`
      : "";
  });

  const { isFollowing, follow } = useFollow(username, profile.isFollowing);

  return (
    <Page title={`${profile.username} | Audiochan`}>
      <Flex direction="row">
        <Flex flex="1" direction="column" justify="center">
          <Box textAlign="center">
            <Picture
              src={picture}
              size={250}
              disabled={isAdddingPicture}
              canReplace={user?.id === profile.id}
              onReplace={(data) => {
                addPictureAsync(data).then(({ data: { image } }) => {
                  setPicture(image);
                });
              }}
            />
          </Box>
          <Box textAlign="center" marginY={4}>
            <Text fontSize="2xl" as="strong">
              {profile!.username}
            </Text>
          </Box>
          <Flex justifyContent="center">
            <Button
              colorScheme="primary"
              variant={isFollowing ? "solid" : "outline"}
              disabled={isFollowing === undefined}
              paddingX={12}
              onClick={() => follow()}
            >
              {isFollowing ? "Followed" : "Follow"}
            </Button>
          </Flex>
        </Flex>
        <Box flex="3">
          <Tabs isLazy>
            <TabList>
              <Tab>Uploads</Tab>
              <Tab>Favorites</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <AudioList
                  type="user"
                  username={profile!.username}
                  removeArtistName
                />
              </TabPanel>
              <TabPanel>
                <AudioList type="favorites" username={profile!.username} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Page>
  );
}
