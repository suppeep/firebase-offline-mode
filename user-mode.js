import firebase from "firebase/app";
import { database, auth, firestore } from "./async-firestore"; // for help take a look at https://github.com/suppeep/generic-firebase/blob/main/async-firestore.js

async() => {
    (await auth()).onAuthStateChanged(async(user) => {
        let uid = user.uid;
        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        let userStatusDatabaseRef = (await database()).ref("/status/" + uid);
        let isOfflineForDatabase = {
            state: "offline",
            last_changed: firebase.database.ServerValue.TIMESTAMP
        };
        let isOnlineForDatabase = {
            state: "online",
            last_changed: firebase.database.ServerValue.TIMESTAMP
        };

        (await database()).ref(".info/connected").on("value", (snapshot) => {
            // If we're not currently connected, don't do anything.
            if (snapshot.val() === false) {
                return;
            }
            userStatusDatabaseRef
                .onDisconnect()
                .set(isOfflineForDatabase)
                .then(() => {
                    userStatusDatabaseRef.set(isOnlineForDatabase);
                });
        });

        let userStatusFirestoreRef = (await firestore())
            .collection("users")
            .doc(uid);
        // let statusFirestoreRef = firebase.firestore().doc('/status/' + uid)
        let isOfflineForFirestore = {
            state: "offline",
            last_changed: firebase.firestore.FieldValue.serverTimestamp()
        };
        let isOnlineForFirestore = {
            state: "online",
            last_changed: firebase.firestore.FieldValue.serverTimestamp()
        };

        (await database()).ref(".info/connected").on("value", (snapshot) => {
            if (snapshot.val() === false) {
                // set Firestore's state to 'offline'. This ensures that our Firestore cache is aware of the switch to 'offline.'
                userStatusFirestoreRef.update({
                    status: isOfflineForFirestore
                });
                return;
            }

            userStatusDatabaseRef
                .onDisconnect()
                .set(isOfflineForDatabase)
                .then(() => {
                    userStatusDatabaseRef.set(isOnlineForDatabase);
                    // We'll also add Firestore set here for when we come online.
                    userStatusFirestoreRef.update({
                        status: isOnlineForFirestore
                    });
                });
        });
    });
};
