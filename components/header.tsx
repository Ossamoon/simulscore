import { VFC } from "react";
import Link from "next/link";

import { Avatar } from "./avatar";

export const Header: VFC = () => {
  return (
    <header className="w-full text-warmGray-100 bg-green-800">
      <div className="flex items-center px-4 py-2">
        <div className="flex-none">
          {/* ホームへのリンク */}
          <Link href="/">
            <a className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="#FFFFFF"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
              </svg>
              <span className="font-bold text-white pl-1">Home</span>
            </a>
          </Link>
        </div>
        <div className="flex-grow"></div>
        <div className="flex-none">
          <Avatar />
        </div>
      </div>
    </header>
  );
};
