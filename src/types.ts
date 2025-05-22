// src/types.ts - Frontend Végleges Korrigált Verzió (AppProvider típusokkal)

// Alapvető típusok

// Player interfész - Győződj meg róla, hogy tartalmazza a 'score' és 'isHost' mezőt,
// és a 'status' mező típusa tartalmazza az összes lehetséges szerverről érkező értéket is.
export interface Player {
    user_id: string;
    username: string;
    score: number;
    status: 'online' | 'lobby' | 'inGame' | 'ready' | 'joined' | 'reconnected' | 'waiting_to_reconnect' | 'left';
    isHost: boolean;
    // később még jöhetnek ide dolgok (ha kellenek, és nem bontom mégjobban szét)
}

// IdentifyPlayerPayload interfész - ahogy a szerver várja a 'player/identify' akció payloadjában
export interface IdentifyPlayerPayload {
    user_id?: string;
    username?: string;
    token?: string;
    hostKey?: string;
}

// IdentifyHostPayload interfész - ahogy a szerver várja a 'host/identify' akció payloadjában
export interface IdentifyHostPayload {
    hostKey?: string;
    token?: string;
}


// UserStatusUpdatePayload interfész - ahogy a szerver küldi a 'user/statusUpdate' akció payloadjában
export interface UserStatusUpdatePayload {
    userId: string;
    name: string;
    status: 'joined' | 'reconnected' | 'waiting_to_reconnect' | 'left';
    gameId?: string | null;
}

// PlayerSuggestion interfész - ahogy a szerver a 'player/search' válasz 'suggestions' mezőjében küldi
export interface PlayerSuggestion {
    user_id: string;
    username: string;
    // ... egyéb mezők, ha a keresés adja vissza (pl. avatar, status)
}


export interface GameInvitation {
    id: string;
    gameCode: string;
    hostName: string;
    timestamp: string; // Vagy Date
}

// LobbyPlayer interfész - ahogy a frontend UI-ja/state-je tárolja a lobbyban lévő playereket
export interface LobbyPlayer {
    id: string; // Valószínűleg a user_id
    name: string; // A username
    isReady: boolean;
    isCurrentUser?: boolean;
    status: 'online' | 'lobby' | 'inGame' | 'ready' | 'joined' | 'reconnected' | 'waiting_to_reconnect' | 'left';
}

export interface AnswerOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    category?: string;
    text: string;
    options: AnswerOption[];
    correctOptionId: string;
    timeLimit?: number;
}

// <<< KORRIGÁLVA: PlayerAppState a Page helyett >>>
// Ez az alkalmazás aktuális oldala (navigáció)
export type PlayerAppState =
     'quizSetup'
    | 'players'
    | 'enterName'
    | 'dashboard'
    | 'joinGame'
    | 'lobby'
    | 'game'
    | 'friends'
    | 'question'
    | 'notificationsPage'
    | 'results'
    | 'settings'
    | 'ranking'
    | 'contact'
    | 'stats'
    | 'topicSelection'; // Hozzáadva a topicSelection

export interface PlayerStats {
    totalGamesPlayed: number;
    gamesWon: number;
    winRate: string;
    totalScore: number;
    bestScoreInGame: number;
    // ... egyéb statisztikai mezők
}
export interface StatItem {
    id: keyof PlayerStats | 'custom' | string;
    label: string;
    value: string | number;
    icon?: any;
    colorClass?: string;
}

export interface Friend {
    id: string;
    name: string;
    isOnline: boolean;
    avatarUrl?: string;
    // Esetleg további infók, pl. utolsó aktivitás, közös játékok száma stb.
}

export type NotificationType =
    | 'friendRequest'
    | 'gameInvite'
    | 'matchResult'
    | 'announcement'
    | 'achievement'
    | 'notificationsPage'
    | 'general';

export interface BaseNotification {
    id: string;
    type: NotificationType;
    timestamp: string;
    isRead: boolean;
    message?: string;
    title?: string;
    icon?: any;
    link?: string;
}

export interface FriendRequestNotification extends BaseNotification {
    type: 'friendRequest';
    senderId: string;
    senderName: string;
}

export interface GameInviteNotificationForList extends BaseNotification {
    type: 'gameInvite';
    hostId: string;
    hostName: string;
    gameCode?: string;
}

export interface MatchResultNotification extends BaseNotification {
    type: 'matchResult';
    gameId: string;
    resultText: string;
    scoreChange?: number;
}

export interface AchievementNotification extends BaseNotification {
    type: 'achievement';
    achievementName: string;
}

