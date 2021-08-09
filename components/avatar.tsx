import firebase from "library/firebase";
import { VFC, useState } from "react";
import Link from "next/link";

import { UserCard } from "components/usercard";

type Props = {
  currentUser: firebase.User | null | undefined;
};

export const Avatar: VFC<Props> = ({ currentUser }) => {
  const [isOpenUserCard, setIsOpenUserCard] = useState<boolean>(false);
  return (
    <>
      {currentUser?.photoURL ? (
        <>
          <div className="relative z-50">
            <img
              className="h-8 w-8 rounded-full cursor-pointer"
              src={currentUser?.photoURL}
              alt=""
              onClick={() => setIsOpenUserCard((b) => !b)}
            />
            {isOpenUserCard ? (
              <>
                <div
                  className="fixed inset-0 w-full h-full z-40"
                  onClick={() => setIsOpenUserCard(false)}
                ></div>
                <div className="absolute top-10 -right-4 z-50 mt-px">
                  <UserCard currentUser={currentUser} />
                </div>
              </>
            ) : null}
          </div>
        </>
      ) : (
        <Link href="/signIn">
          <a className="w-max rounded-md font-bold text-warmGray-100 hover:text-warmGray-300 text-center border border-warmGray-100 hover:border-warmGray-300 px-4 py-2 cursor-pointer">
            ログイン
          </a>
        </Link>
      )}
    </>
  );
};
