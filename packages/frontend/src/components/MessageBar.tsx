import React, { KeyboardEvent, MouseEvent } from "react";
import "./MessageBar.css";
import { TextareaAutosize } from "@mui/base";
import { createTheme, IconButton, ThemeProvider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import SpeechRecorder from "./SpeechRecorder";
import { createPerformanceTrackingService } from "../services/PerformanceTrackingService";
import { useChats } from "../hooks";

const theme = createTheme({
  components: {},
  palette: {
    mode: "light",
    primary: { main: "rgb(5, 30, 52)" },
    text: {
      primary: "#222222",
      secondary: "#333333",
    },
  },
});

interface Props {
  sendMessage: (id: string, message: string, audible: boolean) => void;
  stopResponding: (audible: boolean) => void;
  responding: boolean;
  awaitSpokenResponse: boolean;
  idle: boolean;
}

export const MessageBar = React.memo(
  ({ sendMessage, stopResponding, responding, awaitSpokenResponse, idle }: Props) => {
    //const [message, setMessage] = React.useState("");
    const { currentlyTypedMessage, setCurrentlyTypedMessage } = useChats();
    const defaultPlaceHolder = "Type to chat";
    const [placeHolder, setPlaceHolder] = React.useState(defaultPlaceHolder);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const performanceTrackingServiceRef = React.useRef(createPerformanceTrackingService());

    const focusTextArea = (e: MouseEvent) => {
      if (textAreaRef.current && e.target !== textAreaRef.current) {
        textAreaRef.current.focus();
      }
    };

    const sendTextMessage = (message: string) => {
      const userMessageId = crypto.randomUUID();
      const now = new Date().getTime();
      performanceTrackingServiceRef.current.trackTimestamp(userMessageId, "transcription-started", now);
      performanceTrackingServiceRef.current.trackTimestamp(userMessageId, "transcription-finished", now);
      sendMessage(userMessageId, message, false);
      setCurrentlyTypedMessage("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !currentlyTypedMessage.includes("\n")) {
        e.preventDefault();
        sendTextMessage(currentlyTypedMessage);
      }
    };

    return (
      <div className={`fixedBottom ${idle ? "idle" : "gradientBottom"}`}>
        <ThemeProvider theme={theme}>
          <div
            className="textContainer"
            style={{ width: idle ? "auto" : "50vw", borderRadius: idle ? "50%" : "1rem" }}
            onClick={focusTextArea}
          >
            {!idle && (
              <TextareaAutosize
                name="Message input"
                className="textArea"
                ref={textAreaRef}
                placeholder={placeHolder}
                value={currentlyTypedMessage}
                onChange={(e) => setCurrentlyTypedMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                minRows={1}
                maxRows={10}
              />
            )}
            <div className="buttonContainer">
              {!idle && !responding && (
                <IconButton
                  disabled={currentlyTypedMessage.trim() === ""}
                  aria-label="send message"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    sendTextMessage(currentlyTypedMessage);
                  }}
                >
                  <SendIcon />
                </IconButton>
              )}
              {!idle && responding && (
                <IconButton
                  aria-label="cancel response"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    stopResponding(false);
                  }}
                >
                  <CancelIcon />
                </IconButton>
              )}
              <SpeechRecorder
                sendMessage={sendMessage}
                stopResponding={stopResponding}
                setTranscript={setPlaceHolder}
                defaultMessage={defaultPlaceHolder}
                responding={responding}
                awaitSpokenResponse={awaitSpokenResponse}
              />
            </div>
          </div>
        </ThemeProvider>
      </div>
    );
  },
);
