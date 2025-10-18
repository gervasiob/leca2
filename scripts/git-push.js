// scripts/git-push.js
import { execSync } from "child_process";

function run(cmd) {
    execSync(cmd, { stdio: "inherit" });
}

const now = new Date();
const dateStr = now.toISOString().replace("T", " ").substring(0, 19); // "2025-10-18 17:34:12"

try {
    run("git add .");
    run(`git commit -m "feat: auto-commit ${dateStr}"`);
    run("git push");
    console.log("\n✅  Git push realizado correctamente.\n");
} catch (err) {
    console.error("\n❌  Error al ejecutar git push:\n", err.message);
}
