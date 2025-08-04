from flask import Flask, jsonify, render_template, send_from_directory
import os
import threading
from turin_property_monitor import TurinPropertyMonitor

app = Flask(__name__)

# Serve the main dashboard
@app.route('/')
def dashboard():
    return send_from_directory('.', 'index.html')

# Serve CSS files
@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

# Serve JS files  
@app.route('/app.js')
def serve_js():
    return send_from_directory('.', 'app.js')

# API endpoints (keep your existing ones)
@app.route('/api/status')
def api_status():
    return jsonify({"service": "Turin Property Monitor", "status": "running"})

@app.route('/status')
def get_status():
    return jsonify({"message": "Property monitoring service is active"})

# Initialize monitoring in background
def start_monitoring():
    config = {
        "search_criteria": {
            "price_range": {"min": 300, "max": 800},
            "locations": ["Centro", "Crocetta", "San Salvario"],
            "property_types": ["apartment", "studio"]
        },
        "notification_settings": {
            "email": os.environ.get('USER_EMAIL', 'user@example.com')
        }
    }
    
    monitor = TurinPropertyMonitor(config)
    monitor.monitor_properties()

if __name__ == '__main__':
    # Start monitoring in background thread
    monitoring_thread = threading.Thread(target=start_monitoring, daemon=True)
    monitoring_thread.start()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
