# Alvsys Vector Sync Implementation Plan

## 🎯 **Goal**
Transform GitHub issues into a vectorized memory bank that AI agents can use to get smarter over time, avoiding past mistakes and referencing successful patterns.

## 📋 **Architecture Overview**

```
GitHub ↔️ GitHubSyncService ↔️ Main DB (Cards/Comments) 
                                      ↓ (Trigger)
                              VectorSyncService 
                                      ↓
                              Supabase Vector DB
                                      ↓
                              MCP Memory Search API
                                      ↓
                              AI Agents (Claude Code, etc.)
```

## 🗄️ **Database Schema**

### **Vector Database Tables** (Supabase)
- `card_embeddings` - Vectorized cards with metadata
- `comment_embeddings` - Vectorized comments with context
- `memory_search` - Unified view for similarity search

### **Key Features**
- **1536-dimension vectors** (OpenAI ada-002)
- **Semantic similarity search** with cosine distance
- **Project-scoped filtering** for isolation
- **Incremental sync** based on update timestamps

## 🔄 **Data Flow**

### **1. GitHub → Main DB** (Existing)
- GitHub webhooks trigger sync
- `GitHubSyncService` handles bidirectional sync
- Cards/Comments updated in PostgreSQL

### **2. Main DB → Vector DB** (New)
- `VectorSyncTrigger` fires after GitHub sync
- `VectorSyncService` processes changed data
- Generates embeddings via OpenAI API
- Stores vectors in Supabase

### **3. Vector DB → AI Memory** (Future MCP Integration)
- MCP tools query vector database
- Semantic search returns relevant past experiences
- AI agents get contextual memory during tasks

## 🛠️ **Implementation Files**

### **Core Services**
- `src/services/vector-sync-service.ts` - Main vectorization logic
- `src/lib/vector-sync-trigger.ts` - Decoupled trigger system
- `src/app/api/vector-sync/route.ts` - API endpoints

### **Database**
- `prisma/vector-schema.sql` - Vector database setup
- Updated `.env.example` with new variables

### **Testing**
- `scripts/test-vector-sync.js` - End-to-end validation

### **Modified Files**
- `src/services/github-sync-service.ts` - Added vector sync trigger

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Supabase Vector Database
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# OpenAI for Embeddings  
OPENAI_API_KEY="sk-your-openai-api-key"

# Enable/Disable Vector Sync
ENABLE_VECTOR_SYNC="true"
```

## 🚀 **Deployment Steps**

### **1. Set Up Vector Database**
```bash
# Run on your Supabase instance
psql -h your-db-host -d postgres -f prisma/vector-schema.sql
```

### **2. Configure Environment**
```bash
# Add to your .env
SUPABASE_URL="..."
SUPABASE_ANON_KEY="..."
OPENAI_API_KEY="sk-..."
ENABLE_VECTOR_SYNC="true"
```

### **3. Test the Flow**
```bash
# Run validation script
node scripts/test-vector-sync.js
```

### **4. API Endpoints**

#### **Manual Sync**
```bash
# Sync specific project
curl -X POST /api/vector-sync \\
  -H "Content-Type: application/json" \\
  -d '{"action": "sync-project", "projectId": "xxx"}'

# Sync all projects  
curl -X POST /api/vector-sync \\
  -H "Content-Type: application/json" \\
  -d '{"action": "sync-all"}'
```

#### **Search Memory**
```bash
# Search similar content
curl -X POST /api/vector-sync \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "search",
    "projectId": "xxx", 
    "query": "user authentication bug",
    "similarityThreshold": 0.7,
    "limit": 5
  }'
```

#### **Get Stats**
```bash
# Project vector stats
curl /api/vector-sync?projectId=xxx
```

## 🔍 **Search Capabilities**

### **What Gets Vectorized**
- **Card titles** - Issue/task names
- **Card descriptions** - Detailed problem descriptions  
- **Acceptance criteria** - Definition of done
- **Comments** - Discussion, solutions, blockers
- **Status/Priority** - Metadata for filtering

### **Search Features**
- **Semantic similarity** - Find related content by meaning
- **Project isolation** - Only search within project scope
- **Content type filtering** - Cards vs comments
- **Similarity thresholds** - Configurable relevance cutoffs
- **Metadata context** - Status, priority, AI vs human content

## 🎯 **AI Memory Use Cases**

### **1. Avoid Past Mistakes**
- AI searches for similar error patterns
- References previous failed approaches
- Learns from debugging history

### **2. Reference Successful Solutions**
- Find working implementations
- Reuse proven patterns
- Build on past successes

### **3. Context-Aware Development**
- Understand project-specific conventions
- Remember architectural decisions
- Maintain consistency across features

### **4. Work-Loop Prevention**
- Detect repetitive failure patterns
- Break out of infinite debugging cycles
- Suggest alternative approaches

## 🔄 **Future MCP Integration**

### **Memory Search Tools**
```typescript
// Future MCP tools for AI agents
mcp_tools: {
  "alvsys/search_memory": "Search project memory",
  "alvsys/get_context": "Get context for current task",
  "alvsys/save_lesson": "Document lessons learned",
  "alvsys/avoid_patterns": "Check for known failure patterns"
}
```

### **Integration Points**
- **Before coding**: Search for similar past issues
- **During development**: Reference successful patterns
- **After completion**: Document new learnings
- **On errors**: Check for known solutions

## 📊 **Monitoring & Maintenance**

### **Health Checks**
- Vector database connectivity
- Embedding API rate limits
- Sync completion status
- Search performance metrics

### **Maintenance Tasks**
- **Periodic full sync** for data consistency
- **Embedding updates** when OpenAI models improve
- **Vector index optimization** as data grows
- **Cleanup old embeddings** for deleted content

## 🎉 **Success Metrics**

### **Technical Metrics**
- Vector sync success rate
- Embedding generation latency
- Search query performance
- Storage utilization

### **AI Effectiveness**
- Reduced work-loop incidents
- Faster issue resolution times
- Improved solution accuracy
- Decreased repetitive mistakes

---

## 🚦 **Ready for Implementation!**

All core components are built and ready. Next steps:
1. **Deploy vector schema** to Supabase
2. **Configure environment** variables  
3. **Test the flow** with real data
4. **Monitor and iterate** based on results
5. **Build MCP integration** once flow is stable

The foundation is solid - alvsys's semantic layer is ready to make AI agents smarter! 🧠✨