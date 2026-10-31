<div align="center">

# SOMA

### Your body is recovering. Discover how.

**A free, interactive educational companion for understanding the body's recovery after substance use.**

[🚀 Launch Soma](https://somarecovery.app) · [Source Code](https://github.com/JRosSx91/soma) · [Report an Issue](https://github.com/JRosSx91/soma/issues)

![Status](https://img.shields.io/badge/status-public%20beta-22c55e?style=flat-square)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-1e293b?style=flat-square)
![Backend](https://img.shields.io/badge/backend-NestJS-1e293b?style=flat-square)
![Access](https://img.shields.io/badge/access-free-0ea5a4?style=flat-square)

</div>

---

## 🧬 What is Soma?

**Soma is a free educational web application designed to make the science of physiological recovery more understandable, visual, and accessible.**

Recovery involves complex biological processes. Different organs, physiological systems, and neurological pathways may respond differently after substance use is discontinued.

Soma explores these processes through interactive visualizations, educational explanations, and personalized progress tracking.

The project combines an interest in software engineering, neuroscience, human physiology, and accessible scientific communication.

**Soma is an educational application, not a medical device.** Its recovery models are illustrative population-oriented approximations, not clinical measurements or predictions of an individual's health.

**🌐 [Explore Soma — Public Beta](https://somarecovery.app)**

---

## 🖥️ A Look Inside

Soma 2.0 features a responsive interface built around recovery tracking, anatomical exploration, and educational content.

The application is designed to make complex physiological information approachable through visual representations and interactive experiences.

Screenshots of the public beta interface will be added here.

---

## ✨ Features

### 🧬 Interactive Anatomical Atlas

Explore anatomical systems and individual structures through an interactive interface.

Learn about their physiological functions, their relationships with other systems, and the potential effects associated with substance exposure.

### 📊 Personal Recovery Dashboard

Follow your progress through a personalized dashboard based on your recorded substance-use history and abstinence dates.

Educational recovery visualizations help illustrate how physiological processes may evolve over time.

**These visualizations are models, not individual medical assessments.**

### 🧠 Neurotransmitter Visualizations

Explore educational representations of neurotransmitter-related changes associated with substance exposure and recovery.

These visualizations are intended to communicate general physiological concepts and uncertainty, not to measure actual neurotransmitter concentrations.

### 🏆 Achievements and Milestones

A system of achievements and milestones provides positive reinforcement and helps users recognize their progress.

Progress tracking is designed to encourage engagement without presenting achievements as clinical indicators.

### 📚 Evidence-Informed Educational Content

Soma separates anatomical information, substance-related explanations, and modeled recovery estimates.

The application aims to communicate scientific uncertainty transparently rather than presenting educational approximations as established individual outcomes.

### 🌍 Accessible Experience

- Available in English and Spanish.
- Responsive interface for desktop and mobile devices.
- Personal accounts and progress tracking.
- Free access to the application's recovery features.
- No subscriptions or paid recovery features.

---

## 📚 Current Educational Scope

The development catalogs include:

| Content | Catalog Scope |
| --- | ---: |
| Anatomical systems | 12 |
| Canonical organ and structure entries | 21 |
| Modeled organ–substance recovery curves | 56 |
| Achievements | 106 |

These figures describe the project's cataloged content, not medical validation, clinical accuracy, or completeness of scientific coverage.

Some educational materials and anatomical illustrations remain under review.

---

## 🛠️ Technology

Soma is developed as a TypeScript monorepo, with a modern frontend, a modular backend, and a PostgreSQL database.

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Shared contracts | TypeScript |
| Package management | pnpm |
| Infrastructure | Render, Supabase, Cloudflare |
| Legacy visualization | Three.js / React Three Fiber |

---

## 📁 Project Structure

```text
apps/
  web/                 # React frontend and Soma 2.0
  api/                 # NestJS API

packages/
  shared-types/        # Shared TypeScript contracts

docs/                  # Project documentation
```

---

## 💻 Running Locally

Soma is actively maintained, and development requirements may evolve.

Install the project dependencies from the repository root:

```bash
pnpm install
```

Running the complete application also requires the appropriate environment variables, database configuration, and supporting services.

Consult the repository's environment examples and package scripts for the available development commands.

**Never commit credentials, secrets, or `.env` files containing sensitive information.**

---

## 🚀 Development Status

### 🟢 Public Beta

**Soma 2.0 is available as a public beta and remains under active development.**

🌐 **[somarecovery.app](https://somarecovery.app)**

The application has moved beyond its initial development-only phase and is being refined through testing, bug fixes, accessibility improvements, and ongoing educational content development.

The project is independently developed and maintained.

### Development Branches

| Branch | Purpose |
| --- | --- |
| `main` | Production branch |
| `develop` | Ongoing development and integration |

Changes are reviewed and integrated into the production branch before deployment.

The public beta may contain incomplete educational materials, visual inconsistencies, or other issues that will be addressed as development continues.

---

## 🔬 Scientific Integrity

Soma is designed around a fundamental principle:

**Scientific uncertainty should be explained, not concealed.**

To support that principle:

- Anatomical descriptions, substance-related educational narratives, and recovery models are maintained as distinct information layers.
- Recovery curves represent educational approximations rather than measurements of an individual's physiological state.
- The absence of a recovery curve or educational narrative does not imply that an organ or system is unaffected.
- Neurotransmitter visualizations do not represent measured neurotransmitter levels.
- Some anatomical illustrations are AI-generated educational artwork and may require specialist review.
- Educational references and model confidence should not be confused with clinical validation.
- Recovery experiences vary between individuals and cannot be reduced to a universal physiological timeline.

### ⚕️ Medical Disclaimer

Soma does not provide medical diagnoses, treatment recommendations, or individualized clinical predictions.

The information presented is intended for educational purposes only.

**Soma does not replace professional medical advice, diagnosis, or treatment.**

If you have health concerns, consult a qualified healthcare professional.

---

## 🔐 Privacy and Responsible Feedback

Soma deals with information that may be sensitive.

Please do not include personal health information, substance-use histories, credentials, or other private data in public GitHub issues.

Bug reports and technical feedback should use anonymized examples whenever possible.

---

## 🤝 Contributing and Feedback

Soma is an independently developed project.

Constructive feedback, bug reports, and suggestions are welcome through [GitHub Issues](https://github.com/JRosSx91/soma/issues).

Please check existing issues before opening a new report.

---

## 💚 Free Access

**Soma is free to use.**

The project's mission is to make recovery education and physiological knowledge accessible without introducing financial barriers.

There are:

- No subscriptions.
- No paid recovery features.
- No donation requirements.
- No advertising.

**Understanding your body should not depend on your ability to pay.**

---

## 📄 License

Refer to the repository's `LICENSE` file for the applicable terms.

If no license is present, do not assume that the source code is open source or available for unrestricted reuse.

---

<div align="center">

### 🧬 Understand the body. Visualize recovery.

**Built with curiosity about software, neuroscience, and the human body.**

**Made to help people understand recovery, one step at a time.**

[🚀 **Try Soma — Public Beta**](https://somarecovery.app)

</div>
