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
import Page from "~/components/Page";
import Picture from "~/components/Picture";
import { useProfile } from "~/features/user/hooks/queries";
import useUser from "~/contexts/user_context";
import { getAccessToken } from "~/utils/cookies";
import UserAudioList from "~/features/user/components/UserAudioList";
import UserFavoriteAudioList from "~/features/user/components/UserFavoriteAudioList";
import { useAddUserPicture, useFollow } from "~/features/user/hooks/mutations";
import { fetchUserProfile } from "~/features/user/services/fetch";

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
            {user && user.id !== profile.id && (
              <Button
                colorScheme="primary"
                variant={isFollowing ? "solid" : "outline"}
                disabled={isFollowing === undefined}
                paddingX={12}
                onClick={() => follow()}
              >
                {isFollowing ? "Followed" : "Follow"}
              </Button>
            )}
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
                <UserAudioList username={profile.username} />
              </TabPanel>
              <TabPanel>
                <UserFavoriteAudioList username={profile.username} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Page>
  );
}
