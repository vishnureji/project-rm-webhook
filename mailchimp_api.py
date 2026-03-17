import os
import logging
import requests
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Mailchimp Configuration
MAILCHIMP_API_KEY = os.getenv("MAILCHIMP_API_KEY")
MAILCHIMP_SERVER = os.getenv("MAILCHIMP_SERVER", "us1")  # Extract from API key or set env var

class MailchimpClient:
    """Client for interacting with Mailchimp API"""
    
    def __init__(self, api_key: str = None, server: str = None):
        self.api_key = api_key or MAILCHIMP_API_KEY
        self.server = server or MAILCHIMP_SERVER
        self.base_url = f"https://{self.server}.api.mailchimp.com/3.0"
        
        if not self.api_key:
            raise ValueError("MAILCHIMP_API_KEY environment variable not set")
    
    def _make_request(self, method: str, endpoint: str, params: Dict = None, data: Dict = None) -> Dict:
        """Make a request to Mailchimp API"""
        try:
            url = f"{self.base_url}{endpoint}"
            auth = ("apikey", self.api_key)
            
            response = requests.request(
                method=method,
                url=url,
                auth=auth,
                params=params,
                json=data,
                timeout=10
            )
            
            response.raise_for_status()
            return response.json() if response.text else {}
        except requests.exceptions.RequestException as e:
            logger.error(f"Mailchimp API error: {str(e)}")
            raise
    
    def get_audiences(self) -> List[Dict]:
        """Get all audiences with subscriber counts"""
        try:
            response = self._make_request(
                "GET",
                "/lists",
                params={"count": 1000}
            )
            
            audiences = []
            for list_item in response.get("lists", []):
                audiences.append({
                    "id": list_item.get("id"),
                    "name": list_item.get("name"),
                    "subscriber_count": list_item.get("stats", {}).get("member_count", 0),
                    "unsubscribed_count": list_item.get("stats", {}).get("unsubscribe_count", 0),
                    "cleaned_count": list_item.get("stats", {}).get("cleaned_count", 0),
                    "created_at": list_item.get("date_created"),
                })
            
            return audiences
        except Exception as e:
            logger.error(f"Error fetching audiences: {str(e)}")
            return []
    
    def get_campaigns(self, status: str = "sent", limit: int = 50) -> List[Dict]:
        """Get campaigns with optional status filter"""
        try:
            response = self._make_request(
                "GET",
                "/campaigns",
                params={"count": limit, "status": status}
            )
            
            campaigns = []
            for campaign in response.get("campaigns", []):
                campaigns.append({
                    "id": campaign.get("id"),
                    "name": campaign.get("settings", {}).get("title", "Untitled"),
                    "status": campaign.get("status"),
                    "created_at": campaign.get("create_time"),
                    "sent_at": campaign.get("send_time"),
                    "emails_sent": campaign.get("emails_sent", 0),
                    "recipient": campaign.get("recipients", {}),
                })
            
            return campaigns
        except Exception as e:
            logger.error(f"Error fetching campaigns: {str(e)}")
            return []
    
    def get_campaign_report(self, campaign_id: str) -> Dict:
        """Get detailed report for a specific campaign"""
        try:
            response = self._make_request(
                "GET",
                f"/reports/{campaign_id}"
            )
            
            return {
                "campaign_id": campaign_id,
                "opens": response.get("opens", 0),
                "open_rate": response.get("open_rate", 0),
                "clicks": response.get("clicks", 0),
                "click_rate": response.get("click_rate", 0),
                "bounces": response.get("bounces", {}).get("hard_bounces", 0) + response.get("bounces", {}).get("soft_bounces", 0),
                "unsubscribes": response.get("unsubscribes", 0),
                "abuse_reports": response.get("abuse_reports", 0),
                "emails_sent": response.get("emails_sent", 0),
                "list_stats": response.get("list_stats", {}),
            }
        except Exception as e:
            logger.error(f"Error fetching campaign report: {str(e)}")
            return {}
    
    def get_audience_growth(self, audience_id: str) -> List[Dict]:
        """Get audience growth data (members added/removed over time)"""
        try:
            response = self._make_request(
                "GET",
                f"/lists/{audience_id}/growth-history",
                params={"count": 100}
            )
            
            growth_data = []
            for entry in response.get("history", []):
                growth_data.append({
                    "date": entry.get("month"),
                    "existing": entry.get("existing", 0),
                    "imports": entry.get("imports", 0),
                    "optins": entry.get("optins", 0),
                    "total": entry.get("existing", 0) + entry.get("imports", 0) + entry.get("optins", 0),
                })
            
            return growth_data
        except Exception as e:
            logger.error(f"Error fetching audience growth: {str(e)}")
            return []
    
    def get_email_activity(self, audience_id: str, member_id: str = None) -> List[Dict]:
        """Get email activity for an audience or specific member"""
        try:
            endpoint = f"/lists/{audience_id}/activity"
            if member_id:
                endpoint = f"/lists/{audience_id}/members/{member_id}/activity"
            
            response = self._make_request(
                "GET",
                endpoint,
                params={"count": 100}
            )
            
            activity_data = []
            for activity in response.get("activity", []):
                activity_data.append({
                    "action": activity.get("action"),
                    "timestamp": activity.get("timestamp"),
                    "email": activity.get("email", "N/A"),
                    "campaign_id": activity.get("campaign_id", "N/A"),
                })
            
            return activity_data
        except Exception as e:
            logger.error(f"Error fetching email activity: {str(e)}")
            return []


# Singleton instance
_mailchimp_client = None

def get_mailchimp_client() -> MailchimpClient:
    """Get or create Mailchimp client instance"""
    global _mailchimp_client
    if _mailchimp_client is None:
        _mailchimp_client = MailchimpClient()
    return _mailchimp_client
