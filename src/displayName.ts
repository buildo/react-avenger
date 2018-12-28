export function displayName(wrapper: string) {
  return (Component: React.ComponentType) =>
    `${wrapper}(${Component.displayName || Component.name || 'Component'})`;
}
