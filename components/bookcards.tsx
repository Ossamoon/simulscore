import { VFC } from "react";
import { BookInfo } from "library/getMusicData";

type Props = {
  isFlexWrap: boolean;
  bookInfos?: BookInfo[];
};

export const BookCards: VFC<Props> = ({ isFlexWrap, bookInfos }) => {
  return (
    <div
      className={`w-full flex items-start ${
        isFlexWrap ? "flex-wrap" : "flex-nowrap overflow-y-auto pl-2 pr-4"
      }`}
    >
      {bookInfos?.map((b) => {
        return (
          <a
            key={b.isbn10}
            href={b.link}
            rel="noreferrer"
            target="_blank"
            className="w-min min-w-max p-2 ml-2 mt-4 rounded-lg bg-white cursor-pointer hover:shadow-xl"
          >
            <img
              src={`https://images-na.ssl-images-amazon.com/images/P/${b.isbn10}.09.LZZZZZZZ.jpg`}
              alt=""
              className={isFlexWrap ? "w-40 h-56" : "w-32 h-44"}
            />
            <p
              className={`font-bold text-gray-800 ${
                isFlexWrap ? "w-40 pt-1" : "w-32 pt-0.5 text-sm"
              }`}
            >
              {b.publisher}
            </p>
            <div
              className={`text-xs text-gray-600 ${
                isFlexWrap ? "w-40 pt-0.5" : "w-32 pt-px"
              }`}
            >
              {b.release ? <p>発売日: {b.release}</p> : null}
              {b.size ? <p>大きさ: {b.size}</p> : null}
              {b.page ? <p>ページ数: {b.page}</p> : null}
            </div>
          </a>
        );
      })}
    </div>
  );
};
