import "./App.scss";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useRef, useState, useEffect } from "react";

const API_URL = "http://localhost:3000/chat";

function App() {
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

  const onClose = () => setIsChatWindowOpen(false);

  return (
    <div className="App">
      {isChatWindowOpen && <ChatWindow onClose={onClose} />}
      {!isChatWindowOpen && (
        <button
          className="chat-button"
          onClick={() => setIsChatWindowOpen(true)}
        >
          <ChatIcon htmlColor="white" />
        </button>
      )}
    </div>
  );
}

const LoadingMessage = () => (
  <div className="message message--received">
    <div className="loading-animation">
      <div className="dot-flashing"></div>
    </div>
  </div>
);

interface ChatWindowProps {
  onClose: () => void;
}

interface MessageType {
  role: "user" | "assistant";
  content: string;
}

interface MessageProps {
  message: MessageType;
}

interface FetchBody {
  messages: MessageType[];
}

const Message = ({ message: { content, role } }: MessageProps) => (
  <div
    className={"message" + (role === "assistant" ? " message--received" : "")}
  >
    {content}
  </div>
);

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    wrapperRef.current?.scrollTo({
      behavior: "smooth",
      top: wrapperRef.current.scrollHeight,
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendRequest = (body: FetchBody) => {
    return fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  const sendMessage = () => {
    if (isLoading || inputValue.length < 2) return;

    const newMessages = [
      ...messages,
      { content: inputValue, role: "user" } as const,
    ];

    setMessages(newMessages);

    setIsLoading(true);
    setInputValue("");

    const body: FetchBody = {
      messages: newMessages,
    };

    sendRequest(body)
      .then((res: MessageType) => {
        setMessages([...newMessages, res]);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <span className="chat-window__title">Chat with us</span>
        <button className="chat-window__close-button" onClick={onClose}>
          <CloseIcon htmlColor="white" />
        </button>
      </div>
      <div className="chat-window__content" ref={wrapperRef}>
        <div className="chat-window__content-wrapper">
          {messages.map((message, index) => (
            <Message message={message} key={index.toString()} />
          ))}
          {isLoading && <LoadingMessage />}
        </div>
      </div>
      <div className="chat-window__input">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            className="chat-window__textarea"
            name="input"
            id=""
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            placeholder="Ask your question..."
            onKeyDownCapture={(e) => {
              if (e.key === "Enter" && !e.repeat) {
                e.preventDefault();
                sendMessage();
                e.currentTarget.focus();
              }
            }}
          ></textarea>
          <button
            onClick={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="chat-window__send-button"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
