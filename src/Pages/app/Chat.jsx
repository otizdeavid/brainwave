
import { useEffect, useRef, useState } from "react";
import {
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { sendChatMessage } from "../../services/api";

function Chat() {
  const {
    conversations,
    activeConversationId,
    createConversation,
    updateConversation,
  } = useOutletContext();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const conversationRef = useRef(null);
  const loadingRef = useRef(false);


  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );

  const messages = activeConversation?.messages ?? [];


  useEffect(() => {
    const prompt = searchParams.get("prompt");

    if (prompt) {
      setInput(prompt);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);


  useEffect(() => {
    const conversation = conversationRef.current;

    if (conversation) {
      conversation.scrollTo({
        top: conversation.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  async function deliverMessage(conversationId, messageId, content) {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);


    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) =>
        message.id === messageId
          ? { ...message, status: "sending", error: "" }
          : message
      ),
    }));

    try {
      const data = await sendChatMessage(content);

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [
          ...conversation.messages.map((message) =>
            message.id === messageId
              ? { ...message, status: "sent", error: "" }
              : message
          ),
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
          },
        ],
      }));
    } catch (err) {
      const messageError =
        err.message || "Message failed to send. Please try again.";

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === messageId
            ? {
              ...message,
              status: "failed",
              error: messageError,
            }
            : message
        ),
      }));

      (messageError);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }


  async function handleSend(event) {
    event.preventDefault();

    const content = input.trim();

    if (!content || loadingRef.current) return;

    const message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      status: "sending",
      error: "",
    };

    let conversationId = activeConversationId;

    if (!conversationId || !activeConversation) {
      // Create the conversation with its first message included.
      conversationId = createConversation(message);
    } else {
      // Add the message to the existing conversation.
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        title:
          conversation.messages.length === 0
            ? content.slice(0, 40) + (content.length > 40 ? "…" : "")
            : conversation.title,
        messages: [...conversation.messages, message],
      }));
    }

    setInput("");


    await deliverMessage(conversationId, message.id, content);
  }


  return (
    <main className="mx-auto flex h-[calc(100dvh-5rem)] min-h-0 w-full max-w-5xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 shrink-0">
        {/*<p className="text-sm text-n-3">BrainWave Assistant</p>*/}
        <h1 className="mt-1 text-2xl font-semibold text-n-1 sm:text-3xl">
          Chat with BrainWave
        </h1>
        <p className="mt-2 text-sm text-n-3">
          Ask a question and start a conversation.
        </p>
      </header>

      <section
        ref={conversationRef}
        aria-label="Conversation"
        aria-live="polite"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain rounded-2xl border border-n-6 bg-n-7 p-4 sm:p-6"
      >
        {messages.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-n-6 text-2xl">
              ✦
            </div>
            <h2 className="text-lg font-semibold text-n-1">
              What can I help you with?
            </h2>
            <p className="mt-2 max-w-sm text-sm text-n-3">
              Send your first message below to begin.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"
              }`}
          >
            <div
              className={`max-w-[90%] min-w-0 break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${message.role === "user"
                ? "bg-color-1 text-white"
                : "border border-n-6 bg-n-6 text-n-1"
                }`}
            >
              <p className="mb-1 text-xs font-semibold opacity-70">
                {message.role === "user" ? "You" : "BrainWave"}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.status === "failed" && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <p role="alert" className="text-red-500">
                  {message.error}
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    deliverMessage(
                      activeConversation.id,
                      message.id,
                      message.content
                    )
                  }
                  className="rounded-lg border border-n-6 px-3 py-1.5 font-medium text-n-1 transition hover:bg-n-6 disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <p role="status" className="text-sm text-n-3">
            BrainWave is responding...
          </p>
        )}
      </section>



      <form onSubmit={handleSend} className="mt-4 shrink-0">
        <label htmlFor="chat-message" className="sr-only">
          Your message
        </label>
        <div className="flex items-end gap-2 rounded-2xl border border-n-6 bg-n-7 p-2 sm:gap-3">
          <textarea
            id="chat-message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Message BrainWave..."
            rows={1}
            disabled={loading}
            className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-n-1 outline-none placeholder:text-n-3 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-color-1 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-n-3">
          Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </main>
  );
}

export default Chat;
