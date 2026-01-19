/**
 * Firebase Configuration
 * Alliance AI Co-Scientist Dashboard
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAdnrFyiCVi3dbF_P79VMAfdnPaKo6Idis",
  authDomain: "thlim-alliance.firebaseapp.com",
  projectId: "thlim-alliance",
  storageBucket: "thlim-alliance.firebasestorage.app",
  messagingSenderId: "40649884447",
  appId: "1:40649884447:web:c6d16ee53971ecfc34e62a"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스
export const db = getFirestore(app);

// Firebase Auth
export const auth = getAuth(app);

// Firebase Functions (asia-northeast3 리전)
export const functions = getFunctions(app, 'asia-northeast3');

// 로컬 개발 시 에뮬레이터 연결 (필요시 주석 해제)
// if (location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;
