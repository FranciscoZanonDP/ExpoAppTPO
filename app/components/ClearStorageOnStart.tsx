import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function ClearStorageOnStart() {
    useEffect(() => {
        AsyncStorage.clear();
    }, []);
    return null;
} 