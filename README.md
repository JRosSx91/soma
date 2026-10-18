<div align="center">

# SOMA

### Your body is recovering. Discover how.

**A visual, educational companion for understanding the body's recovery after substance use.**

[Explore the project](https://github.com/JRosSx91/soma) · [Development branch](https://github.com/JRosSx91/soma/tree/develop)

![Status](https://img.shields.io/badge/status-active%20development-0ea5a4?style=flat-square) ![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-1e293b?style=flat-square) ![Backend](https://img.shields.io/badge/backend-NestJS-1e293b?style=flat-square)

</div>

---

## What is Soma?

Soma is a personal project exploring a simple question: **how can complex information about physiological recovery become understandable, visual, and meaningful?**

It combines a recovery dashboard, an interactive anatomical atlas, educational content, and milestones in a cohesive interface. Its aim is to help people explore what different organs and systems do, how substance exposure may affect them, and what scientific literature can—and cannot—tell us about recovery.

Soma is **an educational software project, not a medical device**. Its recovery curves are illustrative models, not clinical measurements, diagnoses, or predictions of an individual's health.

## A look inside

> **Screenshots coming soon.** The Soma 2.0 interface is under active development. Add verified screenshots here once the public-facing presentation is ready.

<!-- Suggested future layout:
| Dashboard | Anatomical atlas |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Anatomical atlas](docs/screenshots/anatomy.png) |
-->

## Features

- **Personal recovery dashboard:** uses authenticated profile and substance data to present modeled progress; public previews are explicitly labeled as demos.
- **Interactive anatomical atlas:** explore body systems, individual structures, anatomical descriptions, and relevant references.
- **Substance-specific educational content:** curated narratives and recovery models remain separate from general anatomy.
- **Achievements and milestones:** a visual system for tracking meaningful progress within the application.
- **A modern, responsive interface:** Soma 2.0 is being developed alongside the legacy experience while features are consolidated.

### Current content

| Content | Current scope |
| --- | ---: |
| Anatomical systems | 12 |
| Canonical organ/structure entries | 21 |
| Modeled organ–substance recovery curves | 56 |
| Achievements | 106 |

These counts describe the current development catalogs, **not medical validation** or completeness of coverage. Some anatomical illustrations and educational sheets are still being reviewed and expanded.

## Technology

| Layer | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS |
| Data | PostgreSQL, Prisma |
| Shared contracts | TypeScript shared-types package |
| Package management | pnpm monorepo |
| Legacy visualization | Three.js / React Three Fiber |

## Project structure

```text
apps/
  web/                # React frontend and Soma 2.0
  api/                # NestJS API
packages/
  shared-types/       # Shared TypeScript contracts
docs/                  # Project documentation
```

## Running locally

Soma is under active development, and the exact setup requirements may change. Refer to the repository's package scripts and environment examples before starting.

```bash
# From the repository root
pnpm install
```

The application also requires the appropriate database and environment configuration. **Do not commit `.env` files or credentials.** Full verified setup instructions will be published once the development workflow is documented end-to-end.

## Development status

**Soma 2.0 is in active development.** The current focus is completing and reviewing the anatomical atlas, consolidating the application experience, and preparing the public-facing presentation.

Development work happens on [`develop`](https://github.com/JRosSx91/soma/tree/develop). The [`main`](https://github.com/JRosSx91/soma/tree/main) branch is maintained separately; ongoing work should not be mistaken for a released product.

## Scientific integrity

Soma is designed to communicate uncertainty rather than conceal it:

- Anatomical explanations, substance-related narratives, and modeled recovery curves are distinct data layers.
- A missing curve or narrative means that the project does not currently provide one—not that an organ is unaffected.
- Recovery models are educational approximations and cannot establish individual healing, abstinence, or clinical outcomes.
- Some illustrations are AI-generated educational artwork and remain subject to specialist anatomical review.

**Soma does not replace medical advice, diagnosis, or treatment.** If you have health concerns, consult a qualified healthcare professional.

## Contributing and feedback

The project is evolving. Suggestions, bug reports, and thoughtful feedback are welcome through [GitHub Issues](https://github.com/JRosSx91/soma/issues). Please avoid sharing sensitive personal health information in public issues.

## 💚 Support Soma

Soma is an independent project built with a simple mission: to make recovery education, physiological insights, and progress tracking accessible to everyone.

Developing and maintaining Soma takes time and resources. If you believe in the project and would like to help it grow, you can support its development through a voluntary donation.

☕ [Support Soma on Ko-fi](https://ko-fi.com/somaapp)

Your contribution helps support development, infrastructure, and future improvements.

Soma's essential recovery features will remain free for everyone. Donations are always optional.

Thank you for helping us build something meaningful. 💚

## License

Check the repository's `LICENSE` file for the applicable terms. If no license is present, **do not assume that the code is open source or available for reuse**.

---

<div align="center">

**Built with curiosity about software, neuroscience, and the human body.**

</div>
