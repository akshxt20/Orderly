// A tiny framework-agnostic toast store (pub/sub). Living outside React lets
// non-component code — like the React Query mutation-error handler — raise a
// toast just by calling toast.error(...), without prop-drilling a dispatcher.

let listeners = [];
let nextId = 0;

function emit(type, message) {
  const item = { id: ++nextId, type, message };
  listeners.forEach((listener) => listener(item));
}

export const toast = {
  success: (message) => emit("success", message),
  error: (message) => emit("error", message),
  info: (message) => emit("info", message),
};

export function subscribeToToasts(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
