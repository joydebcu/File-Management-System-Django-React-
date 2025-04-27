from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from .models import File
from .serializers import FileSerializer
import hashlib
from django.db import transaction
from django.db.models import Q

# Create your views here.

class FileFilter(django_filters.FilterSet):
    min_size = django_filters.NumberFilter(field_name="size", lookup_expr='gte')
    max_size = django_filters.NumberFilter(field_name="size", lookup_expr='lte')
    file_type = django_filters.CharFilter(field_name="file_type", lookup_expr='iexact')
    uploaded_after = django_filters.DateTimeFilter(field_name="uploaded_at", lookup_expr='gte')
    uploaded_before = django_filters.DateTimeFilter(field_name="uploaded_at", lookup_expr='lte')

    class Meta:
        model = File
        fields = ['file_type', 'size']

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FileFilter
    search_fields = ['original_filename', 'file_type']
    ordering_fields = ['original_filename', 'size', 'uploaded_at', 'file_type']
    ordering = ['-uploaded_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Handle search query
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(original_filename__icontains=search_query) |
                Q(file_type__icontains=search_query)
            )
        
        return queryset

    def _calculate_file_hash(self, file_obj):
        """Calculate SHA-256 hash of file content"""
        sha256_hash = hashlib.sha256()
        # Read the file content in chunks
        for chunk in file_obj.chunks():
            sha256_hash.update(chunk)
        return sha256_hash.hexdigest()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Read the file content and calculate hash
            file_content = file_obj.read()
            file_obj.seek(0)  # Reset the file pointer
            
            # Calculate hash from the file content
            sha256_hash = hashlib.sha256()
            sha256_hash.update(file_content)
            file_hash = sha256_hash.hexdigest()
            
            # Debug print
            print(f"Calculated hash: {file_hash}")
            
            # Check for existing file with same hash
            existing_file = File.objects.filter(content_hash=file_hash).first()
            
            if existing_file:
                print(f"Found existing file with hash: {existing_file.content_hash}")
                # File already exists, increment reference count
                existing_file.reference_count += 1
                existing_file.save()
                
                # Return existing file data with deduplication info
                serializer = self.get_serializer(existing_file)
                response_data = serializer.data
                response_data['message'] = f'File was deduplicated successfully. This file has {existing_file.reference_count} references.'
                response_data['is_duplicate'] = True
                return Response(response_data, status=status.HTTP_200_OK)
            
            # New file, create new entry
            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': file_obj.content_type,
                'size': file_obj.size,
                'content_hash': file_hash  # Ensure hash is included in the data
            }
            
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_create(serializer)
            
            # Verify the created file
            created_file = File.objects.get(id=serializer.data['id'])
            print(f"Created file hash: {created_file.content_hash}")
            
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data
            response_data['message'] = 'File uploaded successfully'
            response_data['is_duplicate'] = False
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print(f"Error processing file: {str(e)}")
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
