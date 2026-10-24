
import { useNavigate, useOutletContext } from "react-router-dom";

function QuickAction() {
    const navigate = useNavigate();
    const { createConversation } = useOutletContext();

    const actions = [
        {
            title: "Ask BrainWave",
            description: "Get answers and explore ideas.",
            prompt: "Help me explore an idea.",
        },
        {
            title: "Write Something",
            description: "Create, rewrite, or improve your writing.",
            prompt: "Help me write something. Ask me what I want to write.",
        },
        {
            title: "Summarize",
            description: "Turn long information into something simple.",
            prompt: "Help me summarize some information.",
        },
        {
            title: "Learn Something",
            description: "Understand difficult topics more easily.",
            prompt: "Help me understand a difficult topic step by step.",
        },
    ];

    function handleAction(prompt) {
        createConversation();

        navigate(
            `/app/chat?prompt=${encodeURIComponent(prompt)}`
        );
    }

    return (
        <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">
                What would you like to do?
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.map((action) => (
                    <button
                        key={action.title}
                        type="button"
                        onClick={() => handleAction(action.prompt)}
                        className="w-full rounded-2xl border border-n-6 p-5 text-left transition hover:border-n-4 hover:bg-n-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-1"
                    >
                        <h3 className="mb-2 font-semibold">
                            {action.title}
                        </h3>

                        <p className="text-sm text-n-3">
                            {action.description}
                        </p>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default QuickAction;
