import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMentionUserByUsername, getMentionUsers } from "../services/profileApi";

const MENTION_DEBOUNCE_MS = 180;
const MAX_SUGGESTIONS = 8;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]*$/;

let cachedMentionUsers = null;
let mentionUsersRequest = null;
const mentionUsersByQuery = new Map();
const mentionUsersRequestByQuery = new Map();

const findActiveMention = (value, caretPosition) => {
  const textBeforeCaret = value.slice(0, caretPosition);
  const atIndex = textBeforeCaret.lastIndexOf("@");

  if (atIndex === -1) return null;

  const charBeforeAt = atIndex > 0 ? textBeforeCaret[atIndex - 1] : " ";
  const query = textBeforeCaret.slice(atIndex + 1);

  if (!/[\s([{]/.test(charBeforeAt)) return null;
  if (!USERNAME_PATTERN.test(query)) return null;

  return {
    end: caretPosition,
    query,
    start: atIndex,
  };
};

const mergeMentionUsers = (...userGroups) => {
  const seen = new Set();

  return userGroups
    .flat()
    .filter(Boolean)
    .filter((user) => {
      const key = String(user.username || user.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const loadMentionUsers = async () => {
  if (cachedMentionUsers) return cachedMentionUsers;

  if (!mentionUsersRequest) {
    mentionUsersRequest = getMentionUsers()
      .then((users) => {
        cachedMentionUsers = users;
        return users;
      })
      .finally(() => {
        mentionUsersRequest = null;
      });
  }

  return mentionUsersRequest;
};

const loadMentionUsersByQuery = async (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return loadMentionUsers();
  if (mentionUsersByQuery.has(normalizedQuery)) {
    return mentionUsersByQuery.get(normalizedQuery);
  }

  if (!mentionUsersRequestByQuery.has(normalizedQuery)) {
    mentionUsersRequestByQuery.set(
      normalizedQuery,
      Promise.all([
        getMentionUsers(normalizedQuery).catch(() => []),
        getMentionUserByUsername(normalizedQuery).catch(() => null),
      ])
        .then(([users, exactUser]) => {
          const nextUsers = mergeMentionUsers(users, [exactUser]);
          mentionUsersByQuery.set(normalizedQuery, nextUsers);
          return nextUsers;
        })
        .finally(() => {
          mentionUsersRequestByQuery.delete(normalizedQuery);
        }),
    );
  }

  return mentionUsersRequestByQuery.get(normalizedQuery);
};

export default function MentionTextarea({
  className = "",
  disabled = false,
  onValueChange,
  value,
  wrapperClassName = "",
  ...props
}) {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const [caretPosition, setCaretPosition] = useState(value.length);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(() => cachedMentionUsers || []);

  const activeMention = useMemo(
    () => (disabled ? null : findActiveMention(value, caretPosition)),
    [caretPosition, disabled, value],
  );

  const suggestions = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();

    return users
      .filter((user) => {
        if (!query) return true;

        return [user.username, user.displayName]
          .filter(Boolean)
          .some((item) => item.toLowerCase().includes(query));
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [debouncedQuery, users]);

  useEffect(() => {
    if (!activeMention) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedQuery(activeMention.query);
      setOpen(true);
    }, MENTION_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [activeMention]);

  useEffect(() => {
    if (!open || !activeMention) return undefined;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      const query = debouncedQuery.trim();
      const hasCachedQuery = query
        ? mentionUsersByQuery.has(query.toLowerCase())
        : Boolean(cachedMentionUsers);

      if (!hasCachedQuery) setLoading(true);

      loadMentionUsersByQuery(query)
        .then((nextUsers) => {
          if (!cancelled) setUsers(nextUsers);
        })
        .catch(() => {
          if (!cancelled) setUsers([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeMention, debouncedQuery, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const updateCaretPosition = (target, { reopen = false } = {}) => {
    const nextCaretPosition = target.selectionStart ?? target.value.length;

    setCaretPosition(nextCaretPosition);

    if (reopen && findActiveMention(target.value, nextCaretPosition)) {
      setOpen(true);
    }
  };

  const handleChange = (event) => {
    updateCaretPosition(event.target);
    onValueChange?.(event.target.value);
  };

  const handleSelect = (user) => {
    if (!activeMention) return;

    const beforeMention = value.slice(0, activeMention.start);
    const afterMention = value.slice(activeMention.end);
    const suffix = afterMention.startsWith(" ") || afterMention.startsWith("\n") ? "" : " ";
    const mentionText = `@${user.username}`;
    const nextValue = `${beforeMention}${mentionText}${suffix}${afterMention}`;
    const nextCaretPosition = beforeMention.length + mentionText.length + suffix.length;

    onValueChange?.(nextValue);
    setOpen(false);
    setCaretPosition(nextCaretPosition);

    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition);
    }, 0);
  };

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName}`}>
      <textarea
        {...props}
        ref={textareaRef}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onClick={(event) => updateCaretPosition(event.currentTarget, { reopen: true })}
        onFocus={(event) => updateCaretPosition(event.currentTarget, { reopen: true })}
        onKeyUp={(event) => updateCaretPosition(event.currentTarget)}
        className={className}
      />

      {open && activeMention && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
              Memuat user...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((user) => (
              <button
                key={user.id || user.username}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(user)}
                className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-pink-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-100 text-sm font-bold text-pink-500">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.displayName.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-900">
                    {user.displayName}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    @{user.username}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">User tidak ditemukan.</p>
          )}
        </div>
      )}
    </div>
  );
}
