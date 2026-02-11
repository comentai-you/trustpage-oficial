import { FakeComment } from "@/types/advertorial";
import { ThumbsUp, MessageCircle } from "lucide-react";

interface Props {
  comments: FakeComment[];
}

const FakeCommentsSection = ({ comments }: Props) => {
  if (!comments.length) return null;

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <MessageCircle className="w-5 h-5" /> Comentários ({comments.length})
      </h3>
      <div className="space-y-4">
        {comments.map((comment, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              {comment.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{comment.name}</span>
                <span className="text-xs text-gray-400">{comment.timeAgo}</span>
              </div>
              <p className="text-sm text-gray-700" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{comment.text}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500">
                  <ThumbsUp className="w-3 h-3" /> {comment.likes}
                </button>
                <button className="text-xs text-gray-400 hover:text-blue-500">Responder</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FakeCommentsSection;
