import * as admin from 'firebase-admin';
import { Game, GameUser, User, CurrentProcess, Question, Answer } from '../apps/user_web/src/app/_types'; // Adjust path as necessary

// --- Configuration ---
// IMPORTANT: Replace with the actual path to your Firebase service account key JSON file
const SERVICE_ACCOUNT_KEY_PATH = "./fussa-wedding-app-prod-firebase-adminsdk-fbsvc-6eddbccb79.json"; // Assuming key is in the same directory or adjust path
// Firestore collection name for games
const GAMES_COLLECTION_NAME = "Games";
// Firestore subcollection names
const USERS_SUBCOLLECTION_NAME = "Users";
const ANSWERS_SUBCOLLECTION_NAME = "Answers";
// Cloud Storage base path for team thumbnails
const CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH = "gs://fussa-wedding-app-prod/thumbnail/"; // REPLACE <YOUR_BUCKET_NAME> if different
// --- End Configuration ---

// Mock data for teams including items and scores
const mockTeamDetails = [
    { id: "teamA", name: "ドラゴンチーム", score: 1250, thumbnailName: "ThumbnailTeamA.jpg", itemIds: ["item_speed", "item_shield"] },
    { id: "teamB", name: "フェニックス団", score: 1100, thumbnailName: "ThumbnailTeamB.jpg", itemIds: [] },
    { id: "teamC", name: "ユニコーン騎士団", score: 950, thumbnailName: "ThumbnailTeamC.jpg", itemIds: ["item_double_points"] },
    { id: "teamD", name: "グリフィン組", score: 800, thumbnailName: "ThumbnailTeamD.jpg", itemIds: [] },
    { id: "teamE", name: "ペガサス隊", score: 750, thumbnailName: "ThumbnailTeamE.jpg", itemIds: ["item_skip_question"] },
    // Add more teams if needed for more answers
];

interface MockTeamDetail {
    id: string;
    name: string;
    score: number;
    thumbnailName: string;
    itemIds: string[];
}

/**
 * Converts a Google Cloud Storage (GS) URI to a publicly accessible HTTPS URL.
 */
function getFirebaseStorageHttpsUrl(gsUri: string): string {
    if (!gsUri || !gsUri.startsWith('gs://')) {
        console.error('Invalid GS URI provided to getFirebaseStorageHttpsUrl:', gsUri);
        return '';
    }
    const bucketAndPath = gsUri.substring(5); // Remove 'gs://'
    const parts = bucketAndPath.split('/');
    const bucketName = parts.shift();
    const objectPath = parts.join('/');

    if (!bucketName || !objectPath) {
        console.error('Could not parse bucket name or object path from GS URI:', gsUri);
        return '';
    }
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
        console.log("4. If running with ts-node, ensure it can resolve the JSON path correctly (try an absolute path for the key file or ensure it's relative to script location).");
        return false;
    }
}

function generateGameDocumentId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

