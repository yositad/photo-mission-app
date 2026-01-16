import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

export const useMissionImage = (photoUri?: string, assetId?: string) => {
    const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
        // Initialize state based on input
        if (!photoUri) {
            setImageUri(null);
            return;
        }

        if (photoUri.startsWith('ph://')) {
            // ph:// URI needs resolution via MediaLibrary
            if (assetId) {
                const resolve = async () => {
                    try {
                        const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
                        if (assetInfo?.localUri) {
                            setImageUri(assetInfo.localUri);
                        } else {
                            // If resolution fails, keep null or handle error
                            console.warn('Could not resolve asset URI from ID');
                        }
                    } catch (e) {
                        console.error('Failed to resolve asset URI', e);
                    }
                };
                resolve();
            } else {
                // ph:// but no assetId -> cannot render
                setImageUri(null);
            }
        } else {
            // file:// or other usable URI
            setImageUri(photoUri);
        }
    }, [photoUri, assetId]);

    return imageUri;
};
