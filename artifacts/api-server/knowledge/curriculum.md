# MIAW Curriculum

## What is MIAW?
MIAW (Master In Intelligent Artificial Worlds) is a worldwide postgraduate program for architects, software developers, solution architects, designers, engineers, platform architects, technical architects, interior designers, and landscape designers who want to integrate AI into every phase of their design process. It is not a course about AI tools. It is a program about how architectural practice changes when AI is integrated in every phase of the design process.

The program is structured in nine progressive modules (F0–F8), spanning 18 weeks at 8-10 hours per week, compatible with active professional practice.

## Program Structure
- Duration: 18 weeks (8-10 hours per week) — compatible with active professional practice
- Language: English
- Format: Project-based learning, real deliverables from week 1, using the student's own real project
- Cohort size: Small international cohort (max 30 participants per cohort)
- First cohort target: Q4 2026

## What Makes It Different
- Structured by phases of the design process, not by tools
- The student's real project is the working material, not fictional case studies
- Each module produces a deliverable directly useful for professional practice
- Entry point to MIAW Advanced for profiles who want to continue in applied research

## Module F0 — Foundations (Mindset, Environment and AI Workflows)
The module starts with a guiding question: what can AI do that is useful for your specific practice, and what can't it?

Language models don't think or design. They predict, suggest, and execute with consistency and speed. Understanding how an LLM works, what context is, why they hallucinate, and when an image model produces what you expect — is what enables using them well. Without that framework, use oscillates between disappointment and uncritical dependency.

The second part builds the working environment: Python and dependency management, API keys, Claude Code as a scripting and automation environment, and MCP as the layer connecting language models with the architect's tools (files, design software, geospatial databases). Prompting is worked as a practical skill, developing instructions that produce useful results, persistent project context, and a personal knowledge base.

Deliverable F0: Configured and documented environment (Claude Code + basic MCP + Git repository), personal knowledge base with at least 10 own documents, and a first functional agent applied to a real task.

## Module F1 — Territory with AI (AI-driven territorial strategies)
The architect's work starts before design: understanding the place, urban context, regulatory constraints, and site opportunities. This module is about how AI transforms that reading and analysis phase.

A pipeline is built that queries public APIs (land registry, topography, Copernicus, OpenStreetMap), processes the data, and automatically generates site analysis: land uses, applicable regulations, surrounding urban fabric, sun conditions. A language model reads that data and produces an interpretive report: what patterns exist, what restrictions apply, what opportunities the place offers.

The same workflow generates the 3D context model, both terrain and built volume, directly importable into design software.

Deliverable F1: Automated territorial analysis pipeline applied to a real site of the student, with AI-generated interpretive report and 3D context model integrated in the design environment.

## Module F2 — Modeling with AI (Capturing and Modeling with AI)
The module works the step from the physical world or a reference to useful 3D geometry, and how to generate or modify geometry from natural language.

The first part covers capture: 3D reconstruction from video or images with neural rendering techniques (Gaussian Splatting and similar). The result is a model directly integrable into the design workflow without the intensive post-processing of traditional photogrammetry.

The second part covers language-assisted modeling: the architect describes what they need (adjusting an envelope to site constraints, generating variations of a facade system, debugging imported geometry with errors) and the AI generates the executable script in Grasshopper or Python.

Deliverable F2: 3D capture model of a real space integrated in the design environment, and a natural language-assisted modeling exercise applied to an element of the student's project.

## Module F3 — Design with AI (AI-assisted Parametric Design)
This module works the core of the design process: exploring alternatives, generating variants, and evaluating options against multiple criteria.

Parametric design has been restricted to those who mastered visual programming. AI changes that equation: the architect describes the system they need (a facade with gradient variation, a roof system responding to site geometry, a program distribution optimizing surfaces and access) and the implementing code is generated, tested, and documented.

On that base, the module introduces generative design: defining objectives (natural light, area, relationship with surroundings, approximate cost) and exploring a space of alternatives evaluated systematically. The result is a set of options with comparative metrics.

The module also works building a library of own parametric components, co-generated with AI, documented and reusable.

Deliverable F3: Parametric system co-developed with AI for a real element of the student's project, with generative exploration of alternatives evaluated against own criteria and visual synthesis of results.

