import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import MentionText from "./MentionText";
import MentionTextarea from "./MentionTextarea";
import {
  getBiteComments,
  getCommentAuthorHandle,
  getCommentAuthorName,
  getCommentContent,
  getCommentId,
} from "../utils/biteEngagement";

export default function BiteCommentBox({
  bite,
  disabled = false,
  error = "",
  submitting = false,
  onOpenProfile,
  onSubmitComment,
}) {
  const [draft, setDraft] = useState("");
  const comments = getBiteComments(bite);
  const cleanedDraft = draft.trim();
  const submitDisabled = disabled || submitting || !cleanedDraft;

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!cleanedDraft || submitting) return;

    const submitted = await onSubmitComment?.(bite, cleanedDraft);
    if (submitted) setDraft("");
  };

  return (
    <div
      className="mt-4 border-t border-gray-200 pt-4"
      onClick={(event) => event.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <MentionTextarea
          value={draft}
          onValueChange={setDraft}
          disabled={submitting}
          rows={2}
          placeholder="Tulis komentar..."
          wrapperClassName="min-w-0 flex-1"
          className="min-h-[44px] w-full resize-none rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={submitDisabled}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          aria-label="Kirim komentar"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      {comments.length > 0 && (
        <div className="mt-3 space-y-2">
          {comments.slice(-3).map((comment, index) => {
            const content = getCommentContent(comment);
            if (!content) return null;

            const authorName = getCommentAuthorName(comment);
            const authorHandle = getCommentAuthorHandle(comment);

            return (
              <div
                key={getCommentId(comment) || `${content}-${index}`}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (authorHandle) onOpenProfile?.(authorHandle);
                  }}
                  disabled={!authorHandle}
                  className="block text-left text-xs font-bold text-gray-900 transition-colors hover:text-pink-500 disabled:hover:text-gray-900"
                >
                  {authorName}
                </button>
                <p className="mt-0.5 whitespace-pre-line text-sm text-gray-700">
                  <MentionText text={content} onOpenProfile={onOpenProfile} />
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
