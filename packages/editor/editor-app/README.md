# ESEngine Editor

A cross-platform desktop visual editor built with Tauri 2.x + egui (Rust native UI).

## Architecture

The editor uses a hybrid architecture:
- **UI**: egui (Rust native immediate mode GUI)
- **Viewport**: WebView with ccesengine (Cocos Creator engine fork)
- **Backend**: Tauri 2.x for system integration

## Prerequisites

Before running the editor, ensure you have the following installed:

- **Node.js** >= 18.x
- **pnpm** >= 10.x
- **Rust** >= 1.70 (for Tauri and WASM builds)
- **wasm-pack** (for building Rapier2D physics engine)
- **Platform-specific dependencies**:
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installing wasm-pack

```bash
# Using cargo
cargo install wasm-pack

# Or using the official installer script (Linux/macOS)
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/esengine/esengine.git
cd esengine
pnpm install
```

### 2. Build ccesengine

The editor uses ccesengine for viewport rendering. Sync engine assets:

```bash
cd packages/editor/editor-app
pnpm sync:ccesengine
```

Or build from source:

```bash
pnpm build:ccesengine
```

### 3. Build Viewport

The viewport is a TypeScript project that runs in WebView:

```bash
pnpm build:viewport
```

### 4. Run Editor

```bash
pnpm tauri:dev
```

Or use the combined command:

```bash
pnpm dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Build viewport and run editor in dev mode |
| `pnpm build` | Build viewport and create production app |
| `pnpm tauri:dev` | Run editor in development mode |
| `pnpm tauri:build` | Build production application |
| `pnpm sync:ccesengine` | Sync ccesengine from engine submodule |
| `pnpm build:ccesengine` | Build and sync ccesengine |
| `pnpm build:viewport` | Build viewport TypeScript code |

## Project Structure

```
editor-app/
├── @types/                 # Type definitions (cc.d.ts)
├── public/                 # Static assets
│   ├── ccesengine/         # Engine ESM modules (synced)
│   ├── engine-assets/      # Shader chunks, effects, materials
│   └── esbuild.wasm        # Script compilation WASM
├── scripts/                # Build scripts
│   ├── sync-ccesengine.mjs # Sync engine from submodule
│   └── bundle-runtime.mjs  # Bundle ESEngine runtime
├── src-tauri/              # Tauri/Rust application
│   ├── assets/             # Runtime assets (viewport.js, cocos-cli)
│   ├── src/
│   │   ├── bin/            # Binary entry points
│   │   ├── commands/       # Tauri IPC commands
│   │   └── egui_editor/    # egui UI implementation
│   └── Cargo.toml
└── viewport/               # WebView viewport (TypeScript)
    ├── src/                # Viewport source code
    └── vite.config.ts      # Builds to src-tauri/assets/
```

## Troubleshooting

### Engine Assets Missing

**Error**: Missing ccesengine files

**Solution**:
```bash
# Initialize engine submodule
git submodule update --init engine

# Sync engine assets
pnpm sync:ccesengine
```

### Build Errors

```bash
pnpm clean
pnpm install
pnpm build
```

### Rust/Tauri Errors

```bash
rustup update
```

## Documentation

- [ESEngine Documentation](https://esengine.cn/)
- [Tauri Documentation](https://tauri.app/)
- [egui Documentation](https://docs.rs/egui/)

## License

MIT License
