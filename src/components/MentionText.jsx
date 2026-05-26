const MENTION_REGEX = /(^|[^a-zA-Z0-9_.-])@([a-zA-Z0-9_.-]+)/g;

const getMentionParts = (text) => {
  const value = String(text || "");
  const parts = [];
  let lastIndex = 0;
  let match;

  MENTION_REGEX.lastIndex = 0;

  while ((match = MENTION_REGEX.exec(value)) !== null) {
    const [fullMatch, prefix, username] = match;
    const mentionStart = match.index + prefix.length;

    if (mentionStart > lastIndex) {
      parts.push({ text: value.slice(lastIndex, mentionStart), type: "text" });
    }

    parts.push({ text: `@${username}`, type: "mention", username });
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < value.length) {
    parts.push({ text: value.slice(lastIndex), type: "text" });
  }

  return parts;
};

export default function MentionText({ className = "", onOpenProfile, text }) {
  const parts = getMentionParts(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type !== "mention") {
          return <span key={`${part.text}-${index}`}>{part.text}</span>;
        }

        return (
          <button
            key={`${part.username}-${index}`}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenProfile?.(part.username);
            }}
            className="font-semibold text-pink-600 transition-colors hover:text-pink-700 hover:underline"
          >
            {part.text}
          </button>
        );
      })}
    </span>
  );
}
