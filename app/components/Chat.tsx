// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  CircularProgress,
  styled,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatContainer = styled(Paper)({
  width: "100%",
  maxWidth: "800px",
  height: "600px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
});

const MessageList = styled(List)({
  flex: 1,
  overflowY: "auto",
  padding: "16px",
  backgroundColor: "#f9f9f9",
});

const InputContainer = styled(Box)({
  display: "flex",
  padding: "16px",
  borderTop: "1px solid #e0e0e0",
  backgroundColor: "white",
});

const BotMessage = styled(ListItem)({
  flexDirection: "row",
  alignItems: "flex-start",
  padding: "8px 16px",
});

const UserMessage = styled(ListItem)({
  flexDirection: "row-reverse",
  alignItems: "flex-start",
  padding: "8px 16px",
});

const MessageText = styled(ListItemText)(({ theme }) => ({
  borderRadius: "18px",
  padding: "12px 16px",
  maxWidth: "70%",
  wordBreak: "break-word",
  "& .MuiListItemText-primary": {
    display: "inline-block",
  },
}));

const BotMessageText = styled(MessageText)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  marginLeft: "12px",
}));

const UserMessageText = styled(MessageText)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  marginRight: "12px",
}));

const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral", // or whatever model you're using
          prompt: input,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.response || "I couldn't process that request.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error calling Ollama API:", err);
      setError("Failed to get response from the AI. Please try again.");

      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error processing your request.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: "24px" }}>
      <ChatContainer elevation={3}>
        <MessageList>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              {message.sender === "bot" ? (
                <BotMessage>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <SmartToyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <BotMessageText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString()}
                  />
                </BotMessage>
              ) : (
                <UserMessage>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "grey.500" }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <UserMessageText
                    primary={message.text}
                    secondary={message.timestamp.toLocaleTimeString()}
                  />
                </UserMessage>
              )}
            </React.Fragment>
          ))}
          {isLoading && (
            <BotMessage>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <SmartToyIcon />
                </Avatar>
              </ListItemAvatar>
              <BotMessageText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography>Thinking...</Typography>
                  </Box>
                }
              />
            </BotMessage>
          )}
          {error && (
            <Typography
              color="error"
              sx={{ padding: "16px", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
          <div ref={messagesEndRef} />
        </MessageList>
        <InputContainer>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={4}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            sx={{ alignSelf: "flex-end" }}
          >
            <SendIcon />
          </IconButton>
        </InputContainer>
      </ChatContainer>
    </Box>
  );
};

export default Chatbot;
