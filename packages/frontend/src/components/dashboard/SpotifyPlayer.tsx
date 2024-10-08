import HeadphonesIcon from "@mui/icons-material/Headphones";
import { Box, Divider } from "@mui/material";
import { CollapsibleList } from "./DashboardItem";
import { CurrentSong, PlaybackControls, PositionControls } from "./MusicControls";
import { MusicPlaylist } from "./MusicPlaylist";
import { useSpotifyContext } from "../../hooks";

interface Props {
  idle: boolean;
}

export function SpotifyPlayer({ idle }: Props) {
  const { playerState, resumePlayback, pausePlayback, skipNext, skipPrevious, seek } = useSpotifyContext();
  if (idle && !playerState.trackId) {
    return <> </>;
  }
  return (
    <CollapsibleList
      header={
        playerState.trackId && (
          <Box sx={{ paddingLeft: 2, paddingRight: 2, paddingTop: 2 }}>
            <CurrentSong
              title={playerState.name}
              artist={playerState.artists.join(", ")}
              albumTitle={playerState.albumName}
              albumCoverUrl={playerState.coverImageUrl}
            />
            <PositionControls
              position={playerState.position}
              duration={playerState.duration}
              setPosition={async (value: number) => {
                await seek(value * 1000);
              }}
            />
          </Box>
        )
      }
      icon={playerState.trackId ? <div /> : <HeadphonesIcon style={{ color: "#00ce41", fontSize: "1.5rem" }} />}
      title={
        !playerState.trackId ? (
          "Music"
        ) : (
          <PlaybackControls
            skipPrevious={skipPrevious}
            skipNext={skipNext}
            canSkipPrevious={playerState.canSkipPrevious}
            canSkipNext={playerState.canSkipNext}
            togglePlay={async () => {
              if (playerState.paused) {
                await resumePlayback();
              } else {
                await pausePlayback();
              }
            }}
            playing={!playerState.paused}
          />
        )
      }
      secondaryTitle={playerState.trackId ? "Show playlist" : "No music streaming"}
      settingsKey="showPlaylist"
      disableExpand={!playerState.trackId}
    >
      {playerState.trackId && <Divider />}
      <MusicPlaylist />
    </CollapsibleList>
  );
}
