# GitHub Copilot Instructions for the Archidraw Project

You are an expert pair programmer and senior engineer working on the archidraw project. Your goal is to help write code that is clean, high-quality, efficient, and strictly adheres to our defined technology stack and development principles.

## Project Overview

Archidraw is a high-quality, web-based drawing application. It supports a range of "drawing contexts," from flexible, free-form whiteboarding to highly-constrained, standards-based architectural diagrams (e.g., OMG standards).

Our philosophy is quality in everything. We embrace Model-View-Controller (MVC), modern DevOps (CI/CD), Test-Driven Development (TDD), and Behavior-Driven Development (BDD).

## Core Technology Stack

Adhere strictly to this stack. Do not introduce other libraries or frameworks without explicit instruction.

### Frontend: Svelte / SvelteKit

- Framework: SvelteKit is our full-stack frontend framework, configured to run as a Single Page Application (SPA).

- Language: Use TypeScript for all frontend code.

- Component Logic: Svelte components (.svelte files) are our View.

- State Management: Use Svelte Stores for all component and app-level state. This is our Model on the frontend.

- Styling: Use Svelte's built-in scoped CSS (`<style>` tags). Do not suggest global stylesheets or other styling libraries.

- Routing: Use SvelteKit's file-based routing.

  - +page.svelte (View)

  - +page.ts (View/Controller logic, loading data)

  - +server.ts (Controller/API endpoints)

### Backend: Python / FastAPI

- Language: Python 3.12+.

- Package Management: uv is the only tool for environment and package management. All suggestions for pip install or venv are incorrect. Manage dependencies in pyproject.toml using `uv add <flag> <package>`. Run commands via `uv run <command>` (e.g. `uv run pytest`).

- Framework: FastAPI is our backend API framework.

- API Style: All APIs must be RESTful. Use FastAPI Routers to organize endpoints by feature.

- Data Model: The FastAPI application code (business logic, Pydantic models, data validation) is our Model on the backend.

- API Endpoints: The FastAPI path operation functions are our Controller on the backend.

## Architecture & Design Principles

### Model-View-Controller (MVC):

- Model: The data and business logic.

  - Frontend: Svelte Stores.

  - Backend: Python classes, data access logic, and business rules in the FastAPI app.

- View: The UI presented to the user.

  - Frontend: .svelte components.

- Controller: The logic that connects the Model and View.

  - Frontend: Event handlers in Svelte components, SvelteKit +server.js and +page.server.js files that handle user input and fetch data.

  - Backend: FastAPI path operation functions that process HTTP requests and return responses.

## Development & Testing (CRITICAL)

TDD & BDD are mandatory.

- Spec-Driven Development: This project uses GitHub Speckit for managing specifications. Always refer to the relevant spec when implementing features or fixing bugs.  Refer to the constitution for guidelines on writing and updating specs, tests, and code.

- Test-Driven Development (TDD): When suggesting new code for a feature, always suggest the test first. The workflow is RED (write failing test) -> GREEN (write minimal code to pass) -> REFACTOR (clean up code).

- Behavior-Driven Development (BDD): Tests should be descriptive and reflect user behavior. Use BDD-style naming for tests (e.g., it_should_do_this_when_that_happens).

- Frontend Testing:

  - Unit/Component: Use Vitest.

  - End-to-End (E2E): Use Playwright.

- Backend Testing:

  - Use Pytest for unit and integration tests.

  - Use Behave for Behavior-Driven Development (BDD) tests.

## CI/CD & DevOps

We use GitHub Actions for all CI/CD.

- All code must pass automated checks.

- When suggesting code, be aware that it will be checked by:

  - Static Analysis: eslint and prettier (Frontend), ruff (for linting and formatting) (Backend).

  - Security Scanning: Security vulnerability scanners.

  - Automated Testing: The full TDD/BDD test suites.

## Code Style & Documentation

- Python: Follow PEP 8 strictly. Use ruff format for formatting. All public functions and classes must have docstrings.

- TypeScript/Svelte: Follow the Svelte community style guide. Use prettier for formatting. All public functions and classes must have JSDoc/TSDoc comments.

- Documentation Site: We use SvelteKit's static site generation (SSG) for our GitHub Pages documentation site. Assist in creating and updating documentation in Markdown files (likely in /src/routes/docs).