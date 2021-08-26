import { VFC, ChangeEvent } from "react";

export type NoteTitle = { id: string; title: string };

type Props = {
  newNoteTitle: NoteTitle;
  onClickCancel: () => void;
  onClickSave: () => void;
  onChangeText: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const NewNoteCard: VFC<Props> = ({
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
      <div className="flex flex-row-reverse items-center pt-1">
        <div
          onClick={onClickSave}
          className="text-xs bg-blue-500 rounded text-white cursor-pointer px-2 py-1 mx-2"
        >
          作成
        </div>
        <div
          onClick={onClickCancel}
          className="text-xs text-blue-600 cursor-pointer"
        >
          キャンセル
        </div>
      </div>
    </div>
  );
};
