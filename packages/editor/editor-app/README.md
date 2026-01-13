# ESEngine Editor

A cross-platform desktop visual editor built with Tauri 2.x + React 18.

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

### 2. Build Rapier2D WASM

The editor depends on Rapier2D physics engine WASM artifacts. First-time setup only requires one command:

```bash
pnpm build:rapier2d
```

This command automatically:
1. Prepares the Rust project
2. Builds WASM
3. Copies artifacts to `packages/physics/rapier2d/pkg`
4. Generates TypeScript source code

> **Note**: Requires Rust and wasm-pack to be installed.

### 3. Build Editor

From the project root:

```bash
pnpm build:editor
```

### 4. Run Editor

```bash
cd packages/editor/editor-app
pnpm tauri:dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm build:rapier2d` | Build Rapier2D WASM (required for first-time setup) |
| `pnpm build:editor` | Build editor and all dependencies |
| `pnpm tauri:dev` | Run editor in development mode with hot-reload |
| `pnpm tauri:build` | Build production application |
| `pnpm build:sdk` | Build editor-runtime SDK |

## Project Structure

```
editor-app/
├── src/                    # React application source
│   ├── components/         # UI components
│   ├── panels/             # Editor panels
│   └── services/           # Core services
├── src-tauri/              # Tauri (Rust) backend
├── public/                 # Static assets
└── scripts/                # Build scripts
```

## Troubleshooting

### Rapier2D WASM Build Failed

**Error**: `Could not resolve "../pkg/rapier_wasm2d"`

**Cause**: Missing Rapier2D WASM artifacts.

**Solution**:
1. Ensure `wasm-pack` is installed: `cargo install wasm-pack`
2. Run `pnpm build:rapier2d`
3. Verify `packages/physics/rapier2d/pkg/` directory exists and contains `rapier_wasm2d_bg.wasm` file

### Build Errors

```bash
pnpm clean
pnpm install
pnpm build:editor
```

### Rust/Tauri Errors

```bash
rustup update
```

### Windows Users Building WASM

The `pnpm build:rapier2d` script works directly on Windows. If you encounter issues:
1. Use Git Bash or WSL
2. Or download pre-built WASM artifacts from [Releases](https://github.com/esengine/esengine/releases)

## Documentation

- [ESEngine Documentation](https://esengine.github.io/esengine/)
- [Tauri Documentation](https://tauri.app/)

## License

MIT License
