import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Box, Circle, Flex, Text } from "@chakra-ui/react";
import { IoMdPlay, IoMdPause } from "react-icons/io";
import WaveSurfer from "wavesurfer.js";
import WaveSurferComponent from "~/components/Audio/Wavesurfer";
import { useAudioPlayer } from "~/lib/contexts/audio_player_context";
import { formatDuration } from "~/utils/time";
import { Audio } from "~/lib/types/audio";

interface AudioPlayerProps {
  audio: Audio;
  color?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audio,
  color = "#ED64A6",
  ...props
}) => {
  if (!audio) return null;

  const audioUrl = useMemo(
    () =>
      `http://audiochan.s3.amazonaws.com/audios/${audio.uploadId}${audio.fileExt}`,
    [audio]
  );

  const { volume, handleVolume } = useAudioPlayer();
  const [isLoop, isSetLoop] = useState(audio.isLoop ?? false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const handleMount = useCallback(
    (ws: WaveSurfer) => {
      wavesurferRef.current = ws;
      if (wavesurferRef.current) {
        wavesurferRef.current.load(audioUrl);
        wavesurferRef.current.on("ready", () => {
          console.log("audio ready");
          setIsLoading(false);
        });
        wavesurferRef.current.on("volume", (level: number) => {
          handleVolume(level);
        });
        wavesurferRef.current.on("loading", (data: number) => {
          setLoadingProgress(data);
        });
        wavesurferRef.current.on("seek", () => {
          if (wavesurferRef.current) {
            setSeconds(wavesurferRef.current.getCurrentTime());
          }
        });
        wavesurferRef.current.on("audioprocess", () => {
          if (wavesurferRef.current) {
            setSeconds(wavesurferRef.current.getCurrentTime());
          }
        });
        wavesurferRef.current.on("finish", () => {
          setSeconds(0);
          if (!isLoop) setIsPlaying(false);
          else wavesurferRef.current?.play();
        });
      }
    },
    [audioUrl]
  );

  const handleUnmount = () => {
    wavesurferRef.current?.unAll();
    wavesurferRef.current?.destroy();
    if (wavesurferRef.current) wavesurferRef.current = null;
  };

  const onPlayPause = () => {
    wavesurferRef.current?.playPause();
    setIsPlaying(wavesurferRef.current?.isPlaying() ?? false);
  };

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume);
    }
  }, [volume]);

  return (
    <WaveSurferComponent
      onMount={handleMount}
      onUnmount={handleUnmount}
      cursorWidth={1}
      cursorColor={color}
      height={150}
      responsive={true}
    >
      <Flex paddingY="0.2rem" paddingX="0.2rem" align="center">
        <Flex padding="1rem" width="10%" align="center">
          <Circle
            size="70px"
            bg={color}
            color="white"
            onClick={onPlayPause}
            as="button"
            disabled={isLoading === false && loadingProgress < 100}
          >
            {isPlaying ? <IoMdPause size="30px" /> : <IoMdPlay size="30px" />}
          </Circle>
        </Flex>
        <Box width="80%">
          <div id="wave-form"></div>
        </Box>
        <Box width="10%" textAlign="center">
          <Text fontSize="2xl">{formatDuration(seconds)}</Text>
        </Box>
      </Flex>
    </WaveSurferComponent>
  );
};

export default AudioPlayer;
