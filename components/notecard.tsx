import { VFC, ChangeEvent } from "react";

export type NoteTitle = { id: string; title: string };

type NewNoteCardProps = {
  newNoteTitle: NoteTitle;
  onClickCancel: () => void;
  onClickSave: () => void;
  onChangeText: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const NewNoteCard: VFC<NewNoteCardProps> = ({
  newNoteTitle,
  onClickCancel,
  onClickSave,
  onChangeText,
}) => {
  return (
    <div className="bg-white w-full rounded shadow-xl p-2">
      <input
        type="text"
        value={newNoteTitle.title}
        onChange={onChangeText}
        className="w-full border rounded px-1"
      />
      <div className="flex flex-row-reverse items-center pt-2">
        <div
          onClick={onClickSave}
          className="text-sm bg-blue-500 rounded text-white cursor-pointer px-2 py-1 mx-2"
        >
          {newNoteTitle.id === "" ? "作成" : "保存"}
        </div>
        <div
          onClick={onClickCancel}
          className="text-sm text-blue-600 cursor-pointer"
        >
          キャンセル
        </div>
      </div>
    </div>
  );
};

type DeleteNoteCardProps = {
  deleteNoteTitle: NoteTitle;
  onClickCancel: () => void;
  onClickDelete: () => void;
};

export const DeleteNoteCard: VFC<DeleteNoteCardProps> = ({
  deleteNoteTitle,
  onClickCancel,
  onClickDelete,
}) => {
  return (
    <div className="bg-red-50 w-full rounded shadow-xl p-2">
      <div className="text-sm text-warmGray-700 px-2">
        <span className="font-bold">{deleteNoteTitle.title}</span>{" "}
        を削除しますか？
      </div>
      <div className="flex flex-row-reverse items-center pt-2">
        <div
          onClick={onClickDelete}
          className="text-sm bg-red-500 rounded text-white cursor-pointer px-2 py-1 mx-2"
        >
          削除
        </div>
        <div
          onClick={onClickCancel}
          className="text-sm text-blue-600 cursor-pointer"
        >
          キャンセル
        </div>
      </div>
    </div>
  );
};
