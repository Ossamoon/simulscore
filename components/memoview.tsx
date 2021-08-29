import {
  VFC,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";

import firebase from "library/firebase";
import { AuthContext } from "components/auth";
import { MemoEdit, NewMemoCard, Color } from "components/memocard";
import { NoteTitle, NewNoteCard, DeleteNoteCard } from "components/notecard";

const MAX_MEMO_TEXT_LENGTH = 140;
const MAX_NOTE_TITLE_LENGTH = 40;
const MAX_MEMOS_PER_NOTE = 100;
const MAX_NOTES_PER_MUSIC = 10;

type NoteData = {
  id: string;
  title: string;
  musicId: string;
  timestamp: firebase.firestore.Timestamp | "now";
  memos: MemoData[];
};

type MemoData = {
  blockId: number;
  createdAt: number;
  text: string;
  color: Color;
};

type Props = {
  musicId: string;
  currentBlockId: number;
  getMovementFromBlockId: (blockId: number) => string;
  getMeasureFromBlockId: (blockId: number) => string;
  onMemoClick: (blockId: number) => void;
};

const converter = {
  toFirestore(note: NoteData): firebase.firestore.DocumentData {
    return {
      title: note.title,
      musicId: note.musicId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      memos: note.memos,
    };
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): NoteData {
    const data = snapshot.data(options);
    // データ検証
    if (
      !(
        typeof data.title === "string" &&
        data.title !== "" &&
        data.title.length <= MAX_NOTE_TITLE_LENGTH &&
        typeof data.musicId === "string" &&
        data.musicId.length === 5 &&
        data.timestamp instanceof firebase.firestore.Timestamp &&
        Array.isArray(data.memos) &&
        data.memos.length <= MAX_MEMOS_PER_NOTE &&
        data.memos.every(
          (memo) =>
            typeof memo.blockId === "number" &&
            typeof memo.createdAt === "number" &&
            typeof memo.text === "string" &&
            memo.text.length <= MAX_MEMO_TEXT_LENGTH &&
            typeof memo.color === "string" &&
            (memo.color === "white" ||
              memo.color === "yellow" ||
              memo.color === "red" ||
              memo.color === "green")
        )
      )
    ) {
      throw new Error("invalid data schema");
    }
    const newNote: NoteData = {
      id: snapshot.id,
      title: data.title,
      musicId: data.musicId,
      timestamp: data.timestamp,
      memos: data.memos,
    };
    return newNote;
  },
};

export const MemoView: VFC<Props> = ({
  musicId,
  currentBlockId,
  getMovementFromBlockId,
  getMeasureFromBlockId,
  onMemoClick,
}) => {
  // Auth
  const { currentUser } = useContext(AuthContext);

  // Data & State
  const [data, setData] = useState<NoteData[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState<NoteTitle | null>(null);
  const [deleteNoteTitle, setDeleteNoteTitle] = useState<NoteTitle | null>(
    null
  );
  const [newMemoEdit, setNewMemoEdit] = useState<MemoEdit | null>(null);
  const [displayingNoteId, setDisplayingNoteId] = useState<string | null>(null);
  const displayingNote: NoteData | undefined = useMemo(
    () => data.find((n) => n.id === displayingNoteId),
    [data, displayingNoteId]
  );

  // initial effect
  useEffect(() => {
    if (currentUser) {
      firebase
        .firestore()
        .collection("private_memos")
        .doc(currentUser?.uid)
        .collection("memos")
        .where("musicId", "==", musicId)
        .orderBy("timestamp", "desc")
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
          console.error("Error getting documents: ", error);
        });
    }
  }, [currentUser, musicId]);

  // save to create new note
  const saveAddingNewNote = useCallback(() => {
    if (newNoteTitle === null) {
      alert("保存に失敗しました");
      console.error("Error adding new note: newNoteTitle === null");
    } else if (newNoteTitle.title === "") {
      alert("タイトルを記入してください");
    } else if (newNoteTitle.title.length > MAX_NOTE_TITLE_LENGTH) {
      alert("文字数を超過しています。タイトルは40文字以内で記入してください。");
    } else {
      firebase
        .firestore()
        .collection("private_memos")
        .doc(currentUser?.uid)
        .collection("memos")
        .add({
          title: newNoteTitle.title,
          musicId: musicId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          memos: [],
        })
        .then((docRef) => {
          setNewNoteTitle(null);
          setData([
            {
              id: docRef.id,
              title: newNoteTitle.title,
              musicId: musicId,
              timestamp: "now",
              memos: [],
            },
            ...data,
          ]);
          setDisplayingNoteId(docRef.id);
        })
        .catch((error) => {
          alert("作成に失敗しました。時間をおいて再度お試しください。");
          console.error("Error adding document: ", error);
        });
    }
  }, [currentUser, data, musicId, newNoteTitle]);

  // save to update new title
  const saveUpdatingNote = useCallback(() => {
    if (newNoteTitle === null) {
      alert("保存に失敗しました");
      console.error("Error updating note: newNoteTitle === null");
    } else if (newNoteTitle.title === "") {
      alert("タイトルを記入してください");
    } else if (newNoteTitle.title.length > MAX_NOTE_TITLE_LENGTH) {
      alert(
        `文字数を超過しています。タイトルは${MAX_NOTE_TITLE_LENGTH}文字以内で記入してください。`
      );
    } else {
      const oldNote = data.find((note) => note.id === newNoteTitle.id);
      if (oldNote === undefined) {
        console.error("Error updating note: oldNote is undefined");
      } else {
        firebase
          .firestore()
          .collection("private_memos")
          .doc(currentUser?.uid)
          .collection("memos")
          .doc(newNoteTitle.id)
          .update({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            title: newNoteTitle.title,
          })
          .then(() => {
            const newNote = { ...oldNote };
            newNote["title"] = newNoteTitle.title;
            newNote["timestamp"] = "now";
            setNewNoteTitle(null);
            setData([
              newNote,
              ...data.filter((note) => note.id !== newNoteTitle.id),
            ]);
            setDisplayingNoteId(newNoteTitle.id);
          })
          .catch((error) => {
            alert("保存に失敗しました。時間をおいて再度お試しください。");
            console.error("Error adding document: ", error);
          });
      }
    }
  }, [currentUser, data, newNoteTitle]);

  // delete note
  const deleteNote = useCallback(() => {
    if (deleteNoteTitle === null) {
      alert("削除に失敗しました");
      console.error("Error deleting note: deleteNoteTitle === null");
    } else {
      const oldNote = data.find((note) => note.id === deleteNoteTitle.id);
      if (oldNote === undefined) {
        console.error("oldNote is undefined");
      } else {
        firebase
          .firestore()
          .collection("private_memos")
          .doc(currentUser?.uid)
          .collection("memos")
          .doc(deleteNoteTitle.id)
          .delete()
          .then(() => {
            setDeleteNoteTitle(null);
            setData([...data.filter((note) => note.id !== deleteNoteTitle.id)]);
            if (displayingNoteId === deleteNoteTitle.id) {
              setDisplayingNoteId(null);
            }
          })
          .catch((error) => {
            alert("削除に失敗しました。時間をおいて再度お試しください。");
            console.error("Error removing document: ", error);
          });
      }
    }
  }, [currentUser, data, deleteNoteTitle, displayingNoteId]);

  // save to add or edit memo to current displayed note
  const saveMemo = useCallback(() => {
    if (displayingNoteId === null) {
      alert("メモの保存に失敗しました");
      console.error("Error saving memo: displayingNoteId === null");
    } else if (displayingNote === undefined) {
      alert("メモの保存に失敗しました");
      console.error("Error saving memo: displayingNote === undefined");
    } else if (newMemoEdit === null) {
      alert("メモの保存に失敗しました");
      console.error("Error saving memo: newMemo === null");
    } else if (newMemoEdit.text === "") {
      alert("テキストを入力してください");
    } else if (newMemoEdit.text.length > MAX_MEMO_TEXT_LENGTH) {
      alert(
        `文字数を超過しています。メモは${MAX_MEMO_TEXT_LENGTH}文字以内で記入してください。`
      );
    } else {
      const newMemoArray: MemoData[] = [
        { ...newMemoEdit, createdAt: newMemoEdit.createdAt ?? Date.now() },
        ...displayingNote.memos.filter(
          (m) =>
            m.blockId !== newMemoEdit.blockId ||
            m.createdAt !== newMemoEdit.createdAt
        ),
      ].sort((a, b) => {
        if (a.blockId - b.blockId > 0) {
          return 1;
        } else if (a.blockId === b.blockId && a.createdAt - b.createdAt < 0) {
          return 1;
        } else {
          return -1;
        }
      });
      firebase
        .firestore()
        .collection("private_memos")
        .doc(currentUser?.uid)
        .collection("memos")
        .doc(displayingNoteId)
        .update({
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          memos: newMemoArray,
        })
        .then(() => {
          const newNote = { ...displayingNote };
          newNote["memos"] = newMemoArray;
          newNote["timestamp"] = "now";

          setNewMemoEdit(null);
          setData([
            newNote,
            ...data.filter((note) => note.id !== displayingNoteId),
          ]);
        })
        .catch((error) => {
          alert("メモの作成に失敗しました。時間をおいて再度お試しください。");
          console.error("Error adding document: ", error);
        });
    }
  }, [currentUser, data, displayingNoteId, displayingNote, newMemoEdit]);

  // delete memo
  const deleteMemo = useCallback(
    (blockId: number, createdAt: number) => {
      if (displayingNoteId === null) {
        alert("メモの保存に失敗しました");
        console.error("Error deleting memo: displayingNoteId === null");
      } else if (displayingNote === undefined) {
        alert("メモの保存に失敗しました");
        console.error("Error deleting memo: displayingNote === undefined");
      } else {
        const newMemoArray: MemoData[] = [
          ...displayingNote.memos.filter(
            (m) => m.blockId !== blockId || m.createdAt !== createdAt
          ),
        ].sort((a, b) => {
          if (a.blockId - b.blockId > 0) {
            return 1;
          } else if (a.blockId === b.blockId && a.createdAt - b.createdAt < 0) {
            return 1;
          } else {
            return -1;
          }
        });
        firebase
          .firestore()
          .collection("private_memos")
          .doc(currentUser?.uid)
          .collection("memos")
          .doc(displayingNoteId)
          .update({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            memos: newMemoArray,
          })
          .then(() => {
            const newNote = { ...displayingNote };
            newNote["memos"] = newMemoArray;
            newNote["timestamp"] = "now";

            setData([
              newNote,
              ...data.filter((note) => note.id !== displayingNoteId),
            ]);
          })
          .catch((error) => {
            alert("メモの削除に失敗しました。時間をおいて再度お試しください。");
            console.error("Error adding document: ", error);
          });
      }
    },
    [currentUser, data, displayingNoteId, displayingNote]
  );

  // JSX
  return (
    <>
      {/* メモ帳一覧 */}
      <div
        onClick={() => {
          if (data.length >= MAX_NOTES_PER_MUSIC) {
            alert(
              `メモ帳の数が上限に達しています。一曲あたり作成できるメモ帳は${MAX_NOTES_PER_MUSIC}件までです。`
            );
          } else {
            setNewNoteTitle({ id: "", title: "" });
          }
        }}
        className="w-min flex items-center hover:bg-warmGray-50 hover:shadow-md rounded-md cursor-pointer px-2 py-1 mb-1"
      >
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

      <div className="relative w-full h-28">
        {newNoteTitle === null ? null : (
          <>
            {/* メモ帳の追加・編集モーダル */}
            <div className="absolute inset-0 w-full h-full rounded-md bg-black bg-opacity-20 z-20"></div>
            <div className="absolute inset-0 p-3 z-30">
              <NewNoteCard
                newNoteTitle={newNoteTitle}
                onClickCancel={() => {
                  setNewNoteTitle(null);
                }}
                onClickSave={() => {
                  if (newNoteTitle.id === "") {
                    saveAddingNewNote();
                  } else {
                    saveUpdatingNote();
                  }
                }}
                onChangeText={(e) => {
                  setNewNoteTitle((note) => {
                    if (note) {
                      return {
                        id: note.id,
                        title: e.target.value,
                      };
                    } else {
                      return null;
                    }
                  });
                }}
              />
            </div>
          </>
        )}
        {deleteNoteTitle === null ? null : (
          <>
            <div className="absolute inset-0 w-full h-full rounded-md bg-black bg-opacity-20 z-20"></div>
            <div className="absolute inset-0 p-3 z-30">
              <DeleteNoteCard
                deleteNoteTitle={deleteNoteTitle}
                onClickCancel={() => {
                  setDeleteNoteTitle(null);
                }}
                onClickDelete={deleteNote}
              />
            </div>
          </>
        )}
        <div className="w-full h-full space-y-2 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2">
          {data.map((note) => {
            return (
              <div key={note.id} className="group relative w-full">
                {/* メモ帳カード */}
                <div
                  className={`w-full px-2 rounded-lg text-left truncate cursor-pointer hover:shadow-md z-0 border-2 ${
                    note.id === displayingNoteId
                      ? "bg-blue-200 border-blue-400"
                      : "bg-white border-white"
                  }`}
                  onClick={() => {
                    setDisplayingNoteId(
                      note.id === displayingNoteId ? null : note.id
                    );
                  }}
                >
                  <div
                    className={`text-base text-warmGray-600 pl-1 py-1 truncate ${
                      note.id === displayingNoteId ? "font-bold" : ""
                    }`}
                  >
                    {note.title}
                  </div>
                  <div
                    className={`text-xs italic border-t pl-1 py-0.5 ${
                      note.id === displayingNoteId
                        ? "border-blue-300 text-warmGray-500"
                        : "border-warmGray-300 text-warmGray-400"
                    }`}
                  >
                    <span>
                      最終保存:{" "}
                      {note.timestamp === "now"
                        ? "たった今"
                        : note.timestamp.toDate().toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="hidden group-hover:flex space-x-2 absolute bottom-1 right-2 z-10">
                  {/* タイトル編集ボタン */}
                  <div
                    onClick={() => {
                      setNewNoteTitle({ id: note.id, title: note.title });
                    }}
                    className="flex items-center w-10 h-10 bg-warmGray-200 bg-opacity-70 rounded-lg hover:shadow-md cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28px"
                      height="28px"
                      viewBox="0 0 24 24"
                      fill="#78716C"
                      className="mx-auto"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
                    </svg>
                  </div>
                  {/* メモ帳削除ボタン */}
                  <div
                    onClick={() => {
                      setDeleteNoteTitle({ id: note.id, title: note.title });
                    }}
                    className="flex items-center w-10 h-10 bg-red-300 bg-opacity-70 rounded-lg hover:shadow-md cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28px"
                      height="28px"
                      viewBox="0 0 24 24"
                      fill="#EF4444"
                      className="mx-auto"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* メモ内容 */}
      {displayingNoteId === null ? null : (
        <>
          <div
            onClick={() => {
              if (displayingNote === undefined) {
                console.error(
                  "Error setting new memo edit: displayingNote === undefined"
                );
              } else if (displayingNote.memos.length >= MAX_MEMOS_PER_NOTE) {
                alert(
                  `メモ数が上限に達しています。1つのメモ帳につきメモは最大${MAX_MEMOS_PER_NOTE}件まで登録可能です。`
                );
              } else if (getMeasureFromBlockId(currentBlockId) === "") {
                alert("楽譜から小節を選択してください");
              } else {
                setNewMemoEdit({
                  blockId: currentBlockId,
                  createdAt: null,
                  text: "",
                  color: "white",
                });
              }
            }}
            className="w-min flex items-center hover:bg-warmGray-50 hover:shadow-md rounded-md cursor-pointer px-2 py-1 mt-4 mb-1"
          >
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
              メモの追加
            </div>
          </div>
          <div className="relative w-full h-96">
            {newMemoEdit === null ? null : (
              <>
                {/* メモの追加・編集モーダル */}
                <div className="absolute inset-0 w-full h-full rounded-md bg-black bg-opacity-20 z-20"></div>
                <div className="absolute inset-0 w-full h-full p-3 z-30">
                  <NewMemoCard
                    newMemo={newMemoEdit}
                    onClickCancel={() => {
                      setNewMemoEdit(null);
                    }}
                    onClickSave={saveMemo}
                    onChangeTextarea={(e) => {
                      setNewMemoEdit((m) => {
                        if (m) {
                          return {
                            blockId: m.blockId,
                            createdAt: m.createdAt,
                            text: e.target.value,
                            color: m.color,
                          };
                        } else {
                          return null;
                        }
                      });
                    }}
                    onChangeColor={(color) => {
                      setNewMemoEdit((m) => {
                        if (m) {
                          return {
                            blockId: m.blockId,
                            createdAt: m.createdAt,
                            text: m.text,
                            color: color,
                          };
                        } else {
                          return null;
                        }
                      });
                    }}
                    getMovementFromBlockId={getMovementFromBlockId}
                    getMeasureFromBlockId={getMeasureFromBlockId}
                  />
                </div>
              </>
            )}
            <div className="w-full h-full space-y-3 bg-warmGray-200 rounded-md shadow-inner flex-nowrap overflow-y-auto pl-2 pr-4 py-2">
              {displayingNote?.memos.map((m) => {
                return (
                  <div
                    key={m.blockId.toString() + "_" + m.createdAt.toString()}
                    className="group relative w-full"
                  >
                    {/* メモカード */}
                    <div
                      className={`w-full rounded-lg text-warmGray-600 cursor-pointer hover:shadow-md p-1 z-0 border-2 ${
                        m?.color === "yellow"
                          ? "bg-yellow-100"
                          : m?.color === "red"
                          ? "bg-red-100"
                          : m?.color === "green"
                          ? "bg-green-100"
                          : "bg-white"
                      } ${
                        currentBlockId === m.blockId
                          ? "border-blue-500"
                          : "border-white"
                      }`}
                      onClick={() => onMemoClick(m.blockId)}
                    >
                      <div
                        className={`flex items-center border-b mx-1 px-2 py-1 ${
                          m?.color === "yellow"
                            ? "border-yellow-300"
                            : m?.color === "red"
                            ? "border-red-300"
                            : m?.color === "green"
                            ? "border-green-300"
                            : "border-warmGray-200"
                        }`}
                      >
                        <div className="flex-grow text-xs text-warmGray-500 truncate mr-1">
                          {getMovementFromBlockId(m.blockId)}
                        </div>
                        <div
                          className={`flex-none w-20 text-right border-l truncate ${
                            m?.color === "yellow"
                              ? "border-yellow-300"
                              : m?.color === "red"
                              ? "border-red-300"
                              : m?.color === "green"
                              ? "border-green-300"
                              : "border-warmGray-200"
                          }`}
                        >
                          <span className="text-base font-bold">
                            {getMeasureFromBlockId(m.blockId)}{" "}
                          </span>
                          <span className="text-xs text-warmGray-500">
                            小節
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-2 text-sm text-warmGray-600">
                        {m.text}
                      </div>
                    </div>
                    <div className="hidden group-hover:flex space-x-2 absolute bottom-1 right-2 z-10">
                      {/* メモ編集ボタン */}
                      <div
                        onClick={() => {
                          setNewMemoEdit({
                            blockId: m.blockId,
                            createdAt: m.createdAt,
                            text: m.text,
                            color: m.color,
                          });
                        }}
                        className="flex items-center w-10 h-10 bg-warmGray-200 bg-opacity-70 rounded-lg hover:shadow-md cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28px"
                          height="28px"
                          viewBox="0 0 24 24"
                          fill="#78716C"
                          className="mx-auto"
                        >
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
                        </svg>
                      </div>
                      {/* メモ削除ボタン */}
                      <div
                        onClick={() => {
                          deleteMemo(m.blockId, m.createdAt);
                        }}
                        className="flex items-center w-10 h-10 bg-red-300 bg-opacity-70 rounded-lg hover:shadow-md cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28px"
                          height="28px"
                          viewBox="0 0 24 24"
                          fill="#EF4444"
                          className="mx-auto"
                        >
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
