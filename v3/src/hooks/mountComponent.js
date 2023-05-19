import { createApp } from 'vue';

export function useMountComponent(rootComp, options) {
  const app = createApp(rootComp, options);
  const containerNode = document.createElement('div');
  document.body.appendChild(containerNode);
  return {
    instance: app.mount(containerNode),
    unmount() {
      app.unmount();
      document.body.removeChild(containerNode);
    }
  };
}