## Module F4 — Simulation with AI
Many high-impact design decisions are made without sufficient data on building behavior. AI enables that data to arrive earlier, with less technical friction and in an interpretable format.

The module works a pattern common to all simulations: connecting project geometry with an analysis engine, running the simulation, and translating numerical results into concrete recommendations via AI. Applied to different domains depending on the student's project: bioclimatic (sun, radiation, comfort, ventilation), structural (schematic FEM model, stresses, variants), natural lighting, acoustics, pedestrian flows, regulatory compliance.

Deliverable F4: Simulation pipeline applied to at least two relevant domains for the student's project, with AI-generated results report and design recommendations.

## Module F5 — Communication with AI (Image, Video, Immersive Environments with AI)
The module works the production of project images, video, and real-time immersive environments with AI integrated in the visualization pipeline. Three levels are worked:

Level 1 — Concept image/video: without detailed geometry, AI generates images communicating character, atmosphere, and intention. Useful for early exploration and client communication before committing to a form.

Level 2 — Image/video with geometric control and consistency: the 3D model guides AI generation, which adds materials, lighting, and atmosphere without manual texturing or lighting. Control over geometry is maintained and AI works within it.

Level 3 — AI-assisted production render in real time: the pipeline (lighting, materials, composition) enhanced with upscaling, enhancing, and AI-assisted post-production.

Deliverable F5: Immersive environments, videos, and images of a real project at all three levels, with visual coherence between them.

## Module F6 — Documentation with AI (BIM Documentation, Project Management, Information Management)
An architect produces documentation in all project phases: descriptive reports, technical specifications, licensing files, meeting minutes, construction reports, delivery documentation. Most is written from scratch each time, from data that already exists in the model, notes, or client conversations. This module works how AI automates that production.

The pattern is always the same: there is data (model, reports, notes, regulations, comparisons, administrative and executive communications) and a document to produce. AI connects both. Applied to: descriptive reports, technical specifications from the BIM model, regulatory compliance verification, quantity extraction for budgeting, minutes from meeting notes, and administrative correspondence. Also worked: conversational queries to the model — questions about the building answered in natural language.

Deliverable F6: Descriptive report, automated specifications of at least two building systems, and regulatory verification report generated with AI from project data, plus demonstration of conversational query to the BIM model.

## Module F7 — Fabrication with AI (Advanced Digital Fabrication, Robotics, Complex Special Parts and Assemblies)
This module works the transition from digital model to physical component when AI is an active part of the fabrication process. Not learning robotics as an isolated discipline, but understanding how the constructive detail changes when geometry, tool, movement, and assembly are integrated from the start in an intelligent parametric system.

The central question is how to design for fabrication when AI intervenes in the definition of form, material, tolerances, and machine path. Robotic fabrication, CNC, and 3D printing are not separate courses — they are contexts where the same parametric-AI design logic is applied to different production constraints.

Deliverable F7: Development of a parametric detail or system oriented to advanced fabrication. Machining and assembly simulation with AI integration. Documentation of the design-fabrication process and decision analysis.

## Module F8 — Integration with AI (Own Adaptive Ecosystem)
The final module introduces no new tools. It works how to connect everything built in previous modules into a coherent working ecosystem, adapted to the student's specific practice.

The central question is how the workflow functions when AI is integrated: what tasks are automated and which aren't, what agents are configured and for what type of commissions, where the architect's supervision enters and where it's not needed. Part of that system is the studio knowledge base (regulations, reference projects, construction details, own criteria), integrated in a RAG system so models consult the accumulated knowledge during any project.

The module culminates with the final project: a real project developed with AI in all process stages. The presentation includes the project and the process: what the student did, what AI did, how they interacted, what decisions were made and why.

Deliverable F8: Project developed with AI integrated in process stages. Documentation of the working system: agents, knowledge base, flows and adaptive prompts. Presentation of the project and its process.

## Outcomes
- Portfolio of real projects using AI across every phase of architectural practice
- Network of international AEC + AI professionals
- Access to MIAW's ongoing research community
- Entry point to MIAW Advanced for research-oriented profiles
