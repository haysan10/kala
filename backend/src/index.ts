import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🎓 KALA Backend API                             ║
║   Academic Intelligence OS                        ║
║                                                   ║
║   Server running on port ${PORT}                    ║
║   Environment: ${env.NODE_ENV.padEnd(11)}                   ║
║                                                   ║
║   Health: http://localhost:${PORT}/health            ║
║   API:    http://localhost:${PORT}/api               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});
