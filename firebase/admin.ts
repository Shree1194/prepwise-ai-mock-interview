import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
      try {
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = JSON.parse(privateKey);
        }
      } catch (e) {}
      privateKey = privateKey?.replace(/\\n/g, "\n");
    }

    try {
      if (privateKey && !privateKey.includes("leave blank")) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
      }
    } catch (error) {
      console.error("Firebase admin initialization error", error);
    }
  }

  let authObj, dbObj;
  try {
    authObj = getAuth();
    dbObj = getFirestore();
  } catch (error) {
    console.warn("Firebase Admin SDK failed. Using advanced fallback mock MemoryDB.");
    authObj = {
      verifySessionCookie: async () => { throw new Error("Mocked Auth") },
      getUserByEmail: async () => null,
      createSessionCookie: async () => "",
    } as any;

    const globalAny = global as any;
    if (!globalAny.__mockFirestoreData) {
      globalAny.__mockFirestoreData = { users: {}, interviews: {}, feedback: {} };
    }

    const createCollectionQuery = (colName: string, filters: any[] = [], limitCount?: number) => ({
      where: (field: string, op: string, val: any) => 
        createCollectionQuery(colName, [...filters, { field, op, val }], limitCount),
      orderBy: () => createCollectionQuery(colName, filters, limitCount),
      limit: (l: number) => createCollectionQuery(colName, filters, l),
      get: async () => {
        const col = globalAny.__mockFirestoreData[colName] || {};
        let results = Object.entries(col).map(([id, data]: [string, any]) => ({ id, data }));
        
        for (const f of filters) {
          results = results.filter(r => {
            const v = r.data[f.field];
            if (f.op === '==') return v === f.val;
            if (f.op === '!=') return v !== f.val;
            return true;
          });
        }
        
        results.sort((a,b) => new Date(b.data.createdAt || 0).getTime() - new Date(a.data.createdAt || 0).getTime());
        if (limitCount && limitCount > 0) results = results.slice(0, limitCount);
        
        return {
          empty: results.length === 0,
          docs: results.map(r => ({ id: r.id, data: () => r.data, exists: true }))
        };
      },
      doc: (id = Math.random().toString(36).slice(2)) => ({
        get: async () => ({
          exists: !!globalAny.__mockFirestoreData[colName]?.[id],
          id,
          data: () => globalAny.__mockFirestoreData[colName]?.[id] || null
        }),
        set: async (data: any) => {
          if (!globalAny.__mockFirestoreData[colName]) globalAny.__mockFirestoreData[colName] = {};
          globalAny.__mockFirestoreData[colName][id] = data;
        }
      }),
      add: async (data: any) => {
        const id = Math.random().toString(36).slice(2);
        if (!globalAny.__mockFirestoreData[colName]) globalAny.__mockFirestoreData[colName] = {};
        globalAny.__mockFirestoreData[colName][id] = data;
        return { id };
      }
    });

    const mockDb = {
      collection: (colName: string) => createCollectionQuery(colName)
    };
    dbObj = mockDb as any;
  }

  return { auth: authObj, db: dbObj };
}

export const { auth, db } = initFirebaseAdmin();