// BackendActionResponse interfész - ahogy a szerver küldi az 'actionResponse' esemény payloadjában
export interface BackendActionResponse {
    type: string; // A válasz típusa (pl. 'Response/player/identify', 'Response/player/search', 'Response/quiz/start')
    status: 'success' | 'error' | 'info';
    data?: any; // A válasz tényleges adat payload-ja (sikeres válasz esetén) vagy hibaüzenet (hiba esetén)
    // Ide jöhetnek további opcionális mezők, amiket a backend küld (pl. requestId, timestamp).
    // [key: string]: any; // Ha bármilyen extra mezőt elfogadunk
}

// IdentifyResponseData interfész - ahogy a szerver 'Response/player/identify' válasz 'data' mezőjében küldi
export interface IdentifyResponseData {
    userId: string;
    name: string;
    isNewUser: boolean;
    isHost?: boolean;
    message?: string;
    // ... other data (e.g., token)
}

// <<< ÚJ: GameCreatedResponseData interfész a 'Response/game/created' akció 'data' mezőjének 'newGame' objektumához >>>
export interface GameCreatedResponseData {
    game_id: string;
    host_id: string;
    status: 'waiting' | 'active' | 'ended'; // Játék státusz
    room_code: string; // A játékhoz való csatlakozási kód
    difficulty: number;
    length: number;
    current_question_index: number;
    created_at: string; // Vagy Date, ha frontend oldalon Date objektummá konvertálod
    started_at: string | null;
    ended_at: string | null;
    // ... egyéb mezők, ha a backend küld ilyet a newGame objektumban
}


/**
 * Interfész a játék állapotának teljes pillanatképéhez (Snapshot).
 * Ezt a backend küldi a frontendre csatlakozáskor/újracsatlakozáskor.
 * Megfelel a MatchProvider által tárolt MatchState struktúrának.
 * <<< KORRIGÁLVA: Hozzáadva a room_code, difficulty, length, created_at, started_at, ended_at mezők >>>
 */
export interface GameStateSnapshot {
    gameId: string; // A játék egyedi azonosítója
    status: 'waiting' | 'active' | 'ended'; // A játék aktuális státusza (backend ENUM)
    hostId: string; // A host felhasználó ID-ja

    room_code: string; // <<< HOZZÁADVA
    difficulty: number; // <<< HOZZÁADVA
    length: number; // <<< HOZZÁADVA
    created_at: string; // <<< HOZZÁADVA (stringként érkezik a szervertől)
    started_at: string | null; // <<< HOZZÁADVA
    ended_at: string | null; // <<< HOZZÁADVA

    players: Player[]; // A játékosok listája (a Player interfésznek illeszkednie kell a backend adatokhoz)

    currentQuestion: Question | null; // Az aktuális kérdés adatai, vagy null ha nincs aktív kérdés
    currentQuestionIndex: number; // Az aktuális kérdés indexe a játékban (0-tól kezdve)

    // ... adj hozzá minden más releváns játék adatot, amit a backend küld a snapshotban ...
    // pl: gameSettings: GameSettings | null;
    // pl: timerState: TimerState | null;
}


// A handler függvény fogadja a backend válasz payload-ot (R típusú)
// és nem tér vissza értékkel (void vagy Promise<void> async handler esetén).
export type FrontendActionHandler<R = any> = (response: R) => void | Promise<void>;


// Ez lesz a típus, amit a NotificationsPage használni fog
export type NotificationItem = BaseNotification | FriendRequestNotification | GameInviteNotificationForList | MatchResultNotification | AchievementNotification;

// <<< KORRIGÁLVA: Page típus a PlayerAppState helyett >>>
// Ez a Page típus a Layout renderPage függvényének paramétere,
// és az összes lehetséges oldalt tartalmazza.
export type Page = PlayerAppState; // Egyszerűen PlayerAppState-re hivatkozunk

// --- AppProviderhez szükséges típusok ---

// Az AppProvider által tárolt globális alkalmazás állapot típusa
export interface AppState {
    currentPage: PlayerAppState; // Az alkalmazás aktuális oldala
    // ... adj hozzá más globális, nem meccs-specifikus állapotokat ide ...
    // pl: globalSettings: GlobalSettings;
    // pl: notificationsList: NotificationItem[]; // Ha itt tárolod az értesítéseket
}

// Az useApp hook által visszaadott érték típusa
export interface AppContextType {
    appState: AppState; // Az alkalmazás aktuális globális állapota
    handlePageChange: (page: PlayerAppState) => void; // Függvény az oldal váltásához
    // ... egyéb metódusok a globális állapot módosításához ...
}

export interface QuizSetupData {
    difficulty: number;
    length: number;
    // ... egyéb beállítások
}