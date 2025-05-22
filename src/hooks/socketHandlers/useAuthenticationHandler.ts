// src/hooks/socketHandlers/useAuthenticationHandler.ts
// ... (existing imports) ...

import React, { useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketIOProvider';
import { usePlayer } from '../../context/PlayerProvider';
import { IdentifyPlayerPayload, IdentifyHostPayload, Player } from '../../types';

type IdentifyPayload = IdentifyPlayerPayload | IdentifyHostPayload;

export const useAuthenticationHandler = (authData: IdentifyPayload | null) => {
    const { socket, isConnected, isAuthenticated, emitAction, onActionResponse } = useSocket();
    const { player, setPlayer } = usePlayer();

    const lastAuthSocketIdRef = useRef<string | null>(null);

    useEffect(() => {
        console.log('useAuthenticationHandler useEffect running...');
        console.log('socket:', !!socket, 'isConnected:', isConnected, 'authData:', !!authData, 'isAuthenticated:', isAuthenticated);
        console.log('lastAuthSocketIdRef.current:', lastAuthSocketIdRef.current);
        console.log('Current socket ID:', socket?.id);

        if (socket && socket.id !== lastAuthSocketIdRef.current) {
            console.log(`useAuthenticationHandler: Socket ID changed from ${lastAuthSocketIdRef.current} to ${socket.id}. Resetting emit status.`);
        }

        let cleanupPlayerAuthResponseListener: () => void;
        let cleanupHostAuthResponseListener: () => void;

        if (socket) {
            cleanupPlayerAuthResponseListener = onActionResponse('Response/player/identify', (data: any) => {
                console.log('[useAuthenticationHandler] Received Player Identify response data:', data);
                if (data && data.userId && data.name) {
                    const updatedPlayer: Player = {
                        user_id: data.userId,
                        username: data.name,
                        score: player?.score || 0,
                        status: player?.status || 'online',
                        isHost: data.isHost ?? false,
                    };
                    setPlayer(updatedPlayer);
                    console.log('[useAuthenticationHandler] PlayerProvider updated with Player Identify response.');
                }
            });

            cleanupHostAuthResponseListener = onActionResponse('Response/host/identify', (data: any) => {
                console.log('[useAuthenticationHandler] Received Host Identify response data:', data);
                if (data && data.userId && data.name) {
                    const updatedPlayer: Player = {
                        user_id: data.userId,
                        username: data.name,
                        score: player?.score || 0,
                        status: player?.status || 'online',
                        isHost: data.isHost ?? true,
                    };
                    setPlayer(updatedPlayer);
                    console.log('[useAuthenticationHandler] PlayerProvider updated with Host Identify response.');
                }
            });
        } else {
            cleanupPlayerAuthResponseListener = () => {};
            cleanupHostAuthResponseListener = () => {};
        }

        if (
            isConnected &&
            authData &&
            !isAuthenticated &&
            socket?.id &&
            socket.id !== lastAuthSocketIdRef.current
        ) {
            console.log('useAuthenticationHandler: Socket connected and auth data available, attempting authentication...');
            console.log(`useAuthenticationHandler: Emitting action for socket ID: ${socket.id}`);
            emitAction('player/identify', authData);
            lastAuthSocketIdRef.current = socket.id;
            console.log(`useAuthenticationHandler: Marked authentication emit as done for socket ID: ${socket.id}.`);
        }

        return () => {
            console.log('useAuthenticationHandler cleanup running...');
            console.log(`Cleanup Socket ID: ${socket?.id}`);
            console.log(`Cleanup lastAuthSocketIdRef.current: ${lastAuthSocketIdRef.current}`);

            console.log(`Removing actionResponse listeners for socket ID: ${socket?.id}`);
            cleanupPlayerAuthResponseListener();
            cleanupHostAuthResponseListener();

            console.log('useAuthenticationHandler cleanup finished ---');
        };

    }, [socket, isConnected, isAuthenticated, authData, emitAction, onActionResponse, player, setPlayer]);
};