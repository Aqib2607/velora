#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_filename.sql.gz>"
  exit 1
fi

BACKUP_FILE=$1
DB_HOST=${DB_HOST:-mysql}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASSWORD:-secret}
DB_NAME=${DB_DATABASE:-velora}

echo "Starting Velora Database Restore from $BACKUP_FILE"

# Warn user
read -p "WARNING: This will overwrite the current database. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Restore DB
gunzip -c $BACKUP_FILE | mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME

echo "Restore completed successfully. Verifying integrity..."
# Trigger Laravel artisan command to verify ledger integrity
php /var/www/html/artisan ledger:verify

echo "Verification complete."
