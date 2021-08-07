import firebase from "library/firebase";
import { VFC } from "react";

type Props = {
  currentUser: firebase.User | null | undefined;
};

export const UserCard: VFC<Props> = ({ currentUser }) => {
  return (
    <div className="relative w-72 bg-white shadow-xl rounded-lg pt-4 pb-2">
      <div className="absolute w-2 h-2 -top-1 right-7 transform rotate-45 bg-white" />
      <div>
        {currentUser?.photoURL ? (
          <img
            className="h-20 w-20 rounded-full mx-auto"
            src={currentUser?.photoURL}
            alt=""
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-blue-400 mx-auto"></div>
        )}
        <div className="font-bold text-warmGray-900 text-center truncate mt-2">
          {currentUser?.displayName}
        </div>
        <div className="text-warmGray-600 text-center text-sm truncate">
          {currentUser?.email}
        </div>
      </div>

      <div className="w-full h-px bg-warmGray-200 mt-4 mx-auto"></div>

      <div
        className="hover:bg-warmGray-100 cursor-pointer text-warmGray-600 text-sm px-4 py-2"
        onClick={() => {
          firebase.auth().signOut();
        }}
      >
        ログアウト
      </div>
    </div>
  );
};
