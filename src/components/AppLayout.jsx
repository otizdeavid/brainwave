
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { supabase } from "../lib/supabase";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [dataReady, setDataReady] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] =
    useState(null);

  // Load conversations belonging to the signed-in user.
  useEffect(() => {
    let active = true;

    async function loadUserConversations() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          if (!active) return;

          setUserId(null);
          setConversations([]);
          setActiveConversationId(null);
          setDataReady(true);
          return;
        }

        const currentUserId = data.user.id;
        const storageKey = `brainwave-data-${currentUserId}`;

        let savedConversations = [];
        let savedActiveId = null;

        try {
          const saved = localStorage.getItem(storageKey);

          if (saved) {
            const parsed = JSON.parse(saved);

            savedConversations = Array.isArray(
              parsed.conversations
            )
              ? parsed.conversations
              : [];

            savedActiveId = savedConversations.some(
              (conversation) =>
                conversation.id === parsed.activeConversationId
            )
              ? parsed.activeConversationId
              : null;
          }
        } catch {
          savedConversations = [];
          savedActiveId = null;
        }

        if (!active) return;

        setUserId(currentUserId);
        setConversations(savedConversations);
        setActiveConversationId(savedActiveId);
        setDataReady(true);
      } catch (error) {
        console.error(
          "Could not load BrainWave conversations:",
          error
        );

        if (!active) return;

        setUserId(null);
        setConversations([]);
        setActiveConversationId(null);
        setDataReady(true);
      }
    }

    loadUserConversations();

    return () => {
      active = false;
    };
  }, []);

  // Save only after the correct user's data has loaded.
  useEffect(() => {
    if (!dataReady || !userId) return;

    const storageKey = `brainwave-data-${userId}`;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          conversations,
          activeConversationId,
        })
      );
    } catch (error) {
      console.error(
        "Could not save BrainWave conversations:",
        error
      );
    }
  }, [
    conversations,
    activeConversationId,
    userId,
    dataReady,
  ]);

  function createConversation(initialMessage = null) {
    const id = crypto.randomUUID();

    const conversation = {
      id,
      title: initialMessage
        ? initialMessage.content.slice(0, 40)
        : "New conversation",
      messages: initialMessage ? [initialMessage] : [],
    };

    setConversations((current) => [
      conversation,
      ...current,
    ]);

    setActiveConversationId(id);

    return id;
  }

  function selectConversation(id) {
    setActiveConversationId(id);
  }

  function deleteConversation(id) {
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== id)
    );

    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }

  function updateConversation(id, updater) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? updater(conversation)
          : conversation
      )
    );
  }

  if (!dataReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-n-8 px-4 text-n-1">
        <p className="text-sm text-n-3">
          Loading your conversations...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-n-8 text-n-1">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={createConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onUpdateConversation={updateConversation}
      />

      <main className="min-h-screen md:ml-64">
        <AppHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <Outlet
          context={{
            conversations,
            activeConversationId,
            createConversation,
            updateConversation,
            deleteConversation,
          }}
        />
      </main>
    </div>
  );
}

export default AppLayout;
