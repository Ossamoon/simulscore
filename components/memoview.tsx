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
        .orderBy("updatedAt")
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
  }, [currentUser]);

  return (
    <>
      {/* メモ帳一覧 */}
      <div className="w-full h-16 space-y-2 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2">
        {data?.map((note) => {
          return (
            <div
              key={note.id}
              className={`w-full p-2 rounded-lg text-sm text-warmGray-600 text-left truncate cursor-pointer hover:shadow-md ${
                note.id === displayingNoteId
                  ? "bg-blue-200 font-bold border border-blue-400"
                  : "bg-white"
              }`}
              onClick={() => {
                setDisplayingNoteId(
                  note.id === displayingNoteId ? null : note.id
                );
              }}
            >
              {note.title}
            </div>
          );
        })}
      </div>

      {/* メモ内容 */}
      <div className="w-full font-bold text-green-800 rounded-t-md shadow pl-4 py-2 mt-4">
        {data?.find((n) => n.id === displayingNoteId)?.title}
      </div>
      <div
        className={`w-full space-y-3 bg-warmGray-200 rounded-b-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2 ${
          displayingNoteId === null ? "h-0" : "h-96"
        }`}
      >
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
  );
};
