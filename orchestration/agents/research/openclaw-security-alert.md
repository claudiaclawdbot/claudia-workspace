# OpenClaw Security Alert - URGENT

**Summary:** Critical security vulnerabilities have been identified in OpenClaw, including a one-click remote code execution (RCE) and potential for wallet draining. IMMEDIATE ACTION REQUIRED.

**Vulnerability Details:**

*   **CVE-2026-25253 (CVSS 8.8): One-Click RCE:** A malicious link can compromise the entire OpenClaw gateway due to improper validation of the `gatewayUrl` and insecure WebSocket connections.
*   Attackers are also actively attempting protocol downgrade attacks to exploit unpatched instances.
*   Older versions may permit unauthenticated access if authentication is not explicitly enabled and configured.

**Impact:** Remote code execution, exposure of API keys, potential wallet draining, full conversation history compromise, and lateral movement to other infrastructure.

**Is Ryan Affected?**

*   Since Ryan uses OpenClaw, his setup **IS POTENTIALLY VULNERABLE**.

**Mitigation Steps (URGENT):**

1.  **IMMEDIATELY UPDATE** to OpenClaw version 2026.1.29 or later.
2.  If using a reverse proxy (nginx, Caddy, Traefik), **configure `gateway.trustedProxies`** to limit connections.
3.  Strongly **enable `gateway.auth.token` or `gateway.auth.password`**. Default settings are insecure.
4.  Exercise EXTREME CAUTION when installing new skills. Vet code vigilantly. Malicious skills can now be used to compromise wallets and perform unauthorized actions.

**References:**

*   The Hacker News: [OpenClaw Bug Enables One-Click Remote Code Execution via Malicious Link](https://thehackernews.com/2026/02/openclaw-bug-enables-one-click-remote.html)
*   The Register: [OpenClaw security issues laid bare](https://www.theregister.com/2026/02/02/openclaw_security_issues/)
*   Pillar Security: [Caught in the Wild: Real Attack Traffic Targeting Exposed Clawdbot Gateways](https://www.pillar.security/blog/caught-in-the-wild-real-attack-traffic-targeting-exposed-clawdbot-gateways)
*   Cisco Blog: [Personal AI Agents like OpenClaw Are a Security Nightmare](https://blogs.cisco.com/ai/personal-ai-agents-like-openclaw-are-a-security-nightmare)

**Recommendation:** Immediately implement the above mitigation steps to secure Ryan's OpenClaw installation and prevent potential compromise.

**Next Steps:** It's advisable to monitor official OpenClaw channels and security advisories actively. Furthermore, consider a security audit of all installed skills.
