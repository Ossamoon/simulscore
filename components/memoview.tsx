import { VFC, useState, useEffect, useContext } from "react";

import firebase from "../library/firebase";
import { AuthContext } from "components/auth";

type MemoData = { id: number; text: string; color: "white" | "black" };

type NoteData = {
  id: string;
  title: string;
  musicId: string;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  memos: MemoData[];
};

const converter = {
  toFirestore(note: NoteData): firebase.firestore.DocumentData {
    return {
      title: note.title,
      musicId: note.musicId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      memos: note.memos,
    };
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): NoteData {
    const data = snapshot.data(options);
    const newNote: NoteData = {
      id: snapshot.id,
      title: data.title,
      musicId: data.musicId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      memos: data.memos,
    };
    return newNote;
  },
};

type Props = {
  musicId: string;
  getMovementFromBlockId: (blockId: number) => string;
  getMeasureFromBlockId: (blockId: number) => string;
  onMemoClick: (blockId: number) => void;
};

export const MemoView: VFC<Props> = ({
  musicId,
  getMovementFromBlockId,
  getMeasureFromBlockId,
  onMemoClick,
}) => {
  // Auth
  const { currentUser } = useContext(AuthContext);

  // Data & State
  const [data, setData] = useState<NoteData[] | null>(null);
  const [displayingNoteId, setDisplayingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      firebase
        .firestore()
        .collection("private_memos")
        .doc(currentUser?.uid)
        .collection("memos")
        .where("musicId", "==", musicId)
        .orderBy("updatedAt", "desc")
        .withConverter(converter)
        .get()
        .then((querySnapshot) => {
          const tempArray: NoteData[] = [];
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            tempArray.push(doc.data());
          });
          setData(tempArray);
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }, [currentUser, musicId]);

  return (
    <>
      {/* メモ帳一覧 */}
      <div className="w-min flex items-center hover:bg-warmGray-50 hover:shadow-md rounded-md cursor-pointer px-2 py-1 mb-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="#3B82F6"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
        <div className="w-max text-sm text-warmGray-600 pl-1">
          新しいメモ帳を作成
        </div>
      </div>
      <div className="w-full h-20 space-y-2 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2">
        {data?.map((note) => {
          return (
            <div
              key={note.id}
              className={`w-full px-2 rounded-lg text-left truncate cursor-pointer hover:shadow-md ${
                note.id === displayingNoteId
                  ? "bg-blue-200 border border-blue-400"
                  : "bg-white"
              }`}
              onClick={() => {
                setDisplayingNoteId(
                  note.id === displayingNoteId ? null : note.id
                );
              }}
            >
              <div
                className={`text-base text-warmGray-600 pl-1 pt-1 pb-0.5  ${
                  note.id === displayingNoteId ? "font-bold" : ""
                }`}
              >
                {note.title}
              </div>
              <div
                className={`text-xs italic border-t pl-1 py-px ${
                  note.id === displayingNoteId
                    ? "border-blue-300 text-warmGray-500"
                    : "border-warmGray-300 text-warmGray-400"
                }`}
              >
                <span>
                  最終更新: {note.updatedAt.toDate().toLocaleDateString()}
                </span>
                <span className="ml-3">
                  作成日: {note.createdAt.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* メモ内容 */}
      {displayingNoteId === null ? null : (
        <>
          <div className="w-min flex items-center hover:bg-warmGray-50 hover:shadow-md rounded-md cursor-pointer px-2 py-1 mt-4 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
              fill="#3B82F6"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            <div className="w-max text-sm text-warmGray-600 pl-1">
              新しいメモを追加
            </div>
          </div>
          <div className="w-full h-96 space-y-3 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2">
            {data
              ?.find((n) => n.id === displayingNoteId)
              ?.memos.map((m) => {
                return (
                  <div
                    key={m.id.toString()}
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
      )}
    </>
  );
};
