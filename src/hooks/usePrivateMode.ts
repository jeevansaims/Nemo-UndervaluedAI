/**
 * Hook to check if user is in private/public portfolio mode
 * Returns true if private mode is enabled
 */
export function usePrivateMode(): boolean {
  // For now, default to private mode (true)
  // TODO: Connect to actual private/public mode toggle state
  // This should eventually read from: usePrivateModeStore() or similar
  return true;
}
