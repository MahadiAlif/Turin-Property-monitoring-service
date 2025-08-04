from flask import Flask, jsonify
from turin_property_monitor import TurinPropertyMonitor
import os
import threading

app = Flask(__name__)

# Initialize the monitor in a background thread
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

@app.route('/')
def health_check():
    return jsonify({"status": "running", "service": "Turin Property Monitor"})

@app.route('/status')
def get_status():
    return jsonify({"message": "Property monitoring service is active"})

if __name__ == '__main__':
    # Start monitoring in background thread
    monitoring_thread = threading.Thread(target=start_monitoring, daemon=True)
    monitoring_thread.start()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
