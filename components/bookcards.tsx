import { VFC } from "react";
import { BookInfo } from "library/getMusicData";

type Props = {
  bookInfos?: BookInfo[];
};

export const BookCards: VFC<Props> = ({ bookInfos }) => {
  return (
    <div className="w-full flex space-x-2 bg-white rounded-md border-2 border-white items-start flex-nowrap overflow-y-auto px-2 pt-2 pb-4">
      {bookInfos?.map((b) => {
        return (
          <a
            key={b.isbn10}
            href={b.link}
            rel="noreferrer"
            target="_blank"
            className="w-min min-w-max p-2 rounded-lg bg-warmGray-100 cursor-pointer hover:shadow-md"
          >
            <img
              src={`https://images-na.ssl-images-amazon.com/images/P/${b.isbn10}.09.LZZZZZZZ.jpg`}
              alt=""
              className="w-32 h-44"
            />
            <p className="font-bold text-gray-800 w-32 pt-0.5 text-sm">
              {b.publisher}
            </p>
            <div className="text-xs text-gray-600 w-32 pt-px">
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
