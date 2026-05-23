export default function ActionMessage({ message }) {
  if (!message?.text) return null;

  return (
    <div
      className={`px-4 py-3 text-sm font-medium border-b ${
        message.type === "success"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {message.text}
    </div>
  );
}
