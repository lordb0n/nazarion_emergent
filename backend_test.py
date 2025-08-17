#!/usr/bin/env python3
"""
Backend API Testing for GORA Dating App
Tests all FastAPI endpoints with MongoDB integration
"""

import requests
import sys
import json
import os
from datetime import datetime
from io import BytesIO
from PIL import Image
import tempfile

class GoraAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_telegram_id = f"test_user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.test_user_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def create_test_image(self):
        """Create a test image file for photo upload"""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return img_bytes

    def test_health_check(self):
        """Test health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data.get('status', 'N/A')}"
            return self.log_test("Health Check", success, details)
        except Exception as e:
            return self.log_test("Health Check", False, f"Error: {str(e)}")

    def test_user_registration(self):
        """Test user registration with form data and file upload"""
        try:
            # Prepare test data
            form_data = {
                'telegram_id': self.test_telegram_id,
                'name': 'Test User',
                'age': '25',
                'gender': 'male',
                'orientation': 'hetero',
                'interested_in': json.dumps(['female']),
                'relationship_type': json.dumps(['seriousIntentions']),
                'selectedSpokies': json.dumps([1, 2, 3]),
                'bio': 'Test bio for dating app'
            }

            # Create test image
            test_image = self.create_test_image()
            files = {'photos': ('test_photo.jpg', test_image, 'image/jpeg')}

            response = requests.post(
                f"{self.base_url}/api/auth/register",
                data=form_data,
                files=files,
                timeout=15
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
                print(f"   📝 Registered user with telegram_id: {self.test_telegram_id}")
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("User Registration", success, details)

        except Exception as e:
            return self.log_test("User Registration", False, f"Error: {str(e)}")

    def test_get_user_profile(self):
        """Test getting user profile"""
        try:
            response = requests.get(
                f"{self.base_url}/api/profile/{self.test_telegram_id}",
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                self.test_user_id = data.get('user_id')
                details += f", Name: {data.get('name', 'N/A')}, Age: {data.get('age', 'N/A')}"
                print(f"   📝 Retrieved profile for user_id: {self.test_user_id}")
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Get User Profile", success, details)

        except Exception as e:
            return self.log_test("Get User Profile", False, f"Error: {str(e)}")

    def test_update_user_profile(self):
        """Test updating user profile"""
        try:
            update_data = {
                "name": "Updated Test User",
                "bio": "Updated bio for testing",
                "age": 26
            }

            response = requests.put(
                f"{self.base_url}/api/profile/{self.test_telegram_id}",
                json=update_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Update User Profile", success, details)

        except Exception as e:
            return self.log_test("Update User Profile", False, f"Error: {str(e)}")

    def test_search_users(self):
        """Test searching for users"""
        try:
            response = requests.get(
                f"{self.base_url}/api/search/users",
                params={
                    'telegram_id': self.test_telegram_id,
                    'skip': 0,
                    'limit': 10
                },
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                users_count = len(data.get('users', []))
                details += f", Found {users_count} users"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Search Users", success, details)

        except Exception as e:
            return self.log_test("Search Users", False, f"Error: {str(e)}")

    def test_like_functionality(self):
        """Test like/dislike functionality"""
        if not self.test_user_id:
            return self.log_test("Like Functionality", False, "No test_user_id available")

        try:
            # Create a dummy target user ID for testing
            target_user_id = "dummy_target_user_id"
            
            like_data = {
                "target_user_id": target_user_id,
                "action": "like"
            }

            response = requests.post(
                f"{self.base_url}/api/like",
                params={'telegram_id': self.test_telegram_id},
                json=like_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                details += f", Success: {data.get('success', False)}, Match: {data.get('is_match', False)}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Like Functionality", success, details)

        except Exception as e:
            return self.log_test("Like Functionality", False, f"Error: {str(e)}")

    def test_get_received_likes(self):
        """Test getting received likes"""
        try:
            response = requests.get(
                f"{self.base_url}/api/likes/received/{self.test_telegram_id}",
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                likes_count = len(data.get('likes', []))
                details += f", Received {likes_count} likes"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Get Received Likes", success, details)

        except Exception as e:
            return self.log_test("Get Received Likes", False, f"Error: {str(e)}")

    def test_get_user_chats(self):
        """Test getting user chats"""
        try:
            response = requests.get(
                f"{self.base_url}/api/chats/{self.test_telegram_id}",
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                chats_count = len(data.get('chats', []))
                details += f", Found {chats_count} chats"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Get User Chats", success, details)

        except Exception as e:
            return self.log_test("Get User Chats", False, f"Error: {str(e)}")

    def test_chat_messages(self):
        """Test chat messages functionality"""
        try:
            # Test getting messages for a dummy chat
            dummy_chat_id = "dummy_chat_id"
            
            response = requests.get(
                f"{self.base_url}/api/chats/{dummy_chat_id}/messages",
                params={'skip': 0, 'limit': 50},
                timeout=10
            )

            success = response.status_code == 200
            details = f"Status: {response.status_code}"

            if success:
                data = response.json()
                messages_count = len(data.get('messages', []))
                details += f", Found {messages_count} messages"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:100]}"

            return self.log_test("Get Chat Messages", success, details)

        except Exception as e:
            return self.log_test("Get Chat Messages", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting GORA Dating App Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print(f"🆔 Test telegram_id: {self.test_telegram_id}")
        print("=" * 60)

        # Run tests in logical order
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_get_user_profile,
            self.test_update_user_profile,
            self.test_search_users,
            self.test_like_functionality,
            self.test_get_received_likes,
            self.test_get_user_chats,
            self.test_chat_messages,
        ]

        for test in tests:
            test()
            print()  # Add spacing between tests

        # Print final results
        print("=" * 60)
        print(f"📊 FINAL RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Backend is working correctly.")
            return 0
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} test(s) failed. Check the issues above.")
            return 1

def main():
    """Main function to run tests"""
    # Use environment variable or default to localhost
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    print(f"🔧 Backend URL: {backend_url}")
    
    tester = GoraAPITester(backend_url)
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())