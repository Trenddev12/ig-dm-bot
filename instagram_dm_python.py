#!/usr/bin/env python3
"""
FREE Instagram DM Bot using Instagrapi
Perfect for n8n integration - 100% FREE and RELIABLE
"""

import os
import sys
import json
from datetime import datetime

try:
    from instagrapi import Client
except ImportError:
    print("Installing instagrapi...")
    os.system("pip install instagrapi")
    from instagrapi import Client

class InstagramDMBot:
    def __init__(self):
        self.client = Client()
        self.session_file = "instagram_session.json"
        
    def login_with_session(self, username, password, session_id=None):
        """Login using username/password or session"""
        try:
            # Try to load existing session
            if os.path.exists(self.session_file):
                print("📱 Loading existing session...")
                self.client.load_settings(self.session_file)
                self.client.login(username, password)
                print("✅ Logged in with saved session")
                return True
        except Exception as e:
            print(f"⚠️ Session login failed: {e}")
        
        try:
            # Fresh login
            print("🔐 Performing fresh login...")
            self.client.login(username, password)
            
            # Save session for future use
            self.client.dump_settings(self.session_file)
            print("✅ Login successful, session saved")
            return True
            
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def send_dm(self, username, message):
        """Send DM to a user"""
        try:
            print(f"🎯 Sending DM to @{username}")
            print(f"💬 Message: {message}")
            
            # Get user ID
            user_info = self.client.user_info_by_username(username)
            user_id = user_info.pk
            
            # Send message
            result = self.client.direct_send(message, [user_id])
            
            print(f"✅ DM sent successfully to @{username}")
            return {
                "success": True,
                "message": "DM sent successfully",
                "recipient": username,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Failed to send DM: {e}")
            return {
                "success": False,
                "error": str(e),
                "recipient": username,
                "timestamp": datetime.now().isoformat()
            }

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 4:
        print("Usage: python instagram_dm_python.py <username> <password> <target_username> <message>")
        print("Example: python instagram_dm_python.py myuser mypass uday_mehlawat 'Hello from bot!'")
        sys.exit(1)
    
    ig_username = sys.argv[1]
    ig_password = sys.argv[2]
    target_username = sys.argv[3]
    message = sys.argv[4]
    
    bot = InstagramDMBot()
    
    # Login
    if not bot.login_with_session(ig_username, ig_password):
        print("❌ Login failed")
        sys.exit(1)
    
    # Send DM
    result = bot.send_dm(target_username, message)
    print(json.dumps(result, indent=2))

# For n8n webhook usage
def handle_webhook(data):
    """Handle webhook requests from n8n"""
    try:
        username = data.get('username')
        password = data.get('password') 
        target = data.get('target_username')
        message = data.get('message')
        
        if not all([username, password, target, message]):
            return {
                "success": False,
                "error": "Missing required fields: username, password, target_username, message"
            }
        
        bot = InstagramDMBot()
        
        if not bot.login_with_session(username, password):
            return {
                "success": False,
                "error": "Instagram login failed"
            }
        
        return bot.send_dm(target, message)
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    main()