async function uploadCurrentGameDataToFirestore(db: admin.firestore.Firestore, teamsData: MockTeamDetail[]): Promise<void> {
    const gameDocId = generateGameDocumentId();
    const gameDocRef = db.collection(GAMES_COLLECTION_NAME).doc(gameDocId);
    const usersSubCollectionRef = gameDocRef.collection(USERS_SUBCOLLECTION_NAME);
    const answersSubCollectionRef = gameDocRef.collection(ANSWERS_SUBCOLLECTION_NAME);

    const batch = db.batch();

    const gameUsers: GameUser[] = teamsData.map(team => {
        const gsThumbnailUri = `${CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH}${team.thumbnailName}`;
        const httpsThumbnailUrl = getFirebaseStorageHttpsUrl(gsThumbnailUri);
        return {
            id: team.id,
            name: team.name,
            thumbnail: httpsThumbnailUrl,
            itemIds: team.itemIds,
            score: team.score,
        };
    });

    // Prepare Users for subcollection
    teamsData.forEach(team => {
        const userDocRef = usersSubCollectionRef.doc(team.id);
        const gsThumbnailUri = `${CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH}${team.thumbnailName}`;
        const httpsThumbnailUrl = getFirebaseStorageHttpsUrl(gsThumbnailUri);
        const userData: User = {
            userId: team.id,
            name: team.name,
            thumbnail: httpsThumbnailUrl,
        };
        batch.set(userDocRef, userData);
    });
    console.log(`Prepared ${teamsData.length} users for subcollection '${USERS_SUBCOLLECTION_NAME}'.`);

    // Prepare mock Answers for subcollection
    const mockAnswers: Answer[] = [
        {
            answerId: `ans_${gameDocId}_q0_${teamsData[0].id}`,
            questionIndex: 0, // Assuming first question (index 0)
            userId: teamsData[0].id, // teamA
            optionIndex: 1, // Picked 2nd option
        },
        {
            answerId: `ans_${gameDocId}_q0_${teamsData[1].id}`,
            questionIndex: 0, // Assuming first question (index 0)
            userId: teamsData[1].id, // teamB
            optionIndex: 0, // Picked 1st option
            usedItemId: "item_double_points" // Example item usage
        },
        {
            answerId: `ans_${gameDocId}_q1_${teamsData[0].id}`, // teamA answers second question
            questionIndex: 1, // Assuming second question (index 1)
            userId: teamsData[0].id,
            optionIndex: 0,
        }
    ];

    // Filter mockAnswers to ensure userId exists in teamsData, just in case
    const validMockAnswers = mockAnswers.filter(ans => teamsData.some(team => team.id === ans.userId));

    validMockAnswers.forEach(answer => {
        const answerDocRef = answersSubCollectionRef.doc(answer.answerId);
        batch.set(answerDocRef, answer);
    });
    console.log(`Prepared ${validMockAnswers.length} answers for subcollection '${ANSWERS_SUBCOLLECTION_NAME}'.`);


    const currentProcess: CurrentProcess = {
        index: 1, // Example: current process is for question at index 1
        type: "question",
    };
    
    const questions: Question[] = [ // Add some mock questions for context
        { question: "新郎の好きな食べ物は？", options: ["寿司", "ラーメン", "焼肉", "カレー"], correctIndex: 2, imagePath: getFirebaseStorageHttpsUrl(`${CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH}QuestionImage1.jpg`), point: 100 },
        { question: "新婦の出身地は？", options: ["東京", "大阪", "北海道", "福岡"], correctIndex: 0, imagePath: getFirebaseStorageHttpsUrl(`${CLOUD_STORAGE_THUMBNAILS_GS_BASE_PATH}QuestionImage2.jpg`), point: 150 },
    ];

    // Game document data (Users field is removed as it's now a subcollection)
    const gameData: Omit<Game, 'Users'> & { createdAt?: admin.firestore.FieldValue } = { // Omit Users from Game type as it's a subcollection
        gameId: gameDocId,
        name: `Live Mock Game - ${gameDocId}`,
        questions: questions, 
        status: "inProgress",
        answerTime: 30, 
        users: gameUsers, // This is GameUser array for ranking, not the User metadata
        // Users: metadataUsers, // REMOVED - now a subcollection
        currentProcess: currentProcess,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Optional: add a timestamp
    };
    batch.set(gameDocRef, gameData);


    try {
        await batch.commit();
        console.log(`Successfully created game document '${gameDocId}' in '${GAMES_COLLECTION_NAME}'.`);
        console.log(`  - Uploaded ${teamsData.length} users to '${USERS_SUBCOLLECTION_NAME}' subcollection.`);
        console.log(`  - Uploaded ${validMockAnswers.length} answers to '${ANSWERS_SUBCOLLECTION_NAME}' subcollection.`);
        console.log("  Current ranking within game document:");
        gameUsers.forEach(user => {
            console.log(`    User: ${user.name}, Score: ${user.score}, Items: ${user.itemIds.join(', ') || 'None'}`);
        });
    } catch (error) {
        console.error("Error committing batch to Firestore:", error);
    }
}

async function main() {
    if (!initializeFirebaseAdmin()) {
        return;
    }

    const db = admin.firestore();
    await uploadCurrentGameDataToFirestore(db, mockTeamDetails);
}

main().catch(error => {
    console.error("An unexpected error occurred in main:", error);
}); 