---
title: "Ship Node.js applications as a single executable"
description: "Ship a Node.js application with its runtime. What SEA simplifies, when bundling is optional and which release responsibilities remain."
publishedAt: "2026-09-18T20:56:00+02:00"
topic: "Node.js"
---

A small command-line tool can come with surprisingly long installation instructions. Install a compatible version of Node.js, make sure the package manager is available, install the application and check that the command ends up on the right path.

That might be acceptable for another JavaScript engineer. It is less reasonable for someone who only needs to run a diagnostic command, convert a file or export some data. The application may be written in JavaScript, but that does not mean its users should have to manage a JavaScript environment.

[Single executable applications](https://nodejs.org/api/single-executable-applications.html), usually shortened to `SEA`, address that distribution problem. The application and its Node.js runtime travel together in one executable. The recipient does not need a separate Node.js installation.

Node.js 26 includes this capability. The interesting part is what it changes about delivering an application, rather than the novelty of producing a binary.

## What actually changed

SEA is not new in Node.js 26. Initial support shipped in Node.js 19.7.0. The more convenient building process arrived in [Node.js 25.5.0](https://nodejs.org/en/blog/release/v25.5.0), which introduced `node --build-sea`. Support for an ECMAScript-module entry point followed in [Node.js 25.7.0](https://nodejs.org/en/blog/release/v25.7.0). Node.js 26 carries those improvements forward. This article covers the behavior documented in Node.js 26.9.0, including its optional virtual filesystem support.

There is also an important distinction between being built into Node.js and being stable. At the time of writing, Node.js classifies SEA as **Stability 1.1 - Active development**. Under its [stability policy](https://nodejs.org/api/documentation.html#stability-index), that is still experimental: incompatible changes are possible and experimental features are not recommended for production environments.

The problem itself predates Node's implementation. Tools such as [pkg](https://github.com/vercel/pkg) and [nexe](https://github.com/nexe/nexe) already offered ways to distribute Node.js applications as executables. The SEA team's [original problem statement](https://github.com/nodejs/single-executable/blob/main/blog/2022-08-05-an-overview-of-the-current-state.md) describes recurring difficulties across earlier approaches, including custom runtime patches, custom Node.js builds and interference with internal module-loading behavior.

Those are substantial maintenance costs for a packaging tool. Support inside Node.js gives the ecosystem a shared foundation instead of leaving every implementation to work around the runtime independently.

Even the earlier built-in SEA workflow required several steps. Node generated a preparation blob containing application resources. A separate tool, commonly `postject`, injected that blob into a copy of the Node executable. The developer had to coordinate those operations and their platform-specific details.

`--build-sea` brings blob generation and injection into one Node.js command. As [the implementation's author explains](https://joyeecheung.github.io/blog/2026/01/26/improving-single-executable-application-building-for-node-js/), removing the external injection step also removes machinery that application developers should not need to understand just to ship their software.

## The runtime is included, not removed

A SEA contains the Node.js runtime and embedded application resources. When launched, Node finds the embedded application and runs it.

This is not ahead-of-time compilation of your JavaScript into a standalone native implementation. Your code still executes through Node.js and V8. I would not choose SEA on the assumption that changing the delivery format will make application logic faster.

The useful guarantee is narrower: you can deliver the application together with the runtime version you tested. Users do not have to select a compatible Node.js installation or coordinate it with other applications on their machine.

For a diagnostic tool handed to a customer, that could remove a substantial amount of setup. For a utility used in an environment without access to a package registry, distributing an executable with the required code and assets already included can avoid an installation-time dependency download. The tool's own network requirements, of course, still apply.

There is a size trade-off. A tiny script now travels with a runtime, so the executable can be much larger than the application source. Distributing several independent tools this way also means distributing several copies of that runtime. Fewer files does not necessarily mean fewer bytes.

## Building a small executable

Consider an ECMAScript module saved as `hello.mjs`:

```javascript
import process from "node:process";

const name = process.argv[2] ?? "world";

console.log(`Hello, ${name}!`);
```

Create `sea-config.json` beside it:

```json
{
  "main": "hello.mjs",
  "mainFormat": "module",
  "output": "hello"
}
```

The `mainFormat` field explicitly selects ECMAScript modules. SEA otherwise defaults to CommonJS; the `.mjs` extension is not a substitute for this configuration.

Using Node.js 26.9.0 on a supported Linux target, build and run it from that directory:

```bash
node --build-sea sea-config.json
./hello Ada
```

The application prints `Hello, Ada!`. With the default configuration, Node also emits its experimental SEA warning.

On macOS sign the generated executable before running it. The documentation uses `codesign --sign - hello` for local ad-hoc signing. On Windows, use `"output": "hello.exe"` and run `.\hello.exe Ada`. Public distribution still needs an appropriate signing and trust workflow; producing a runnable file is not the whole release process.

There is no separate resource-injection command in this example and the recipient does not need either `hello.mjs` or the build configuration. Those are build inputs, not installation instructions.

## Bundling is optional

The small example is already one JavaScript file. A real application usually consist of many modules.

Without the virtual filesystem, the embedded entry point's default module loading only supports Node's built-in modules. For a self-contained, multi-file application, the conventional approach is to bundle its JavaScript and dependencies into one entry script before packaging it. SEA does not require [Vite](https://vite.dev) or prescribe a particular bundler.

[Node.js 26.9.0](https://nodejs.org/en/blog/release/v26.9.0), released on 2026-09-16, introduced another option. Setting `"useVfs": true` exposes embedded assets as a read-only virtual filesystem. Its [module loader integration](https://nodejs.org/api/vfs.html#module-loader-integration) supports both CommonJS and ECMAScript modules, including relative imports and package imports from an embedded `node_modules` layout.

For example, suppose `dist/main.mjs` imports `./format-report.mjs`. With both files present on the build machine, this configuration packages them without combining their JavaScript:

```json
{
  "main": "dist/main.mjs",
  "mainFormat": "module",
  "output": "application",
  "useVfs": true,
  "assets": {
    "format-report.mjs": "dist/format-report.mjs"
  }
}
```

Node includes the entry point through `main`. The asset key `format-report.mjs` places the other module beside it in the virtual filesystem; the value identifies its source file on the build machine. The relative import then resolves to the embedded module.

This does not collect dependencies automatically. The build must include the files the application needs, including package metadata and transitive dependencies under the expected `node_modules` paths. For a TypeScript project, I would still type-check and prepare the JavaScript before packaging, whether that produces a bundle or separate modules.

The [SEA VFS integration](https://nodejs.org/api/single-executable-applications.html#virtual-file-system-vfs-for-assets) is currently classified as Stability 1.0 - Early development. It also requires both `useSnapshot` and `useCodeCache` to remain disabled. Bundling remains an option, especially when an existing build already produces a self-contained script. A single executable does not require a single JavaScript file.

## Assets and native dependencies

Non-code resources such as templates and schemas also belong in the asset mapping. Without VFS, they can be read through `getAsset()` from `node:sea`. With VFS enabled, supported `node:fs` operations can read the embedded files and directories. The embedded filesystem is read-only, so writable application data still needs a separate location.

Native add-ons require additional handling. The documented SEA approach embeds the add-on as an asset, writes it to a temporary file and loads it with `process.dlopen()`. Enabling VFS does not make an embedded `.node` file directly loadable. A single distribution file therefore does not necessarily mean an application that never needs additional files at runtime.

Dependencies that discover plugins dynamically or assume a particular installation directory still deserve testing in the packaged application. A successful packaging command is not evidence that those assumptions hold.

Those details belong near the entry point or an infrastructure boundary. Application logic should receive the template, configuration or operation it needs, rather than importing `node:sea` throughout the codebase. Choosing a packaging format should not force a redesign of otherwise testable functions.

## One file does not mean every platform

The executable still targets an operating system and an architecture. A Windows executable is not a Linux executable and an ARM64 build is not automatically an x64 build.

It also inherits requirements from the Node.js binary used to create it. Node's [platform requirements](https://github.com/nodejs/node/blob/main/BUILDING.md#platform-list) include operating-system and runtime-library constraints. On Linux, for example, compatibility still depends on the available C library and other required shared libraries. SEA should not be confused with a fully static binary that runs on any Linux machine.

Node documents cross-platform SEA generation, but that requires a suitable target Node binary and attention to the documented restrictions. It does not produce one universal executable. SEA's own [platform-support limitations](https://nodejs.org/api/single-executable-applications.html#platform-support) also need checking rather than assuming that every Node.js target is equally supported.

A release therefore needs explicit supported target combinations and tests of the resulting executables on those targets. The unit of delivery may be one file per target but the release still has a platform matrix.

## The runtime becomes part of your release responsibility

Bundling the runtime changes who must update it.

Updating a separately installed copy of Node.js does not update the runtime inside an executable you already distributed. Shipping a Node.js security fix to those users means rebuilding and redistributing the application with a patched runtime, even when none of your application code changed.

That follows directly from the packaging model. The convenience for the recipient is real but the publisher takes responsibility for keeping that bundled runtime current.

Record the exact Node.js version used for each release, alongside the application version and dependency lockfile. A runtime update should trigger the same build and release validation as an application change. Users should also have a clear way to identify which release they are running.

This is part of the ownership argument in [DevOps is a skill, not a role](/blog/devops-is-a-skill-not-a-role). Delivering the application includes maintaining what we ship, not merely producing it once.

The release tests should exercise the packaged executable, not only the source. A small smoke test should run outside the repository, without access to its `node_modules`, source files or a separately installed Node.js executable. That makes accidental dependencies on the development environment easier to detect.

The application logic can still have ordinary unit tests. The packaging test answers a different question: does the artifact we intend to distribute actually work under the conditions we promise?

## Where I would use it

I would evaluate SEA for command-line applications intended for people who should not need to care about Node.js. Diagnostic tools, file converters and self-contained internal utilities are good examples of the distribution problem it addresses. The remaining experimental status would be an explicit adoption constraint, especially for software distributed to customers.

I would be less interested in adding it to a service whose existing container-based deployment already solves runtime provisioning. A tool used only inside a repository where the correct Node.js version and dependencies are already managed has less to gain as well. Another artifact format needs to remove a real problem, not merely demonstrate that we can produce it.

The built-in workflow makes SEA more approachable but compatibility testing and runtime maintenance remain release work. Its value is that the team can prepare and test the runtime and application together instead of asking every recipient to reconstruct that environment.

That is the reason to ship a single executable: it makes the application easier for its intended users to run.
