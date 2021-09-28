import { VFC } from "react";

type Props = {
  selected: boolean;
  onClick: () => void;
};

export const Toggle: VFC<Props> = ({ selected, onClick }) => {
  return (
    <div className="relative cursor-pointer m-1" onClick={onClick}>
      <div
        className={`w-10 h-4 rounded-full shadow-inner transition duration-150 ${
          selected ? "bg-blue-300" : "bg-warmGray-300"
        }`}
      ></div>
      <div
        className={`dot absolute w-6 h-6 rounded-full shadow-2xl -left-1 -top-1 transition duration-150 transform ${
          selected ? "translate-x-full bg-blue-600" : "bg-warmGray-400"
        }`}
      ></div>
    </div>
  );
};
