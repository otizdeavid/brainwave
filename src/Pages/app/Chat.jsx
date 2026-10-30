
import { useEffect, useRef, useState } from "react";
import {
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { sendChatMessage } from "../../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  function buildHistory(conversationId, messageId, content) {
    const conversation = conversations.find(
      (item) => item.id === conversationId
    );

    const conversationMessages = conversation?.messages ?? [];
    const messageIndex = conversationMessages.findIndex(
      (message) => message.id === messageId
    );

    const previousMessages =
      messageIndex >= 0
        ? conversationMessages.slice(0, messageIndex)
        : conversationMessages;

    const history = previousMessages
      .filter(
        (message) =>
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string" &&
          message.status !== "failed"
      )
      .map(({ role, content }) => ({ role, content }));

    history.push({ role: "user", content });

    return history;
  }


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
      const history = buildHistory(
        conversationId,
        messageId,
        content
      );

      const data = await sendChatMessage(content, history);

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

              {message.role === "user" ? (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              ) : (
                <div className="min-w-0 max-w-full break-words text-sm leading-7 [&_a]:text-color-1 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-color-1 [&_blockquote]:pl-4 [&_blockquote]:text-n-3 [&_code]:rounded [&_code]:bg-n-8 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-n-5 [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:my-4 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-n-5 [&_pre]:bg-n-8 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm [&_strong]:font-semibold [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-n-5 [&_th]:bg-n-8 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-n-5 [&_td]:px-3 [&_td]:py-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="my-4 max-w-full overflow-x-auto rounded-lg">
                          <table>{children}</table>
                        </div>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

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
