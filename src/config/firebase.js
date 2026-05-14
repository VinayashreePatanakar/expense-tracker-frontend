import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDz1w-jSQhf2E1CYu69a_kle4v0eWsUhIA",
  authDomain: "expense-tracker-41352.firebaseapp.com",
  projectId: "expense-tracker-41352",
  appId: "1:994861253314:web:87d7a27bb9b2dc51a6315b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();