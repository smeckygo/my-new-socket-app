// src/hooks/useConnectedPlayers.ts - Végleges Frontend Verzió

import { useState, useEffect, useCallback } from 'react';
// Import the Player and UserStatusUpdatePayload types
import { Player, UserStatusUpdatePayload } from '../../types';
import { useSocket } from '../../context/SocketIOProvider'; // Import the useSocket hook

// Assume UserStatusUpdatePayload is defined in types.ts:
// export interface UserStatusUpdatePayload { userId: string; name: string; status: 'joined' | 'reconnected' | 'waiting_to_reconnect' | 'left'; gameId?: string | null; }


export function useConnectedPlayers() {
    const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);
    // Get the custom listener method from the useSocket hook
    // FIX: on, off, onAction replaced with onServerAction
    const { socket, onServerAction } = useSocket();


    // Helper function to create a Player object from server data
    // We work with the 'user/statusUpdate' payload from the server.
    function parsePlayerFromStatusUpdate(data: UserStatusUpdatePayload): Player {
        return {
            user_id: data.userId, // Server sends userId
            username: data.name, // Server sends name
            score: 0, // Initial score on the frontend side (needs to be updated by a separate event later)
            status: data.status, // <<< The status sent by the server (string)
            isHost: false, // Assume this hook only handles players
        };
    }


    // Callback functions for state updates (memoized to prevent unnecessary effect re-runs)
    const addPlayer = useCallback((player: Player) => {
        setConnectedPlayers(prev => {
            // Only add if not already in the list
            if (prev.find(p => p.user_id === player.user_id)) {
                // If already exists, we can update its status if the 'joined' status means update
                console.log(`[useConnectedPlayers] Player ${player.user_id} already in list, updating status to ${player.status}.`);
                // FIX: Only update the status if the player already exists
                return prev.map(p => (p.user_id === player.user_id ? { ...p, status: player.status } : p));
            }
            console.log(`[useConnectedPlayers] Adding new player: ${player.username} (${player.user_id}).`);
            return [...prev, player];
        });
    }, []); // Empty dependency array, depends only on setConnectedPlayers

    const updatePlayer = useCallback((updatedPlayer: Player) => {
        console.log(`[useConnectedPlayers] Updating player: ${updatedPlayer.username} (${updatedPlayer.user_id}) with status ${updatedPlayer.status}.`);
        setConnectedPlayers(prev =>
            prev.map(p => (p.user_id === updatedPlayer.user_id ? { ...p, ...updatedPlayer } : p))
        );
    }, []); // Empty dependency array

    const removePlayer = useCallback((playerId: string) => {
        console.log(`[useConnectedPlayers] Removing player: ${playerId}.`);
        setConnectedPlayers(prev => prev.filter(p => p.user_id !== playerId));
    }, []); // Empty dependency array


    // useEffect hook to set up Socket.IO event listeners
    useEffect(() => {
        console.log('useConnectedPlayers useEffect running...');

        // Only set up listeners if socket exists
        if (!socket) {
            console.log('useConnectedPlayers useEffect: No socket, skipping listener setup.');
            return;
        }
        console.log(`useConnectedPlayers useEffect: Setting up listeners for socket ID: ${socket.id}`);


        // --- <<< SET UP THE SERVER ACTION LISTENER FOR 'user/statusUpdate' TYPE >>> ---
        // Use the custom onServerAction method.
        // The callback receives the content of the 'payload' field.
        const cleanupStatusUpdateListener = onServerAction('user/statusUpdate', (payload: UserStatusUpdatePayload) => {
            console.log('[useConnectedPlayers] Received user/statusUpdate action payload:', payload);
            // The payload contains user data and status.
            // Update the connectedPlayers list based on the status.

            // Create a Player object from the payload; status comes from the server
            const player = parsePlayerFromStatusUpdate(payload);

            // FIX: Status comparisons now use the status values sent by the server
            if (player.status === 'joined' || player.status === 'reconnected') {
                // If a new player joined or reconnected, add or update them
                addPlayer(player); // The addPlayer callback now also updates if the player already exists
            } else if (player.status === 'waiting_to_reconnect') {
                // If disconnected and waiting for reconnect, update the status
                updatePlayer(player); // Update the player's status in the list
            } else if (player.status === 'left') {
                // If the timeout expired and they left, remove them from the list
                removePlayer(player.user_id); // Remove by user_id
            }
            // Handle other potential statuses...
        });

        // --- END OF SERVER ACTION LISTENER SETUP ---


        // --- OTHER PLAYER-RELATED LISTENERS CAN GO HERE ---
        // E.g., player score updates during the game ('playerScoreUpdate' action)
        // const cleanupScoreUpdateListener = onServerAction('playerScoreUpdate', (payload: { userId: string; score: number }) => {
        //     updatePlayer({ user_id: payload.userId, score: payload.score } as Player); // Update the score
        // });


        // --- Cleanup ---
        return () => {
            console.log('useConnectedPlayers cleanup running...');
            // Remove listeners using their cleanup functions
            console.log(`Removing user/statusUpdate listener for socket ID: ${socket?.id}`);
            cleanupStatusUpdateListener(); // Call the cleanup function

            // Remove other listeners
            // cleanupScoreUpdateListener();

            console.log('useConnectedPlayers cleanup finished ---');
        };

        // Dependencies: The effect should re-run only if the socket changes, or the callback functions (which are stabilized with useCallback).
    }, [socket, addPlayer, updatePlayer, removePlayer, onServerAction]); // onServerAction is also a dependency as the effect uses it


    // The hook returns the list of connected players and the state update callbacks
    return {
        connectedPlayers,
        // addPlayer, // These callbacks likely don't need to be exported, only used by the effect
        // updatePlayer,
        // removePlayer,
    };
}
