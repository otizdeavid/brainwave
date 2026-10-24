import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function AppSidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onUpdateConversation,
}) {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [pinnedOpen, setPinnedOpen] = useState(true);


  const pinnedConversations = conversations.filter(
    (conversation) => conversation.pinned
  );

  const recentConversations = conversations.filter(
    (conversation) => !conversation.pinned
  );


  function handleNewChat() {
    onNewChat();
    onClose();
    navigate("/app/chat");
  }

  function handleSelectConversation(id) {
    onSelectConversation(id);
    onClose();
    navigate("/app/chat");
  }

  function handleDeleteConversation(event, id) {
    event.stopPropagation();
    onDeleteConversation(id);
  }


  function handleRenameConversation(conversation) {
    setEditingConversationId(conversation.id);
    setEditedTitle(conversation.title);
    setOpenMenuId(null);
  }


  function handleTogglePin(conversation) {
    onUpdateConversation(conversation.id, (current) => ({
      ...current,
      pinned: !current.pinned,
    }));

    setOpenMenuId(null);
  }



  function saveRenamedConversation(conversationId) {
    const title = editedTitle.trim();

    if (!title) {
      setEditingConversationId(null);
      setEditedTitle("");
      return;
    }

    onUpdateConversation(conversationId, (conversation) => ({
      ...conversation,
      title,
    }));

    setEditingConversationId(null);
    setEditedTitle("");
  }

  function cancelRenaming() {
    setEditingConversationId(null);
    setEditedTitle("");
  }


  function renderConversationItems(list) {
    return (
      <div className="space-y-1">
        {list.map((conversation) => (
          <div
            key={conversation.id}
            className={`group relative flex items-center rounded-xl transition ${activeConversationId === conversation.id
              ? "bg-n-6"
              : "hover:bg-n-7"
              }`}
          >
            {editingConversationId === conversation.id ? (
              <input
                autoFocus
                value={editedTitle}
                onChange={(event) => setEditedTitle(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    saveRenamedConversation(conversation.id);
                  }

                  if (event.key === "Escape") {
                    cancelRenaming();
                  }
                }}
                onBlur={() => saveRenamedConversation(conversation.id)}
                className="min-w-0 flex-1 rounded-lg border border-n-5 bg-n-7 px-3 py-2.5 text-sm text-n-1 outline-none focus:border-color-1"
                aria-label="Rename conversation"
              />
            ) : (
              <button
                type="button"
                onClick={() => handleSelectConversation(conversation.id)}
                className={`min-w-0 flex-1 truncate rounded-xl px-3 py-2.5 text-left text-sm ${activeConversationId === conversation.id
                  ? "text-n-1"
                  : "text-n-3 hover:text-n-1"
                  }`}
              >
                {conversation.title}
              </button>
            )}

            <button
              type="button"
              aria-label={`Options for ${conversation.title}`}
              aria-expanded={openMenuId === conversation.id}
              onClick={(event) => {
                event.stopPropagation();
                setOpenMenuId((current) =>
                  current === conversation.id ? null : conversation.id
                );
              }}
              className="mr-1 shrink-0 rounded-lg p-2 text-n-3 opacity-100 transition hover:bg-n-5 hover:text-n-1 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <span aria-hidden="true">•••</span>
            </button>

            {openMenuId === conversation.id && (
              <div className="absolute right-2 top-full z-50 mt-1 w-44 rounded-xl border border-n-6 bg-n-8 p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleRenameConversation(conversation)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-n-1 hover:bg-n-6"
                >
                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePin(conversation)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-n-1 hover:bg-n-6"
                >
                  {conversation.pinned
                    ? "Unpin conversation"
                    : "Pin conversation"}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    handleDeleteConversation(event, conversation.id);
                    setOpenMenuId(null);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-n-6"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }


  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
          }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-n-6 bg-n-8 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center border-b border-n-6 px-6">
          <h1 className="text-xl font-bold">BrainWave</h1>

          <button
            onClick={onClose}
            className="ml-auto text-2xl text-n-3 md:hidden"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        {/* Main navigation */}
        <nav className="shrink-0 space-y-2 p-4">
          <NavLink
            to="/app"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                ? "bg-n-6 text-n-1"
                : "text-n-3 hover:bg-n-7 hover:text-n-1"
              }`
            }
          >
            Dashboard
          </NavLink>

          <button
            type="button"
            onClick={handleNewChat}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-n-3 transition hover:bg-n-7 hover:text-n-1"
          >
            + New Chat
          </button>
        </nav>

        {/* Conversation history */}

        {/* Conversation history */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">



          {conversations.length === 0 ? (
            <p className="px-2 text-sm text-n-3">
              Chat Records.
            </p>
          ) : (
            <div className="space-y-5">
              {/* Pinned conversations */}
              <section>
                <button
                  type="button"
                  onClick={() => setPinnedOpen((current) => !current)}
                  aria-expanded={pinnedOpen}
                  className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-n-3 transition hover:bg-n-7 hover:text-n-1"
                >
                  <span>Pinned ({pinnedConversations.length})</span>

                  <span
                    className={`transition-transform duration-200 ${pinnedOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>

                {pinnedOpen && renderConversationItems(pinnedConversations)}
              </section>

              {/* Recent conversations */}
              <section>
                <h2 className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-n-3">
                  Recent conversations
                </h2>

                {renderConversationItems(recentConversations)}
              </section>
            </div>
          )}

        </div>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-n-6 p-4">
          <div className="rounded-xl bg-n-6 p-4">
            <p className="text-sm font-medium">Free Plan</p>
            <p className="mt-1 text-xs text-n-3">
              BrainWave V2
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
