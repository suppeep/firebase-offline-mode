## Firebase offline / online mode


#### Create ur own offline / online mode with firestore and real-time DB
#### Because firebase doesn't really give u an 'easy' solution we have to use both firestore and the real-time DB to keep the user state always up-to-date.

#### What we do to ensure this, is that we check on each onAuthStateChanged() event if the user is still online. If this is the case then the we write to the real-time DB the online state and update firestore too.

#### For this example I used my own implementation of generic-firebase https://github.com/suppeep/generic-firebase
