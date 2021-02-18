import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  Box,
  Circle,
  Flex,
  IconButton,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoMdPlay, IoMdPause, IoMdRepeat } from "react-icons/io";
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
    loop,
    volume,
    playing,
    currentAudio,
    position,
    handlePlaying,
    handlePosition,
    setCurrentAudio,
    handleVolume,
    handleLoop,
  } = useAudioPlayer();
  const waveColor = useColorModeValue("#1A202C", "#EDF2F7");
  const wavesurferRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const playPromise = useRef<Promise<void> | undefined>(undefined);

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

  const onPlayPause = useCallback(async () => {
    if (wavesurfer.current) {
      await wavesurfer.current.playPause();
      handlePlaying(wavesurfer.current.isPlaying());
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
        waveColor: waveColor,
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
      }
    }

    return () => destroyWavesurferIfDefined();
  }, [currentAudio?.id, audioUrl]);

  useEffect(() => {
    const handlingLoop = async () => {
      if (wavesurfer.current) {
        if (loop) {
          wavesurfer.current.seekTo(0);
          await wavesurfer.current.playPause();
        } else {
          wavesurfer.current.stop();
          handlePlaying(false);
        }
      }
    };

    if (wavesurfer.current) {
      wavesurfer.current.on("finish", () => {
        handlingLoop();
      });

      return () => wavesurfer.current?.un("finish", () => {});
    }
  }, [loop]);

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setWaveColor(waveColor);
    }
  }, [waveColor]);

  return (
    <Flex paddingY="0.2rem" paddingX="0.2rem" align="center">
      <Flex flexDirection="column" padding="1rem" width="10%" align="center">
        <Circle
          size="70px"
          bg={color}
          color="white"
          onClick={onPlayPause}
          as="button"
        >
          {playing ? <IoMdPause size="30px" /> : <IoMdPlay size="30px" />}
        </Circle>
        <IconButton
          isRound
          variant="ghost"
          icon={<IoMdRepeat />}
          aria-label="Repeat"
          size="md"
          marginTop={2}
          opacity={loop ? 1 : 0.7}
          onClick={handleLoop}
        />
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
