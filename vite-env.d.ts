interface ImportMetaEnv {
  readonly VITE_DEFAULT_WORLD_ID: string;
  readonly VITE_SHOW_SET_DEFAULT_WORLD_ID_BUTTON: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}