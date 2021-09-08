import { VFC } from "react";
import Link from "next/link";

export const Footer: VFC = () => {
  return (
    <footer className="text-center bg-green-800 text-warmGray-100 p-4">
      <div className="text-xs mt-4 space-x-4">
        <Link href="/terms">
          <a>利用規約</a>
        </Link>
        <Link href="/privacy">
          <a>プライバシーポリシー</a>
        </Link>
      </div>
      <div className="font-extrabold text-2xl mt-4">
        <Link href="/">
          <a>SimulScore</a>
        </Link>
      </div>
      <small>
        <div className="font-light text-warmGray-300 text-xs mt-8 mb-4">
          &copy; SimulScore 2021
        </div>
      </small>
    </footer>
  );
};
