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
import { useAudioPlayer } from "~/lib/contexts/audio_player_context";
import { formatDuration } from "~/utils/time";
import { Audio } from "~/lib/types/audio";
import { createWavesurfer } from "~/utils/wavesurfer";

interface AudioPlayerProps {
  audio: Audio;
  color?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audio,
  color = "#ED64A6",
  ...props
}) => {
  const {
    volume,
    playing,
    currentAudio,
    position,
    handlePlaying,
    handlePosition,
    setCurrentAudio,
    handleVolume,
  } = useAudioPlayer();

  const wavesurferRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (audio) {
      setCurrentAudio(audio);
    }
  }, [audio]);

  const audioUrl = useMemo(
    () =>
      `http://audiochan.s3.amazonaws.com/audios/${audio.uploadId}${audio.fileExt}`,
    [currentAudio?.uploadId, currentAudio?.fileExt]
  );

  const onPlayPause = useCallback(() => {
    if (wavesurfer.current) {
      if (playing) {
        wavesurfer.current.pause();
        handlePlaying(false);
      } else {
        wavesurfer.current.play();
        handlePlaying(true);
      }
    }
  }, [playing, handlePlaying]);

  const destroyWavesurferIfDefined = useCallback(() => {
    if (wavesurfer.current) {
      wavesurfer.current.unAll();
      wavesurfer.current.destroy();
      wavesurfer.current = null;
      handlePlaying(false);
      handlePosition(0);
    }
  }, [wavesurfer.current]);

  useEffect(() => {
    if (currentAudio) {
      destroyWavesurferIfDefined();
      wavesurfer.current = createWavesurfer(wavesurferRef, {
        waveColor: "#EDF2F7",
        progressColor: "#ED64A6",
        backend: "MediaElement",
      });
      if (wavesurfer.current) {
        wavesurfer.current.load(audioUrl);
        wavesurfer.current.setVolume(volume);
        wavesurfer.current.on("volume", (level: number) => {
          handleVolume(level);
        });
        wavesurfer.current.on("seek", () => {
          if (wavesurfer.current) {
            handlePosition(wavesurfer.current.getCurrentTime());
          }
        });
        wavesurfer.current.on("audioprocess", () => {
          if (wavesurfer.current) {
            handlePosition(wavesurfer.current.getCurrentTime());
          }
        });
        wavesurfer.current.on("finish", () => {
          if (wavesurfer.current) {
            wavesurfer.current.seekTo(0);
            if (currentAudio?.isLoop) {
              wavesurfer.current.play();
            } else {
              handlePlaying(false);
            }
          }
        });
      }
    }

    return () => destroyWavesurferIfDefined();
  }, [currentAudio?.isLoop, audioUrl]);

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(volume);
    }
  }, [volume]);

  return (
    <Flex paddingY="0.2rem" paddingX="0.2rem" align="center">
      <Flex padding="1rem" width="10%" align="center">
        <Circle
          size="70px"
          bg={color}
          color="white"
          onClick={onPlayPause}
          as="button"
        >
          {playing ? <IoMdPause size="30px" /> : <IoMdPlay size="30px" />}
        </Circle>
      </Flex>
      <Box width="80%">
        <Box id="waveform" ref={wavesurferRef}></Box>
      </Box>
      <Box width="10%" textAlign="center">
        <Text fontSize="2xl">{formatDuration(position)}</Text>
      </Box>
    </Flex>
  );
};

export default AudioPlayer;
