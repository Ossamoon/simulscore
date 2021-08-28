import { VFC, useState, useEffect, useContext, useCallback } from "react";

import firebase from "library/firebase";
import { AuthContext } from "components/auth";
import { MemoEdit, NewMemoCard, Color } from "components/memocard";
import { NoteTitle, NewNoteCard, DeleteNoteCard } from "components/notecard";

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
  const [newMemo, setNewMemo] = useState<MemoEdit | null>(null);
  const [displayingNoteId, setDisplayingNoteId] = useState<string | null>(null);

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
          console.log("Error getting documents: ", error);
        });
    }
  }, [currentUser, musicId]);

  // save to create new note
  const saveAddingNewNote = useCallback(() => {
    if (newNoteTitle === null) {
      alert("保存に失敗しました");
      console.log("Error: newNoteTitle === null");
    } else if (newNoteTitle.title === "") {
      alert("タイトルを記入してください");
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
      console.log("Error: newNoteTitle === null");
    } else if (newNoteTitle.title === "") {
      alert("タイトルを記入してください");
    } else {
      const oldNote = data.find((note) => note.id === newNoteTitle.id);
      if (oldNote === undefined) {
        console.log(
          "Error: ```data.find((note) => note.id === newNoteTitle.id)``` is undefined"
        );
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
      console.log("Error: deleteNoteTitle === null");
    } else {
      const oldNote = data.find((note) => note.id === deleteNoteTitle.id);
      if (oldNote === undefined) {
        console.log(
          "Error: ```data.find((note) => note.id === deleteNoteTitle.id)``` is undefined"
        );
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

  // save to add new memo to current displayed note
  const saveMemo = useCallback(() => {
    const oldNote = data.find((note) => note.id === displayingNoteId);
    if (displayingNoteId === null) {
      alert("メモの保存に失敗しました");
      console.log("Error: displayingNoteId === null");
    } else if (newMemo === null) {
      alert("メモの保存に失敗しました");
      console.log("Error: newMemo === null");
    } else if (newMemo.text === "") {
      alert("テキストを入力してください");
    } else if (oldNote === undefined) {
      alert("メモの保存に失敗しました");
      console.log("Error: oldNote === undefined");
    } else {
      const newMemoArray: MemoData[] = [
        { ...newMemo, createdAt: newMemo.createdAt ?? Date.now() },
        ...oldNote.memos.filter(
          (m) =>
            m.blockId !== newMemo.blockId || m.createdAt !== newMemo.createdAt
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
          const newNote = { ...oldNote };
          newNote["memos"] = newMemoArray;
          newNote["timestamp"] = "now";

          setNewMemo(null);
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
  }, [currentUser, data, displayingNoteId, newMemo]);

  // JSX
  return (
    <>
      {/* メモ帳一覧 */}
      <div
        onClick={() => {
          setNewNoteTitle({ id: "", title: "" });
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
          {data?.map((note) => {
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
              if (getMeasureFromBlockId(currentBlockId) === "") {
                alert("楽譜から小節を選択してください");
              } else {
                setNewMemo({
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
            {newMemo === null ? null : (
              <>
                {/* メモの追加・編集モーダル */}
                <div className="absolute inset-0 w-full h-full rounded-md bg-black bg-opacity-20 z-20"></div>
                <div className="absolute inset-0 w-full h-full p-3 z-30">
                  <NewMemoCard
                    newMemo={newMemo}
                    onClickCancel={() => {
                      setNewMemo(null);
                    }}
                    onClickSave={saveMemo}
                    onChangeTextarea={(e) => {
                      setNewMemo((m) => {
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
                      setNewMemo((m) => {
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
              {data
                ?.find((n) => n.id === displayingNoteId)
                ?.memos.map((m) => {
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
                          className={`flex items-baseline border-b mx-1 px-2 py-1 ${
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
                            setNewMemo({
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
                            console.log("削除するよ");
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
