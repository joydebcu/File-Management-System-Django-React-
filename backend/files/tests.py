from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import File
import os
from django.core.files.uploadedfile import SimpleUploadedFile
import hashlib

class FileDeduplicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('file-list')
        
        # Create a test file
        self.test_file_content = b'This is a test file content'
        self.test_file = SimpleUploadedFile(
            'test.txt',
            self.test_file_content,
            content_type='text/plain'
        )
        
        # Calculate the expected hash
        self.expected_hash = hashlib.sha256(self.test_file_content).hexdigest()

    def test_file_upload_and_hash_calculation(self):
        """Test that file upload works and hash is calculated correctly"""
        response = self.client.post(self.url, {'file': self.test_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content_hash'], self.expected_hash)
        self.assertEqual(response.data['is_duplicate'], False)
        
        # Verify the file was created in the database
        file = File.objects.get(id=response.data['id'])
        self.assertEqual(file.content_hash, self.expected_hash)
        self.assertEqual(file.reference_count, 1)

    def test_duplicate_file_detection(self):
        """Test that duplicate files are detected and reference count is incremented"""
        # First upload
        response1 = self.client.post(self.url, {'file': self.test_file}, format='multipart')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Reset file pointer for second upload
        self.test_file.seek(0)
        
        # Second upload of the same file
        response2 = self.client.post(self.url, {'file': self.test_file}, format='multipart')
        
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['is_duplicate'], True)
        self.assertEqual(response2.data['reference_count'], 2)
        
        # Verify the file in database
        file = File.objects.get(id=response1.data['id'])
        self.assertEqual(file.reference_count, 2)

    def test_different_files_not_deduplicated(self):
        """Test that different files are not marked as duplicates"""
        # First file
        response1 = self.client.post(self.url, {'file': self.test_file}, format='multipart')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Different file
        different_content = b'This is a different test file content'
        different_file = SimpleUploadedFile(
            'different.txt',
            different_content,
            content_type='text/plain'
        )
        
        response2 = self.client.post(self.url, {'file': different_file}, format='multipart')
        
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.data['is_duplicate'], False)
        
        # Verify both files exist
        self.assertEqual(File.objects.count(), 2)

    def test_storage_savings_calculation(self):
        """Test that storage savings are calculated correctly"""
        # First upload
        response1 = self.client.post(self.url, {'file': self.test_file}, format='multipart')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Reset file pointer for second upload
        self.test_file.seek(0)
        
        # Second upload
        response2 = self.client.post(self.url, {'file': self.test_file}, format='multipart')
        
        # Get the file details
        file = File.objects.get(id=response1.data['id'])
        expected_savings = file.size * (file.reference_count - 1)
        
        self.assertEqual(file.storage_savings, expected_savings)
        self.assertEqual(response2.data['storage_savings'], expected_savings)

    def test_invalid_file_handling(self):
        """Test handling of invalid file uploads"""
        # Test empty file
        empty_file = SimpleUploadedFile('empty.txt', b'', content_type='text/plain')
        response = self.client.post(self.url, {'file': empty_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test no file provided
        response = self.client.post(self.url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_file_list_with_deduplication_info(self):
        """Test that file list includes deduplication information"""
        # Upload a file twice
        self.client.post(self.url, {'file': self.test_file}, format='multipart')
        self.test_file.seek(0)
        self.client.post(self.url, {'file': self.test_file}, format='multipart')
        
        # Get file list
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify deduplication info
        file_data = response.data[0]
        self.assertEqual(file_data['reference_count'], 2)
        self.assertTrue(file_data['storage_savings'] > 0)
        self.assertIn('content_hash', file_data) 