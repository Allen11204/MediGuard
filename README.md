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


https://synthetichealth.github.io/synthea/ # data source

PART1：
1.登录api+界面
2.医生的界面（管理的病人的数据+chatbot）+api
--前端要求：自己病人的列表（展示medication，observation和condition）
--后端要求: 对病人数据（以上三表的增删改查方法）
3.病人的界面（自己病人的数据加chatbot）+api
--前端要求：自己的所有数据
--后端要求：只需要查询方法
4.admin的界面（audit logs和管理病人和医生，增删改查）+api -- admin不能看paitent data，没有chatbot对话
-- 后端要求：对user增删改查
-- 前端要求：医生列表和病人列表，显示一些基本信息；audit log列表（用于记录fail的access，比如某个病人尝试绕过前端，通过直接访问api端点想要看别的病人的隐私数据）；

PART2：
1.使用ollama本地部署llm
2.调用llm写一个chatbot
3.写能够访问db的agent
4.对llm写system prompt
5.不能让llm越权调用db agent访问别的病人的数据

tips：
1. ui设计：统一简单的ui，不需要很复杂；布局可以思考一下
2. chatbot暂时前端不加，先完成基本功能（前后端）

demo角度：
1.医生只能看自己病人的数据（patient_access_required进行后端权限校验）
2.rbac（前后端访问控制）
3.agent（比如：医生询问病人能不能用某种药物，agent去查db病人的condition）：需要设计一个agent去读取db数据
4.system prompt，本地部署的local llm提前注入受限于本project的prompt（需要explore一下）
