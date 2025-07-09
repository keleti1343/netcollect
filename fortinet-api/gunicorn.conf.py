import os
import multiprocessing
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

def get_env_int(key, default):
    """Get integer environment variable with validation and logging."""
    try:
        value = int(os.environ.get(key, default))
        print(f"🔧 {key}: {value}")
        return value
    except (ValueError, TypeError):
        print(f"⚠️  Invalid {key}, using default: {default}")
        return int(default)

def get_env_str(key, default):
    """Get string environment variable with logging."""
    value = os.environ.get(key, default)
    print(f"🔧 {key}: {value}")
    return value

def get_env_bool(key, default):
    """Get boolean environment variable with validation and logging."""
    value = os.environ.get(key, str(default)).lower()
    result = value in ('true', '1', 'yes', 'on')
    print(f"🔧 {key}: {result}")
    return result

# Configuration validation and logging
print("🚀 Gunicorn Dynamic Configuration Loading...")
print("=" * 50)

# Server socket configuration
bind = get_env_str("API_BIND_ADDRESS", "0.0.0.0:8000")
backlog = get_env_int("API_BACKLOG", 2048)

# Worker processes configuration (using centralized environment variables)
workers = get_env_int("API_WORKERS", 1)
worker_class = get_env_str("API_WORKER_CLASS", "uvicorn.workers.UvicornWorker")
worker_connections = get_env_int("API_WORKER_CONNECTIONS", 1000)
max_requests = get_env_int("API_MAX_REQUESTS", 1000)
max_requests_jitter = get_env_int("API_MAX_REQUESTS_JITTER", 100)
preload_app = get_env_bool("API_PRELOAD_APP", True)
timeout = get_env_int("API_TIMEOUT", 120)
keepalive = get_env_int("API_KEEPALIVE", 2)

# Logging configuration
loglevel = get_env_str("API_LOG_LEVEL", "info").lower()
accesslog = get_env_str("API_ACCESS_LOG", "-")
errorlog = get_env_str("API_ERROR_LOG", "-")
access_log_format = get_env_str("API_ACCESS_LOG_FORMAT",
    '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s')

# Process naming
proc_name = get_env_str("API_PROC_NAME", "fortinet-api")

# Server mechanics
daemon = get_env_bool("API_DAEMON", False)
pidfile = get_env_str("API_PIDFILE", "/tmp/gunicorn.pid")
user = os.environ.get("API_USER", None)
group = os.environ.get("API_GROUP", None)
tmp_upload_dir = os.environ.get("API_TMP_UPLOAD_DIR", None)

# SSL configuration (for future use)
keyfile = os.environ.get("API_SSL_KEYFILE", None)
certfile = os.environ.get("API_SSL_CERTFILE", None)

# Performance tuning
worker_tmp_dir = get_env_str("API_WORKER_TMP_DIR", "/app/tmp")
graceful_timeout = get_env_int("API_GRACEFUL_TIMEOUT", 30)
max_requests_jitter = get_env_int("API_MAX_REQUESTS_JITTER", 100)

# Validation and warnings
print("\n🔍 Configuration Validation:")
print("-" * 30)

if workers < 1:
    print("⚠️  WARNING: API_WORKERS < 1, setting to 1")
    workers = 1
elif workers > multiprocessing.cpu_count() * 2:
    print(f"⚠️  WARNING: API_WORKERS ({workers}) > 2 * CPU cores ({multiprocessing.cpu_count()})")

if worker_connections < 100:
    print("⚠️  WARNING: API_WORKER_CONNECTIONS < 100, may limit performance")
elif worker_connections > 5000:
    print("⚠️  WARNING: API_WORKER_CONNECTIONS > 5000, may cause memory issues")

if timeout < 30:
    print("⚠️  WARNING: API_TIMEOUT < 30s, may cause premature timeouts")
elif timeout > 600:
    print("⚠️  WARNING: API_TIMEOUT > 600s, may cause hanging requests")

print(f"✅ Configuration loaded successfully!")
print(f"   Workers: {workers}, Connections: {worker_connections}")
print(f"   Timeout: {timeout}s, Keepalive: {keepalive}s")
print(f"   Max Requests: {max_requests} (±{max_requests_jitter})")
print("=" * 50)

def when_ready(server):
    server.log.info("Server is ready. Spawning workers")

def worker_int(worker):
    worker.log.info("worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_worker_init(worker):
    worker.log.info("Worker initialized (pid: %s)", worker.pid)

def worker_abort(worker):
    worker.log.info("Worker aborted (pid: %s)", worker.pid)