import fs from 'node:fs';
import nextEnv from '@next/env';
import { cert } from 'firebase-admin/app';
nextEnv.loadEnvConfig(process.cwd());
const project = process.env.FIREBASE_PROJECT_ID;
const credential = cert({ projectId: project, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') });
const token = (await credential.getAccessToken()).access_token;
for (const index of JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8')).indexes) {
 const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/${index.collectionGroup}/indexes`;
 const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ queryScope: index.queryScope, fields: index.fields }) });
 const body = await response.json();
 console.log(JSON.stringify({ collection: index.collectionGroup, status: response.status, result: response.ok ? 'Index creation requested' : body.error?.status }));
}
