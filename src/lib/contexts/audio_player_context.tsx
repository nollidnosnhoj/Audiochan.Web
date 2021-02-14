import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Audio } from "~/lib/types/audio";

interface AudioPlayerContextProps {
  currentAudio: Audio | undefined;
  volume: number;
  position: number;
  playing: boolean;
  handleVolume: (level: number) => void;
  handlePosition: (pos: number) => void;
  handlePlaying: (state: boolean) => void;
  setCurrentAudio: (audio: Audio) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextProps>(
  {} as AudioPlayerContextProps
);

export function AudioPlayerProvider(props: PropsWithChildren<any>) {
  const [currentAudio, setCurrentAudio] = useState<Audio | undefined>(
    undefined
  );
  const [loop, setLoop] = useState(false);
  const [volume, setVolume] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    setVolume(parseFloat(window.localStorage.getItem("playerVolume") || "0.7"));
  }, []);

  useEffect(() => {
    setLoop(currentAudio?.isLoop ?? false);
  }, [currentAudio?.isLoop]);

  const onAudioChange = useCallback(
    (audio: Audio) => {
      setCurrentAudio(audio);
    },
    [setCurrentAudio]
  );

  const onSetPlaying = useCallback(
    (state: boolean) => {
      setPlaying(state);
    },
    [setPlaying]
  );

  const onPositionChange = useCallback(
    (pos: number) => {
      if (!currentAudio) {
        setPosition(0);
        return;
      }
      pos = Math.min(pos, currentAudio.duration);
      pos = Math.max(pos, 0);
      setPosition(pos);
    },
    [position, currentAudio, setPosition]
  );

  const onVolumeChange = useCallback(
    (level: number) => {
      level = Math.min(level, 1);
      level = Math.max(0, level);
      setVolume(level);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("playerVolume", JSON.stringify(level));
      }
    },
    [setVolume]
  );

  const values = useMemo<AudioPlayerContextProps>(
    () => ({
      currentAudio,
      volume,
      playing,
      position,
      handleVolume: onVolumeChange,
      handlePlaying: onSetPlaying,
      handlePosition: onPositionChange,
      setCurrentAudio: onAudioChange,
    }),
    [
      volume,
      playing,
      position,
      onVolumeChange,
      onSetPlaying,
      onPositionChange,
      onAudioChange,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={values}>
      {props.children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
