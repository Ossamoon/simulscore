import { VFC, ChangeEvent } from "react";

export type Color = "white" | "yellow" | "red" | "green";

export type MemoData = {
  id: string;
  blockId: number;
  text: string;
  color: Color;
};

type Props = {
  newMemo: MemoData;
  onClickCancel: () => void;
  onClickSave: () => void;
  onChangeTextarea: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeColor: (color: Color) => void;
  getMovementFromBlockId: (blockId: number) => string;
  getMeasureFromBlockId: (blockId: number) => string;
};

export const NewMemoCard: VFC<Props> = ({
  newMemo,
  onClickCancel,
  onClickSave,
  onChangeTextarea,
  onChangeColor,
  getMovementFromBlockId,
  getMeasureFromBlockId,
}) => {
  return (
    <div
      className={`w-full rounded p-2 shadow-xl ${
        newMemo?.color === "yellow"
          ? "bg-yellow-100"
          : newMemo?.color === "red"
          ? "bg-red-100"
          : newMemo?.color === "green"
          ? "bg-green-100"
          : "bg-white"
      }`}
    >
      <div
        className={`flex items-baseline border-b mx-1 px-2 py-1 ${
          newMemo?.color === "yellow"
            ? "border-yellow-300"
            : newMemo?.color === "red"
            ? "border-red-300"
            : newMemo?.color === "green"
            ? "border-green-300"
            : "border-warmGray-200"
        }`}
      >
        <div className="flex-grow text-xs text-warmGray-500 truncate mr-1">
          {getMovementFromBlockId(newMemo.blockId)}
        </div>

        <div className="flex-none w-px h-full py-0.5"></div>
        <div
          className={`flex-none w-20 text-right border-l truncate ${
            newMemo?.color === "yellow"
              ? "border-yellow-300"
              : newMemo?.color === "red"
              ? "border-red-300"
              : newMemo?.color === "green"
              ? "border-green-300"
              : "border-warmGray-200"
          }`}
        >
          <span className="text-base font-bold">
            {getMeasureFromBlockId(newMemo.blockId)}{" "}
          </span>
          <span className="text-xs text-warmGray-500">小節</span>
        </div>
      </div>
      <div className="flex space-x-1 items-center pl-3 py-1">
        <div className="text-xs text-warmGray-500 pr-1">カラー</div>
        <div
          onClick={() => {
            onChangeColor("white");
          }}
          className={`w-6 h-6 rounded-full bg-white ${
            newMemo?.color === "white"
              ? "border-2 border-blue-500"
              : "border border-warmGray-400 cursor-pointer"
          }`}
        ></div>
        <div
          onClick={() => {
            onChangeColor("yellow");
          }}
          className={`w-6 h-6 rounded-full bg-yellow-100 ${
            newMemo?.color === "yellow"
              ? "border-2 border-blue-500"
              : "border border-warmGray-400 cursor-pointer"
          }`}
        ></div>
        <div
          onClick={() => {
            onChangeColor("red");
          }}
          className={`w-6 h-6 rounded-full bg-red-100 ${
            newMemo?.color === "red"
              ? "border-2 border-blue-500"
              : "border border-warmGray-400 cursor-pointer"
          }`}
        ></div>
        <div
          onClick={() => {
            onChangeColor("green");
          }}
          className={`w-6 h-6 rounded-full bg-green-100 ${
            newMemo?.color === "green"
              ? "border-2 border-blue-500"
              : "border border-warmGray-400 cursor-pointer"
          }`}
        ></div>
      </div>
      <textarea
        value={newMemo.text}
        onChange={onChangeTextarea}
        className="resize-none w-full border rounded px-1"
      />
      <div className="flex flex-row-reverse items-center pt-1">
        <div
          onClick={onClickSave}
          className="text-xs bg-blue-500 rounded text-white cursor-pointer px-2 py-1 mx-2"
        >
          保存
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
