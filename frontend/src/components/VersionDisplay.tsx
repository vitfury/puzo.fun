export const VersionDisplay = () => {
  // Get build date from window object (injected by vite plugin)
  const buildDate = (window as any).BUILD_DATE || '';
  const version = '0.0.1';
  
  const versionString = buildDate 
    ? `version:${version}.${buildDate}`
    : `version:${version}`;

  return (
    <div className="fixed bottom-4 right-4 text-gray-500 text-xs font-mono z-50">
      {versionString}
    </div>
  );
};

