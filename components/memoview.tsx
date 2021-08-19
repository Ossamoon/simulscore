import { VFC, useState, useContext } from "react";

import { AuthContext } from "components/auth";
import { getNoteData, NoteData } from "library/getNoteData";

export const MemoView: VFC = () => {
  // Auth
  const { currentUser } = useContext(AuthContext);

  // Data
  const notes: NoteData[] = getNoteData("A0011");

  // State
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  return (
    <>
      {/* メモ帳一覧 */}
      <div className="w-full h-16 space-y-2 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2">
        {notes
          ?.map((n) => {
            return { id: n.id, title: n.title };
          })
          .map((n) => {
            return (
              <div
                key={n.id}
                className={`w-full p-2 rounded-lg text-sm text-warmGray-600 text-left truncate cursor-pointer hover:shadow-md ${
                  n.id === currentNoteId
                    ? "bg-blue-200 font-bold border border-blue-400"
                    : "bg-white"
                }`}
                onClick={() => {
                  setCurrentNoteId(n.id === currentNoteId ? null : n.id);
                }}
              >
                {n.title}
              </div>
            );
          })}
      </div>

      {/* メモ内容 */}
      <div className="w-full font-bold text-warmGray-600 rounded-t-md shadow pl-4 py-2 mt-4">
        {notes?.find((n) => n.id === currentNoteId)?.title}
      </div>
      <div
        className={`w-full space-y-2 bg-warmGray-200 rounded-b-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2 ${
          currentNoteId ? "h-96" : "h-0"
        }`}
      >
        {notes
          ?.find((n) => n.id === currentNoteId)
          ?.memos.map((m) => {
            return (
              <div
                key={m.id}
                className="w-full p-2 rounded-lg bg-white text-sm text-warmGray-600 truncate cursor-pointer hover:shadow-md"
              >
                {m.text}
              </div>
            );
          })}
      </div>
    </>
  );
};
