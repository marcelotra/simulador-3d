import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import './index.css';

function fallbackRender({ error }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  return (
    <div role="alert" className="p-10 bg-red-50 text-red-900 h-screen font-mono">
      <p className="font-bold text-xl mb-4">Something went wrong:</p>
      <pre className="whitespace-pre-wrap">{errorMessage}</pre>
      <pre className="text-xs mt-4 opacity-70">{errorStack}</pre>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackRender={fallbackRender}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
