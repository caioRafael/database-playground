import 'server-only'

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export const firebaseCert = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PROJECT_KEY?.replace(/\\n/g, '\n'),
})

if(!getApps().length) {
    initializeApp({
        credential: firebaseCert,
    })
}


export const db = getFirestore()
