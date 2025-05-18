import * as admin from 'firebase-admin';

// --- Configuration ---
// IMPORTANT: Replace with the actual path to your Firebase service account key JSON file
const SERVICE_ACCOUNT_KEY_PATH = "./fussa-wedding-app-prod-firebase-adminsdk-fbsvc-6eddbccb79.json";
// Firestore collection name for games
const GAMES_COLLECTION_NAME = "Games";
// Firestore subcollection name for users within a game
const USERS_SUBCOLLECTION_NAME = "Users";
// Cloud Storage base path for team thumbnails (REPLACE <YOUR_BUCKET_NAME> with your actual bucket name)
// This will be used to construct the GS URI initially, then converted.
const CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH = "gs://fussa-wedding-app-prod/thumbnail/";
// --- End Configuration ---

// Mock data (same as in the Python script)
const mockTeamsData = [
    { name: "チームA", score: 1000, thumbnailName: "ThumbnailTeamA.jpg" },
    { name: "チームB", score: 850, thumbnailName: "ThumbnailTeamB.jpg" },
    { name: "チームC", score: 700, thumbnailName: "ThumbnailTeamC.jpg" },
    { name: "チームD", score: 650, thumbnailName: "ThumbnailTeamD.jpg" },
    { name: "チームE", score: 600, thumbnailName: "ThumbnailTeamE.jpg" },
    { name: "チームF", score: 550, thumbnailName: "ThumbnailTeamF.jpg" },
    { name: "チームG", score: 500, thumbnailName: "ThumbnailTeamG.jpg" },
    { name: "チームH", score: 450, thumbnailName: "ThumbnailTeamH.jpg" },
    { name: "チームI", score: 400, thumbnailName: "ThumbnailTeamI.jpg" },
    { name: "チームJ", score: 350, thumbnailName: "ThumbnailTeamJ.jpg" },
    { name: "チームK", score: 300, thumbnailName: "ThumbnailTeamK.jpg" },
    { name: "チームL", score: 250, thumbnailName: "ThumbnailTeamL.jpg" },
    { name: "チームM", score: 200, thumbnailName: "ThumbnailTeamM.jpg" },
    { name: "チームN", score: 150, thumbnailName: "ThumbnailTeamN.jpg" },
    { name: "チームO", score: 100, thumbnailName: "ThumbnailTeamO.jpg" },
];

interface TeamData {
    name: string;
    score: number;
    thumbnailName: string;
}

/**
 * Converts a Google Cloud Storage (GS) URI to a publicly accessible HTTPS URL.
 * @param gsUri The GS URI (e.g., "gs://<bucket-name>/<object-path>").
 * @returns The public HTTPS URL.
 */
function getFirebaseStorageHttpsUrl(gsUri: string): string {
    if (!gsUri || !gsUri.startsWith('gs://')) {
        console.error('Invalid GS URI provided to getFirebaseStorageHttpsUrl:', gsUri);
        return ''; // Or throw an error, depending on desired error handling
    }
    const bucketAndPath = gsUri.substring(5); // Remove 'gs://'
    const parts = bucketAndPath.split('/');
    const bucketName = parts.shift();
    const objectPath = parts.join('/');

    if (!bucketName || !objectPath) {
        console.error('Could not parse bucket name or object path from GS URI:', gsUri);
        return '';
    }
    // Ensure the object path is properly encoded for the URL
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media`;
}

function initializeFirebaseAdmin(): boolean {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(SERVICE_ACCOUNT_KEY_PATH);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin SDK initialized successfully.");
        return true;
    } catch (error) {
        console.error("Error initializing Firebase Admin SDK:", error);
        console.log("Please ensure that:");
        console.log(`1. The service account key file exists at: ${SERVICE_ACCOUNT_KEY_PATH}`);
        console.log("2. The file is a valid JSON key file from your Firebase project.");
        console.log("3. You have the 'firebase-admin' package installed (`npm install firebase-admin` or `yarn add firebase-admin`).");
        console.log("4. If running with ts-node, ensure it can resolve the JSON path correctly (try an absolute path for the key file).");
        return false;
    }
}

function generateGameDocumentId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0'); // hhss as requested
    return `${year}${month}${day}-${hours}${seconds}`;
}

async function uploadGameDataToFirestore(db: admin.firestore.Firestore, teamsData: TeamData[]): Promise<void> {
    const gameDocId = generateGameDocumentId();
    const gameDocRef = db.collection(GAMES_COLLECTION_NAME).doc(gameDocId);
    const usersCollectionRef = gameDocRef.collection(USERS_SUBCOLLECTION_NAME);

    const batch = db.batch();
    let userCount = 0;

    // Set some data for the game document itself
    batch.set(gameDocRef, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        gameName: `Game started at ${gameDocId}` // Example field
    });
    console.log(`Creating game document with ID: ${gameDocId} in collection '${GAMES_COLLECTION_NAME}'.`);

    console.log(`Starting upload to subcollection: '${USERS_SUBCOLLECTION_NAME}' under game '${gameDocId}'...`);
    for (const team of teamsData) {
        const userDocRef = usersCollectionRef.doc(team.name);
        
        // Construct the full GS URI first
        const gsThumbnailUri = `${CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH}${team.thumbnailName}`;
        // Convert GS URI to public HTTPS URL
        const httpsThumbnailUrl = getFirebaseStorageHttpsUrl(gsThumbnailUri);

        const dataToUpload = {
            name: team.name,
            score: team.score,
            thumbnail: httpsThumbnailUrl // Store the HTTPS URL
        };
        batch.set(userDocRef, dataToUpload);
        userCount++;
        console.log(`  Added ${team.name} to batch for game ${gameDocId}. Thumbnail URL: ${httpsThumbnailUrl}`);
    }

    try {
        await batch.commit();
        console.log(`Successfully created game document '${gameDocId}' and uploaded ${userCount} users to its '${USERS_SUBCOLLECTION_NAME}' subcollection.`);
    } catch (error) {
        console.error("Error committing batch to Firestore:", error);
    }
}

async function main() {
    if (!initializeFirebaseAdmin()) {
        return;
    }

    const db = admin.firestore();
    await uploadGameDataToFirestore(db, mockTeamsData);
}

main().catch(error => {
    console.error("An unexpected error occurred in main:", error);
}); 