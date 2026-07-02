import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvqNSYBlrd41z9fMA1lIUYYblSy10CiJI",
  authDomain: "gen-lang-client-0600415987.firebaseapp.com",
  projectId: "gen-lang-client-0600415987",
  storageBucket: "gen-lang-client-0600415987.firebasestorage.app",
  messagingSenderId: "676593930986",
  appId: "1:676593930986:web:08f5b420ea6d74c8dffd93"
};

// Initialize App
const app = initializeApp(firebaseConfig);

// Initialize Firestore targeting the custom databaseId as the second parameter of getFirestore
export const db = getFirestore(app, "ai-studio-collegeattendanc-512a6e30-b2dd-43bd-a77e-af529bc7c2e7");
export const auth = getAuth(app);

// Test Connection
async function testConnection() {
  try {
    // Attempt to get a dummy doc from server
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("client is offline")) {
      console.warn("Please check your Firebase configuration or network status.");
    } else {
      console.log("Firestore connection check completed (test document doesn't need to exist).");
    }
  }
}

testConnection();

