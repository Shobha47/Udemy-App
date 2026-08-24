import React from 'react';

export function styled<P extends object>(Component: React.ComponentType<P>) {
  return React.forwardRef<any, P & { className?: string }>((props, ref) => {
    // Explicitly casting the forwarded bundle to bypass strict generic instantiation constraints
    return React.createElement(Component, { ...(props as any), ref });
  });
}