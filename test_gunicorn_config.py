#!/usr/bin/env python3
"""
Test script to validate Gunicorn configuration loading
Simulates the gunicorn.conf.py environment variable processing
"""
import os
import sys

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

def main():
    print("🚀 Gunicorn Configuration Test")
    print("=" * 40)
    
    # Load configuration using the same logic as gunicorn.conf.py
    workers = get_env_int("API_WORKERS", 1)
    worker_connections = get_env_int("API_WORKER_CONNECTIONS", 1000)
    timeout = get_env_int("API_TIMEOUT", 120)
    keepalive = get_env_int("API_KEEPALIVE", 2)
    max_requests = get_env_int("API_MAX_REQUESTS", 1000)
    max_requests_jitter = get_env_int("API_MAX_REQUESTS_JITTER", 100)
    
    # String configurations
    bind = get_env_str("API_BIND_ADDRESS", "0.0.0.0:8000")
    worker_class = get_env_str("API_WORKER_CLASS", "uvicorn.workers.UvicornWorker")
    loglevel = get_env_str("API_LOG_LEVEL", "info")
    proc_name = get_env_str("API_PROC_NAME", "fortinet-api")
    
    # Boolean configurations
    preload_app = get_env_bool("API_PRELOAD_APP", True)
    daemon = get_env_bool("API_DAEMON", False)
    
    print("\n🔍 Configuration Summary:")
    print("-" * 25)
    print(f"Workers: {workers}")
    print(f"Worker Connections: {worker_connections}")
    print(f"Timeout: {timeout}s")
    print(f"Keepalive: {keepalive}s")
    print(f"Max Requests: {max_requests} (±{max_requests_jitter})")
    print(f"Bind Address: {bind}")
    print(f"Worker Class: {worker_class}")
    print(f"Log Level: {loglevel}")
    print(f"Process Name: {proc_name}")
    print(f"Preload App: {preload_app}")
    print(f"Daemon Mode: {daemon}")
    
    # Validation tests
    print("\n🧪 Validation Tests:")
    print("-" * 20)
    
    errors = []
    warnings = []
    
    # Test expected values from our configuration update
    expected_workers = 2
    expected_connections = 1500
    expected_timeout = 180
    expected_loglevel = "debug"
    
    if workers == expected_workers:
        print(f"✅ Workers: {workers} (expected: {expected_workers})")
    else:
        errors.append(f"Workers mismatch: got {workers}, expected {expected_workers}")
    
    if worker_connections == expected_connections:
        print(f"✅ Worker Connections: {worker_connections} (expected: {expected_connections})")
    else:
        errors.append(f"Worker Connections mismatch: got {worker_connections}, expected {expected_connections}")
    
    if timeout == expected_timeout:
        print(f"✅ Timeout: {timeout}s (expected: {expected_timeout}s)")
    else:
        errors.append(f"Timeout mismatch: got {timeout}, expected {expected_timeout}")
    
    if loglevel == expected_loglevel:
        print(f"✅ Log Level: {loglevel} (expected: {expected_loglevel})")
    else:
        errors.append(f"Log Level mismatch: got {loglevel}, expected {expected_loglevel}")
    
    # Validation logic (same as in gunicorn.conf.py)
    if workers < 1:
        warnings.append("Workers < 1")
    
    if worker_connections < 100:
        warnings.append("Worker connections < 100")
    elif worker_connections > 5000:
        warnings.append("Worker connections > 5000")
    
    if timeout < 30:
        warnings.append("Timeout < 30s")
    elif timeout > 600:
        warnings.append("Timeout > 600s")
    
    # Report results
    print(f"\n📊 Test Results:")
    print("-" * 15)
    
    if errors:
        print("❌ Configuration Errors:")
        for error in errors:
            print(f"   - {error}")
        return 1
    else:
        print("✅ All configuration tests passed!")
    
    if warnings:
        print("⚠️  Configuration Warnings:")
        for warning in warnings:
            print(f"   - {warning}")
    
    print("\n🎉 Gunicorn configuration loading test completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
