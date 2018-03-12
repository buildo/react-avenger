export default wrapper => Component =>
  `${wrapper}(${Component.displayName || Component.name || 'Component'})`;
