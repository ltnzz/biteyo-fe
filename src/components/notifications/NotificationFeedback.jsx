export default function NotificationFeedback({ message }) {
  if (!message?.text) return null;

  return (
    <div
      className={`border-b px-4 py-3 text-sm font-medium ${
        message.type === "success"
          ? "border-green-100 bg-green-50 text-green-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      {message.text}
    </div>
  );
}
