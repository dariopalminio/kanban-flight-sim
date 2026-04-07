# Deploy a GCP - Claud Run

Archivos creados:
* **Dockerfile**:	Build multi-stage: Node 22 compila, nginx sirve en puerto 8080
* **nginx.conf**:	Servidor nginx con SPA fallback y cache de assets
* **.dockerignore**:	Excluye node_modules, dist, docs del contexto de build
* **cloudbuild.yaml**:	Pipeline CI/CD: build → push Artifact Registry → deploy Cloud Run
* **env.yaml**:	Variables de entorno para Cloud Run
Para desplegar por primera vez desde CLI:

Pasos:

1. Crear repositorio en Artifact Registry (una vez)
gcloud artifacts repositories create kanban-flight-sim --repository-format=docker --location=us-central1

2. Deploy manual (sin Cloud Build)
gcloud run deploy kanban-flight-sim --source . --region=us-central1 --allow-unauthenticated --port=8080 --env-vars-file=env.yaml

3. O con Cloud Build (CI/CD)
gcloud builds submit --config=cloudbuild.yaml --substitutions=_REGION=us-central1,_REPO=kanban-flight-sim

Notas:

La región por defecto es us-central1 — cámbiala en cloudbuild.yaml (_REGION) si prefieres otra.
El env.yaml solo tiene NODE_ENV=production por ahora (el frontend es estático, no necesita más). Agrega variables si integras un backend.
Cloud Run usa puerto 8080 por convención; nginx está configurado en ese puerto.

