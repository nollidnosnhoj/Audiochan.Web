import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  AudioPlayerItemInfo,
  AudioPlayerListItem,
} from "~/features/audio/types";

type AudioPlayerContextType = {
  audioList: AudioPlayerListItem[];
  clearPriorAudioList: boolean;
  current: AudioPlayerItemInfo | undefined;
  playIndex: number | undefined;
  volume: number;
  addToQueue: (item: AudioPlayerListItem) => void;
  clearQueue: () => void;
  currentPlaying: (info: AudioPlayerItemInfo) => void;
  startPlay: (list: AudioPlayerListItem[]) => void;
  syncQueue: (list: AudioPlayerListItem[]) => void;
  volumeChange: (level: number) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType>(
  {} as AudioPlayerContextType
);

export default function AudioPlayerProvider(props: PropsWithChildren<any>) {
  const [audioList, setAudioList] = useState<AudioPlayerListItem[]>([]);
  const [playIndex, setPlayIndex] = useState<number | undefined>(undefined);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return (
        parseInt(window.localStorage.getItem("playerVolume") || "0.5") || 0.5
      );
    }

    return 0.5;
  });
  const [clearPriorAudioList, setClearPriorAudioList] = useState(true);
  const [current, setCurrent] = useState<AudioPlayerItemInfo | undefined>(
    undefined
  );

  const currentPlaying = (info: AudioPlayerItemInfo) => {
    setCurrent(() => {
      if (info.ended) return undefined;
      if (info.audioId !== current?.audioId) return info;
    });
  };

  const startPlay = (list: AudioPlayerListItem[]) => {
    setAudioList(list);
    setPlayIndex(0);
    setClearPriorAudioList(true);
  };

  const addToQueue = (item: AudioPlayerListItem) => {
    if (audioList.some((x) => x.audioId == item.audioId)) return;
    setAudioList((previousList) => [...previousList, item]);
    setClearPriorAudioList(false);
    setPlayIndex(undefined);
  };

  const volumeChange = (level: number) => {
    setVolume(level);
    if (typeof window !== "undefined") {
      localStorage.setItem("playerVolume", level + "");
    }
  };

  const clearQueue = () => {
    setAudioList([]);
    setPlayIndex(undefined);
    setCurrent(undefined);
  };

  const syncQueue = (list: AudioPlayerListItem[]) => {
    if (list.length === 0) setCurrent(undefined);
    setAudioList(list);
  };

  const values: AudioPlayerContextType = useMemo(
    () => ({
      audioList: audioList,
      clearPriorAudioList: clearPriorAudioList,
      current: current,
      playIndex: playIndex,
      volume: volume,
      addToQueue: addToQueue,
      currentPlaying: currentPlaying,
      clearQueue: clearQueue,
      startPlay: startPlay,
      syncQueue: syncQueue,
      volumeChange: volumeChange,
    }),
    [
      audioList,
      clearPriorAudioList,
      current,
      playIndex,
      clearQueue,
      syncQueue,
      volume,
      volumeChange,
      startPlay,
      currentPlaying,
      addToQueue,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={values}>
      {props.children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);
