export function mountView(runtime, id, content, render) {
  const previous = runtime.views.get(id);
  previous?.dispose?.();
  const view = { content, render, dispose: undefined };
  runtime.views.set(id, view);
  updateView(runtime, content);
  return () => {
    if (runtime.views.get(id) !== view) return;
    view.dispose?.();
    runtime.views.delete(id);
  };
}

export function updateView(runtime, content, render) {
  const view = [...runtime.views.values()].find(view => view.content === content);
  if (!view) return;
  const dispose = view.dispose;
  view.dispose = undefined;
  dispose?.();
  if (render) view.render = render;
  view.dispose = view.render(content, runtime);
}

export function refreshViews(runtime) {
  for (const view of runtime.views.values()) {
    if (view.content.isConnected) updateView(runtime, view.content);
  }
}
