import { VFC, useEffect, useContext } from "react";
import Router from "next/router";
import firebase from "library/firebase";
import { AuthContext } from "components/auth";

const SignIn: VFC = () => {
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    currentUser && Router.push("/");
  }, [currentUser]);

  const login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  };
  return (
    <div className="w-60 border">
      <button onClick={login}>Googleでログインする</button>
    </div>
  );
};

export default SignIn;
