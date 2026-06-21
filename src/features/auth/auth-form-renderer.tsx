import { TextField } from '@/components/ui/text-field';
import { type AuthFormField, getFieldValue } from '@/features/auth/auth-form-schema';

type AuthFormRendererProps = {
  fields: AuthFormField[];
  values: Record<string, string>;
  onChangeValue: (fieldId: AuthFormField['id'], value: string) => void;
  editable: boolean;
};

export function AuthFormRenderer({
  fields,
  values,
  onChangeValue,
  editable,
}: AuthFormRendererProps) {
  return (
    <>
      {fields.map((field) => (
        <TextField
          key={field.id}
          label={field.label}
          placeholder={field.placeholder}
          value={getFieldValue(values, field.id)}
          onChangeText={(value) => onChangeValue(field.id, value)}
          keyboardType={field.type === 'email' ? 'email-address' : undefined}
          password={field.type === 'password'}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={
            field.id === 'email'
              ? 'email'
              : field.id === 'password'
                ? 'new-password'
                : 'new-password'
          }
          textContentType={field.id === 'email' ? 'emailAddress' : 'newPassword'}
          inputMode={field.type === 'email' ? 'email' : undefined}
          editable={editable}
        />
      ))}
    </>
  );
}

