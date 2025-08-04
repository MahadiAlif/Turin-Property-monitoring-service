'''
Turin Property Monitor - Idealista Scraper
A Python script to monitor property listings on Idealista for Turin
'''

import requests
from bs4 import BeautifulSoup
import time
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import sqlite3
import schedule
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('property_monitor.log'),
        logging.StreamHandler()
    ]
)

class TurinPropertyMonitor:
    def __init__(self, config):
        self.config = config
        self.base_url = "https://www.idealista.it/affitto-case/torino-torino/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.setup_database()

    def setup_database(self):
        # Initialize SQLite database for storing listings
        self.conn = sqlite3.connect('property_listings.db')
        cursor = self.conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS listings (
                id TEXT PRIMARY KEY,
                title TEXT,
                price INTEGER,
                location TEXT,
                description TEXT,
                url TEXT,
                date_added DATETIME,
                is_new BOOLEAN DEFAULT 1
            )
        ''')
        self.conn.commit()

    def scrape_listings(self):
        # Scrape property listings from Idealista
        url = self.base_url
        logging.info(f"Scraping: {url}")

        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')
            listings = []

            # Find property listings (simplified selector)
            property_items = soup.find_all('article', class_='item')

            for item in property_items[:10]:  # Limit to first 10 for demo
                try:
                    title_elem = item.find('a', class_='item-link')
                    price_elem = item.find('span', class_='item-price')

                    if title_elem and price_elem:
                        listing = {
                            'id': str(hash(title_elem.get('href', ''))),
                            'title': title_elem.get('title', '').strip(),
                            'price': self.extract_price(price_elem.get_text()),
                            'location': 'Torino',
                            'description': '',
                            'url': f"https://www.idealista.it{title_elem.get('href')}" if title_elem.get('href') else '',
                            'date_scraped': datetime.now()
                        }

                        if self.matches_criteria(listing):
                            listings.append(listing)

                except Exception as e:
                    logging.error(f"Error processing listing: {e}")
                    continue

            logging.info(f"Found {len(listings)} matching listings")
            return listings

        except Exception as e:
            logging.error(f"Error scraping listings: {e}")
            return []

    def extract_price(self, price_text):
        # Extract numeric price from price text
        import re
        price_match = re.search(r'([0-9.,]+)', price_text.replace('.', '').replace(',', ''))
        return int(price_match.group(1)) if price_match else 0

    def matches_criteria(self, listing):
        # Check if listing matches search criteria
        price_range = self.config['search_criteria']['price_range']
        return price_range['min'] <= listing['price'] <= price_range['max']

    def save_listing(self, listing):
        # Save listing to database
        cursor = self.conn.cursor()

        cursor.execute('SELECT id FROM listings WHERE id = ?', (listing['id'],))
        exists = cursor.fetchone()

        if not exists:
            cursor.execute('''
                INSERT INTO listings (id, title, price, location, description, url, date_added, is_new)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                listing['id'], listing['title'], listing['price'], listing['location'],
                listing['description'], listing['url'], listing['date_scraped'], True
            ))
            self.conn.commit()
            logging.info(f"New listing saved: {listing['title']}")
            return True
        return False

    def send_email_notification(self, listings):
        # Send email notification for new listings
        if not listings:
            return

        print(f"Would send email notification for {len(listings)} new listings")
        # Email implementation would go here

    def monitor_properties(self):
        # Main monitoring function
        logging.info("Starting property monitoring cycle")

        listings = self.scrape_listings()
        new_listings = []

        for listing in listings:
            if self.save_listing(listing):
                new_listings.append(listing)

        if new_listings:
            logging.info(f"Found {len(new_listings)} new listings")
            self.send_email_notification(new_listings)
        else:
            logging.info("No new listings found")

    def close(self):
        if hasattr(self, 'conn'):
            self.conn.close()

# Example configuration
config = {
    "search_criteria": {
        "price_range": {"min": 300, "max": 800},
        "locations": ["Centro", "Crocetta", "San Salvario"],
        "property_types": ["apartment", "studio"]
    },
    "notification_settings": {
        "email": "user@example.com"
    }
}

# Example usage
if __name__ == "__main__":
    monitor = TurinPropertyMonitor(config)
    monitor.monitor_properties()
    monitor.close()
