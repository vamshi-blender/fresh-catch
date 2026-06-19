import AppTabs from '@/components/app-tabs';

// Tab navigator for the authenticated part of the app. Access is gated by the
// `Stack.Protected` guard in the root `_layout.tsx`.
export default function AppLayout() {
  return <AppTabs />;
}
