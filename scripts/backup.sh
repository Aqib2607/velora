#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST=${DB_HOST:-mysql}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASSWORD:-secret}
DB_NAME=${DB_DATABASE:-velora}
S3_BUCKET=${AWS_BUCKET:-velora-backups}

echo "Starting Velora Database Backup - $DATE"

# 1. Create SQL Dump
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS --single-transaction --quick --lock-tables=false $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 2. Sync to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://$S3_BUCKET/database/db_backup_$DATE.sql.gz

# 3. Clean up old backups (older than 7 days locally)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed successfully."
