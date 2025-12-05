#!/bin/bash
# Diagnostic script for user transactions
# Usage: ./diagnose_user.sh [user_id]

USER_ID=${1:-1}

echo "🔍 Diagnosing transactions for user ID: $USER_ID"
echo ""

cd /var/www/puzo.fun

echo "📊 Running diagnostic command..."
docker-compose -f docker-compose.prod.yml exec -T php php artisan transactions:diagnose $USER_ID

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SQL Queries for manual check:"
echo ""

echo "1. Find user by ID:"
echo "docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u\${DB_USERNAME} -p\${DB_PASSWORD} \${DB_DATABASE} -e \"SELECT id, nickname, email FROM users WHERE id = $USER_ID;\""
echo ""

echo "2. Check all coin transactions for user:"
echo "docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u\${DB_USERNAME} -p\${DB_PASSWORD} \${DB_DATABASE} -e \"SELECT ct.id, ct.amount, ct.reason, DATE(ct.created_at) as date, ct.created_at, a.name as activity_name FROM coin_transactions ct JOIN activities a ON a.id = ct.source_id WHERE ct.user_id = $USER_ID AND ct.source_type = 'App\\\\\\\\Models\\\\\\\\Activity' ORDER BY ct.created_at;\""
echo ""

echo "3. Check user_activity_log entries:"
echo "docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u\${DB_USERNAME} -p\${DB_PASSWORD} \${DB_DATABASE} -e \"SELECT ual.id, ual.user_id, ual.activity_id, ual.date, ual.completed_at, a.name as activity_name FROM user_activity_log ual JOIN activities a ON a.id = ual.activity_id WHERE ual.user_id = $USER_ID ORDER BY ual.date DESC, ual.completed_at DESC;\""
echo ""

echo "4. Find groups without user_activity_log:"
echo "docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u\${DB_USERNAME} -p\${DB_PASSWORD} \${DB_DATABASE} -e \"SELECT ct.user_id, ct.source_id as activity_id, DATE(ct.created_at) as date, COUNT(*) as transaction_count, a.name as activity_name FROM coin_transactions ct JOIN activities a ON a.id = ct.source_id WHERE ct.user_id = $USER_ID AND ct.source_type = 'App\\\\\\\\Models\\\\\\\\Activity' AND NOT EXISTS (SELECT 1 FROM user_activity_log ual WHERE ual.user_id = ct.user_id AND ual.activity_id = ct.source_id AND DATE(ual.date) = DATE(ct.created_at)) GROUP BY ct.user_id, ct.source_id, DATE(ct.created_at);\""

