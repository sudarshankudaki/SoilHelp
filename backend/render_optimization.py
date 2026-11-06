"""
Render.com Optimization Script

This script helps optimize the backend for Render's 512MB RAM limit:
1. Reduces TensorFlow memory usage
2. Implements aggressive garbage collection
3. Optimizes model loading
"""

import os
import gc

def optimize_for_render():
    """
    Configure environment variables and settings optimized for Render's 512MB RAM.
    Call this BEFORE importing TensorFlow or heavy libraries.
    """
    
    # 1. Limit TensorFlow memory growth
    os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TF logs
    
    # 2. Disable TensorFlow JIT compilation (saves RAM)
    os.environ['TF_XLA_FLAGS'] = '--tf_xla_enable_xla_devices=false'
    
    # 3. Set conservative memory allocator
    os.environ['TF_GPU_ALLOCATOR'] = 'cuda_malloc_async'
    
    # 4. Limit numpy/BLAS threads
    os.environ['OMP_NUM_THREADS'] = '2'
    os.environ['MKL_NUM_THREADS'] = '2'
    os.environ['OPENBLAS_NUM_THREADS'] = '2'
    
    # 5. Python memory optimization
    os.environ['PYTHONOPTIMIZE'] = '2'  # Remove docstrings
    
    # 6. Disable TensorFlow oneDNN optimizations (saves RAM)
    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
    
    print("[Render Optimization] Memory-optimized configuration applied")
    
    # Force garbage collection
    gc.collect()


def cleanup_after_prediction():
    """
    Call this after each prediction to free memory immediately.
    """
    import gc
    gc.collect()
    
    # Try to release TensorFlow memory (if available)
    try:
        import tensorflow as tf
        if hasattr(tf.keras.backend, 'clear_session'):
            # Don't clear session completely, just garbage collect
            pass  # Session clearing disabled to avoid reload overhead
    except:
        pass


def get_memory_usage():
    """
    Get current memory usage in MB.
    Useful for monitoring in production.
    """
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    return {
        'rss_mb': mem_info.rss / 1024 / 1024,  # Resident Set Size
        'vms_mb': mem_info.vms / 1024 / 1024,  # Virtual Memory Size
    }


def log_memory(label=""):
    """Log current memory usage with optional label."""
    try:
        mem = get_memory_usage()
        print(f"[Memory {label}] RSS: {mem['rss_mb']:.1f} MB, VMS: {mem['vms_mb']:.1f} MB")
    except:
        pass  # psutil not available


if __name__ == "__main__":
    print("Testing Render optimization...")
    optimize_for_render()
    log_memory("after optimization")
