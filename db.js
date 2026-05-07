// Remi AI Store V1 - Firebase + API Config
// Edit file ini kalau mau ganti Firebase/API tanpa bongkar index.html.
window.REMI_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgivYR6mljjYyeFH286UA8auWkVJDZUy0",
  authDomain: "ellpigi-web-store.firebaseapp.com",
  databaseURL: "https://ellpigi-web-store-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "ellpigi-web-store",
  storageBucket: "ellpigi-web-store.firebasestorage.app",
  messagingSenderId: "531471360663",
  appId: "1:531471360663:web:28f8f71943e9cc42953fd2",
  measurementId: "G-EPXFJ2FVZW"
};
window.REMI_FIREBASE_ROOT = "remiStoreV1";
window.REMI_IPIFY_TOKEN = "at_SZOROv2kK5dNchcdaozjbGs8mVpwK";
try {
  localStorage.setItem('firebaseDbV89', JSON.stringify({
    databaseURL: window.REMI_FIREBASE_CONFIG.databaseURL,
    apiKey: window.REMI_FIREBASE_CONFIG.apiKey,
    projectId: window.REMI_FIREBASE_CONFIG.projectId,
    rootPath: window.REMI_FIREBASE_ROOT,
    updatedAt: Date.now()
  }));
} catch (e) {
  console.warn('Firebase config localStorage gagal:', e);
}
