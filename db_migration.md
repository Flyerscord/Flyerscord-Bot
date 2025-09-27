# Enmap to Drizzle Migration Plan

## Current Architecture

### Tech Stack

- **Runtime**: Node.js with TypeScript
- **Discord Interface**: discord.js
- **Database**: Enmap
- **Deployment**: Docker on remote VM with redundant internet
- **Architecture**: Modular system with common shared code and feature modules

### Database Structure

- Global table for global settings
- Module-specific tables for each module requiring database access
- Module manager system for enabling/disabling features

## Target Architecture

### Planned Tech Stack

- **Database**: PostgreSQL with Drizzle ORM
- **Database Hosting**: Neon
- **Web Interface**: React-based web GUI (future)
- **Everything else**: Remains the same

## Migration Strategy Overview

The migration will follow a three-phase approach:

1. **Development Phase**: Design and test migrations using real production data
2. **Validation Phase**: Comprehensive testing and validation
3. **Production Phase**: Execute the migration with minimal downtime

---

## Phase 1: Development Setup and Migration Design

### Step 1: Production Data Export

```bash
# Export current enmap data structure to understand real data patterns
# This gives us the actual data complexity and edge cases
```

**Deliverables:**

- Complete dump of production enmap tables
- Documentation of data structures found
- Identification of data patterns and edge cases

### Step 2: Development Environment Setup

```bash
# Set up development PostgreSQL database
# Import enmap data in key:json format for migration design
```

**Setup Requirements:**

- Development PostgreSQL instance
- Drizzle ORM configuration
- Data import scripts for key:json format with `raw_` table prefix

### Step 3: Schema Design

Based on the real production data, design normalized PostgreSQL schemas:

**Considerations:**

- Maintain data relationships from enmap structure
- Optimize for Discord bot query patterns
- Plan for future web GUI requirements
- Consider module-specific table organization

**Deliverables:**

- Drizzle schema definitions
- Migration scripts for each module
- Data transformation logic

### Step 4: Migration Script Development

Create migration scripts to transform key:json data into normalized tables:

**Script Categories:**

- **Global settings migration**
- **Module-specific migrations**
- **Data validation scripts**
- **Rollback procedures**

---

## Phase 2: Validation and Testing

### Data Integrity Validation

- **Record count comparisons**: Ensure no data loss
- **Key data point verification**: Validate critical fields
- **Relationship integrity**: Verify data connections remain intact
- **Checksum validation**: Hash comparison for critical datasets

### Performance Testing

- **Migration timing**: Measure actual migration duration
- **Query performance**: Test common bot operations
- **Load testing**: Simulate typical bot usage patterns

### Edge Case Testing

- **Data variations**: Test all data structure variations found
- **Module isolation**: Verify module-specific data integrity
- **Error handling**: Test migration failure scenarios

### Rollback Testing

- **Backup restoration**: Verify backup integrity
- **Rollback procedures**: Test complete rollback process
- **Data consistency**: Ensure rollback maintains data integrity

---

## Phase 3: Production Migration

### Pre-Migration Checklist

- [ ] All migration scripts tested and validated in dev
- [ ] Performance benchmarks established
- [ ] Rollback procedures documented and tested
- [ ] Backup procedures verified
- [ ] Downtime window scheduled and communicated

### Migration Day Procedure

#### Step 1: Preparation

```bash
# 1. Announce maintenance window
# 2. Create full backup of current enmap data
# 3. Verify all migration scripts are ready
```

#### Step 2: Service Shutdown

```bash
# 1. Gracefully shutdown Discord bot
# 2. Verify no active connections
# 3. Final data state capture
```

#### Step 3: Data Migration

```bash
# 1. Dump latest enmap data to prod database as raw_{tablename} tables (key:json format)
# 2. Execute all migration scripts in order
# 3. Run validation scripts
# 4. Verify data integrity
```

#### Step 4: Service Restart

```bash
# 1. Update bot configuration for new database
# 2. Start Discord bot with new Drizzle/PostgreSQL setup
# 3. Verify all modules are functioning
# 4. Run post-migration health checks
```

#### Step 5: Cleanup (24-48 hours later)

```bash
# 1. Verify system stability over time
# 2. Confirm no data issues reported
# 3. Drop raw_{tablename} tables from prod database
# 4. Archive old enmap backup
```

---

## Risk Management

### Backup Strategy

- **Pre-migration**: Full enmap data backup
- **Migration staging**: Raw data tables in prod database with `raw_` prefix
- **Retention**: Keep raw tables for 24-48 hours post-migration

### Rollback Plan

If migration fails:

1. Restore from enmap backup
2. Restart bot with original configuration
3. Investigate issues in development environment
4. Schedule new migration window

### Monitoring

- **During migration**: Real-time progress monitoring
- **Post-migration**:
  - Bot functionality verification
  - Error rate monitoring
  - Performance metrics comparison

---

## Module Migration Strategy

### Migration Order

1. **Low-risk modules**: Start with less critical features
2. **Core modules**: Migrate essential bot functions
3. **High-complexity modules**: Save complex data structures for last

### Per-Module Considerations

- Each module may have unique data patterns
- Some modules might be migratable independently
- Consider feature flags for gradual rollout

---

## Success Criteria

### Migration Complete When:

- [ ] All enmap data successfully migrated to PostgreSQL
- [ ] All bot modules functioning with new database
- [ ] Data integrity validation passes
- [ ] Performance meets or exceeds previous benchmarks
- [ ] No data loss or corruption detected
- [ ] Rollback capability verified (but not needed)

### Post-Migration Benefits

- **Scalability**: PostgreSQL can handle larger datasets
- **Reliability**: Better data consistency and ACID compliance
- **Future-ready**: Prepared for React web GUI integration
- **Query power**: SQL capabilities for complex operations
- **Backup/Recovery**: More robust database backup options

---

## Timeline Considerations

### Development Phase: 2-4 weeks

- Schema design and migration script development
- Comprehensive testing with real data
- Validation and performance optimization

### Production Migration: 2-4 hours downtime

- Actual migration execution
- Validation and bot restart
- Post-migration verification

### Monitoring Period: 1 week

- Stability verification
- Performance monitoring
- Issue resolution if needed

---

## Notes

- Keep raw\_{tablename} tables for 24-48 hours as safety net
- Single database approach simplifies connection management
- Document any discovered data patterns for future reference
- Consider this migration as foundation for future React web GUI
- Plan for potential Neon-specific optimizations post-migration
