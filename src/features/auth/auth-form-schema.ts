export type AuthFieldId = 'email' | 'password' | 'confirmPassword';
export type AuthFieldType = 'email' | 'password';

export type AuthFormField = {
  id: AuthFieldId;
  type: AuthFieldType;
  label: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  matches?: AuthFieldId;
};

export type AuthFormDefinition = {
  title: string;
  submitLabel: string;
  fields: AuthFormField[];
};

export type AuthFormSchema = {
  schemaVersion: 1;
  signUp: AuthFormDefinition;
};

const FIELD_IDS = ['email', 'password', 'confirmPassword'] as const;
const FIELD_TYPES = ['email', 'password'] as const;

export const DEFAULT_AUTH_FORM_SCHEMA: AuthFormSchema = {
  schemaVersion: 1,
  signUp: {
    title: 'Create new account',
    submitLabel: 'Sign up',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        required: true,
      },
      {
        id: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        required: true,
        minLength: 8,
      },
      {
        id: 'confirmPassword',
        type: 'password',
        label: 'Confirm Password',
        placeholder: 'Enter your confirm password',
        required: true,
        matches: 'password',
      },
    ],
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldId(value: unknown): value is AuthFieldId {
  return typeof value === 'string' && FIELD_IDS.includes(value as AuthFieldId);
}

function isFieldType(value: unknown): value is AuthFieldType {
  return typeof value === 'string' && FIELD_TYPES.includes(value as AuthFieldType);
}

function cleanString(value: unknown, fallback: string, maxLength = 80) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : fallback;
}

function normalizeField(value: unknown): AuthFormField | null {
  if (!isRecord(value) || !isFieldId(value.id) || !isFieldType(value.type)) return null;
  if (value.id === 'email' && value.type !== 'email') return null;
  if ((value.id === 'password' || value.id === 'confirmPassword') && value.type !== 'password') {
    return null;
  }

  const fallback = DEFAULT_AUTH_FORM_SCHEMA.signUp.fields.find((field) => field.id === value.id);
  if (!fallback) return null;

  const matches = isFieldId(value.matches) ? value.matches : fallback.matches;
  const minLength = typeof value.minLength === 'number' && value.minLength > 0 ? value.minLength : fallback.minLength;

  return {
    id: value.id,
    type: value.type,
    label: cleanString(value.label, fallback.label),
    placeholder: cleanString(value.placeholder, fallback.placeholder),
    required: typeof value.required === 'boolean' ? value.required : fallback.required,
    ...(minLength ? { minLength } : null),
    ...(matches ? { matches } : null),
  };
}

export function parseAuthFormSchema(value: unknown): AuthFormSchema | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.signUp)) return null;

  const fieldsValue = value.signUp.fields;
  if (!Array.isArray(fieldsValue)) return null;

  const fields: AuthFormField[] = [];
  const ids = new Set<AuthFieldId>();

  for (const item of fieldsValue) {
    const field = normalizeField(item);
    if (!field || ids.has(field.id)) return null;
    ids.add(field.id);
    fields.push(field);
  }

  if (!ids.has('email') || !ids.has('password')) return null;

  return {
    schemaVersion: 1,
    signUp: {
      title: cleanString(value.signUp.title, DEFAULT_AUTH_FORM_SCHEMA.signUp.title),
      submitLabel: cleanString(value.signUp.submitLabel, DEFAULT_AUTH_FORM_SCHEMA.signUp.submitLabel, 30),
      fields,
    },
  };
}

export function getFieldValue(values: Record<string, string>, fieldId: AuthFieldId) {
  return values[fieldId] ?? '';
}

