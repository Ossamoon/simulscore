import { VFC, useState, useContext } from "react";

import { AuthContext } from "components/auth";
import { getNoteData, NoteData } from "library/getNoteData";

type Props = {
  getMovementFromBlockId: (blockId: number) => string;
  getMeasureFromBlockId: (blockId: number) => string;
  onMemoClick: (blockId: number) => void;
};

export const MemoView: VFC<Props> = ({
  getMovementFromBlockId,
  getMeasureFromBlockId,
  onMemoClick,
}) => {
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
      <div className="w-full font-bold text-green-800 rounded-t-md shadow pl-4 py-2 mt-4">
        {notes?.find((n) => n.id === currentNoteId)?.title}
      </div>
      <div
        className={`w-full space-y-3 bg-warmGray-200 rounded-b-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2 ${
          currentNoteId ? "h-96" : "h-0"
        }`}
      >
        {notes
          ?.find((n) => n.id === currentNoteId)
          ?.memos.map((m) => {
            return (
              <div
                key={m.id}
                className="w-full rounded-lg bg-white text-warmGray-600 cursor-pointer hover:shadow-md"
                onClick={() => onMemoClick(m.id)}
              >
                <div className="flex items-baseline border-warmGray-200 border-b mx-1 px-2 py-1">
                  <div className="flex-grow text-xs text-warmGray-500 truncate mr-1">
                    {getMovementFromBlockId(m.id)}
                  </div>

                  <div className="flex-none w-px h-full py-0.5"></div>
                  <div className="flex-none w-20 text-right border-l truncate">
                    <span className="text-base font-bold">
                      {getMeasureFromBlockId(m.id)}{" "}
                    </span>
                    <span className="text-xs text-warmGray-500">小節</span>
                  </div>
                </div>

                <div className="px-3 py-2 text-sm text-warmGray-600">
                  {m.text}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};
