import { useColorMode } from "@chakra-ui/react";
import React, { useCallback } from "react";
import ReactJkMusicPlayer, {
  ReactJkMusicPlayerInstance,
  ReactJkMusicPlayerProps,
  ReactJkMusicPlayerTheme,
} from "react-jinke-music-player";
import "react-jinke-music-player/assets/index.css";
import { useAudioPlayer } from "~/contexts/audioPlayerContext";
import { AudioPlayerItemInfo, AudioPlayerListItem } from "../types";

export default function AudioPlayer() {
  const {
    audioList,
    playIndex,
    clearPriorAudioList,
    clearQueue,
    currentPlaying,
    syncQueue,
    volume,
    volumeChange,
  } = useAudioPlayer();
  const { colorMode, setColorMode } = useColorMode();

  const getAudioInstance = useCallback(
    (instance: ReactJkMusicPlayerInstance) => {
      console.log("");
      console.log("getAudioInstance()");
      console.dir(instance);
    },
    []
  );

  const onAudioListsChange = useCallback(
    (
      currentPlayId: string,
      audioLists: AudioPlayerListItem[],
      audioInfo: AudioPlayerItemInfo
    ) => {
      console.log("");
      console.log("onAudioListsChange()");
      console.log("currentPlayId", currentPlayId);
      console.log("audioLists", audioLists);
      console.log("audioInfo", audioInfo);
      syncQueue(audioLists);
    },
    []
  );

  const onAudioPlayTrackChange = useCallback(
    (
      currentPlayId: string,
      audioLists: AudioPlayerListItem[],
      audioInfo: AudioPlayerItemInfo
    ) => {
      console.log("");
      console.log("onAudioPlayTrackChange()");
      console.log("currentPlayId", currentPlayId);
      console.log("audioLists", audioLists);
      console.log("audioInfo", audioInfo);
      currentPlaying(audioInfo);
    },
    [currentPlaying]
  );

  const onAudioPlay = useCallback(
    (audioInfo: AudioPlayerItemInfo) => {
      console.log("");
      console.log("onAudioPlay()");
      console.log("audioInfo", audioInfo);
      currentPlaying(audioInfo);
    },
    [currentPlaying]
  );

  const onAudioPause = useCallback(
    (audioInfo: AudioPlayerItemInfo) => {
      console.log("");
      console.log("onAudioPause()");
      console.log("audioInfo", audioInfo);
      currentPlaying(audioInfo);
    },
    [currentPlaying]
  );

  const onThemeChange = useCallback(
    (theme: ReactJkMusicPlayerTheme) => {
      console.log("");
      console.log("onThemeChange()");
      console.log("theme", theme);
      setColorMode(theme);
    },
    [setColorMode]
  );

  const onAudioVolumeChange = useCallback(
    (volume: number) => {
      volumeChange(Math.sqrt(volume));
    },
    [volumeChange]
  );

  const onBeforeDestroy = useCallback(
    (
      currentPlayId: string,
      audioLists: AudioPlayerListItem[],
      audioInfo: AudioPlayerItemInfo
    ) => {
      return new Promise<void>((resolve, reject) => {
        clearQueue();
        resolve();
      });
    },
    []
  );

  const onAudioError = useCallback(
    (
      error: any,
      currentPlayId: string,
      audioLists: AudioPlayerListItem[],
      audioInfo: AudioPlayerItemInfo
    ) => {
      console.log("");
      console.log("onAudioError()");
      console.log("error", error);
      console.log("currentPlayId", currentPlayId);
      console.log("audioLists", audioLists);
      console.log("audioInfo", audioInfo);
    },
    []
  );

  const defaultOptions: ReactJkMusicPlayerProps = {
    audioLists: [],
    toggleMode: false,
    mode: "full",
    quietUpdate: true,
    bounds: "body",
    preload: true,
    autoPlayInitLoadPlayList: true,
    loadAudioErrorPlayNext: false,
    clearPriorAudioLists: false,
    showDestroy: false,
    showDownload: false,
    showReload: false,
    glassBg: true,
    showThemeSwitch: false,
    showMediaSession: true,
    defaultPosition: {
      top: 300,
      left: 120,
    },
    volumeFade: {
      fadeIn: 200,
      fadeOut: 200,
    },
  };

  return (
    <ReactJkMusicPlayer
      {...defaultOptions}
      audioLists={audioList}
      theme={colorMode}
      playIndex={playIndex}
      defaultVolume={volume}
      getAudioInstance={getAudioInstance}
      onAudioListsChange={onAudioListsChange}
      onAudioPlayTrackChange={onAudioPlayTrackChange}
      onAudioPlay={onAudioPlay}
      onAudioPause={onAudioPause}
      onAudioError={onAudioError}
      onThemeChange={onThemeChange}
      onAudioVolumeChange={onAudioVolumeChange}
      onBeforeDestroy={onBeforeDestroy}
      clearPriorAudioLists={clearPriorAudioList}
      autoPlay={clearPriorAudioList || playIndex === 0}
    />
  );
}
