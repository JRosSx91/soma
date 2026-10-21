"use strict";

/**
 * Production entry: force NODE_ENV=production before loading the compiled API
 * so fail-closed bootstrap checks always run. Works on Windows and Unix
 * without extra packages. Platform hosts (Render/Railway) should use this
 * script or set NODE_ENV=production themselves.
 */
process.env.NODE_ENV = "production";
require("../dist/main.js");
