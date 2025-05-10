# SetuGuard – Next-Gen Web Threat Detection Extension

SetuGuard is an advanced browser extension and backend system designed to protect users from a wide range of web-based threats. These include typosquatting, DNS hijacking, rogue certificates, phishing attacks, and more. The extension leverages state-of-the-art detection techniques, real-time feedback loops, and powerful backend services to ensure users are always protected from evolving web threats.

## 🚀 Features

### In-Browser Protection:
- **Typosquatting & Domain Detection**: Detects misspelled or homoglyph domains that are often used in phishing attempts (e.g., "facabook.com" instead of "facebook.com").
- **Form Submission Protection**: Intercepts malicious form submissions to protect users from fake or fraudulent data harvesting.
- **DNS & A Record Validation**: Performs real-time validation of DNS records to detect unauthorized changes.

### Backend Intelligence:
- **RPKI and BGP Monitoring**: Protects against BGP hijacks by verifying IP prefixes using RPKI validation.
- **Certificate Transparency (CT)**: Monitors for rogue certificates by polling CT logs.
- **Threat Intelligence Aggregation**: Integrates with threat intelligence feeds like Google Safe Browsing, PhishTank, and AbuseIPDB to enrich threat detection.

### User Feedback Loop:
- **Real-Time Reporting**: Users can report false positives or unrecognized threats via the extension’s intuitive UI.
- **Telemetry**: Collects anonymous event logs to continuously improve detection capabilities.

## 🧩 Architecture Overview

The SetuGuard system consists of two main components:

1. **Extension**: A browser extension built using Manifest V3 and powered by Next.js. It provides the user interface for detection, feedback, and status updates.
2. **Backend**: A microservice-based backend built with NestJS, responsible for threat intelligence, DNSSEC checks, CT log monitoring, RPKI validation, and running machine learning models for domain scoring.

The backend is modular, scalable, and follows a hexagonal architecture that makes it easy to extend, maintain, and deploy.

## 🧠 Technology Stack

- **Frontend (Extension)**: 
  - Next.js (for UI components)
  - Manifest V3 (for background scripts and service workers)
  - Tailwind CSS (for styling)
  - IndexedDB (via Dexie.js) for caching threat lists

- **Backend**: 
  - NestJS (TypeScript-based Node.js framework)
  - PostgreSQL (for storage)
  - Redis (for caching and job scheduling)
  - Python (for machine learning and advanced threat analysis)
  - Various APIs for DNSSEC validation, RPKI checks, and CT log polling

- **Other Tools**: 
  - Docker (for containerization and deployment)
  - GitHub Actions (for CI/CD)
  - Railway or Render (for free deployment)

## 🔧 Getting Started

### Prerequisites:
- Node.js 18+ for both frontend and backend
- Python 3.11 (if using the ML backend service)
- Docker (optional, for local development environments)

### Setup Instructions:
1. Clone the repository to your local machine.
2. Install the necessary dependencies for both the extension and backend.
3. Build and deploy the extension locally or submit it directly to the Chrome Web Store.
4. Run the backend in development mode using NestJS.

### CI/CD and Deployment:
- The backend can be deployed to free cloud platforms such as Railway or Render for quick prototyping.
- GitHub Actions are used to automate the build, test, and deployment pipelines.

## 💬 Contributing

We welcome contributions to enhance SetuGuard’s functionality and detection capabilities. If you would like to contribute:
- Fork the repository.
- Create a new branch for your feature or bug fix.
- Make sure your code adheres to the project’s coding standards.
- Submit a pull request with a clear description of your changes.

Please ensure that the logic remains modular and that no file exceeds 100 lines, as this is a core part of our architecture.

## 📜 License

SetuGuard is open-source and available under the MIT License.

## 📬 Contact

For any questions or issues, feel free to reach out or open an issue on the GitHub repository.

[GitHub Repository Link](https://github.com/AshuraDeath/SetuGuard-mikasa)
