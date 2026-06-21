import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import {
  DEFAULT_AUTH_FORM_SCHEMA,
  parseAuthFormSchema,
  type AuthFormSchema,
} from '@/features/auth/auth-form-schema';

const CACHE_KEY = 'freshcatch.auth-form-schema';
const SCHEMA_URL = process.env.EXPO_PUBLIC_AUTH_SCHEMA_URL;

export function useAuthFormSchema() {
  const [schema, setSchema] = useState<AuthFormSchema>(DEFAULT_AUTH_FORM_SCHEMA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSchema() {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        const cachedSchema = cached ? parseAuthFormSchema(JSON.parse(cached)) : null;
        if (active && cachedSchema) setSchema(cachedSchema);

        if (!SCHEMA_URL) return;

        const response = await fetch(SCHEMA_URL);
        if (!response.ok) return;

        const remoteSchema = parseAuthFormSchema(await response.json());
        if (!remoteSchema) return;

        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remoteSchema));
        if (active) setSchema(remoteSchema);
      } catch {
        // Keep the bundled schema or the cached last-known-good schema.
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadSchema();

    return () => {
      active = false;
    };
  }, []);

  return { schema, isLoading };
}

