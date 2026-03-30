# MediGuard
Privacy-aware medical information system with LLM chatbot — RBAC, NER, DP, Audit Logging

## Development Plan

### Part 1: Authentication, Authorization & Infrastructure

1. **JWT & Database Password Encryption**
   - JWT token generation and verification
   - Encrypted storage for sensitive database fields

2. **RBAC Permission Table Definition**
   - Separate permission tables maintained by frontend and backend
   - Role-permission mapping

3. **Backend Endpoint Protection**
   - JWT authentication (first layer)
   - Backend permission verification (second layer)

4. **Frontend Access Control**
   - Component visibility control (UX optimization)
   - Route guards (prevent unauthenticated access)

5. **Logging Service**
   - Implemented as decorator or function
   - Integrated into backend function calls

6. **Backend Setup (Flask)**
   - Database schema design
   - Initial data seeding

7. **Frontend Setup (React)**
   - Clean and functional UI design
   - Core feature implementation

### Part 2: LLM & Privacy Protection

1. **Local LLM Deployment**
   - Deploy language model locally
   - Implement chatbot Q&A functionality

2. **RAG (Retrieval-Augmented Generation)**
   - Prepare document knowledge base
   - Embed and store documents in vector database
   - RAG pipeline for document retrieval
   - Feed retrieved context to LLM for response generation

3. **Agent Tool Development**
   - Database query tools
   - Additional utility tools

4. **Differential Privacy (DP)**
   - Feature-level privacy protection plan

5. **LLM Security**
   - System prompt role restrictions
   - RBAC within tools
   - Input/output filtering mechanisms
