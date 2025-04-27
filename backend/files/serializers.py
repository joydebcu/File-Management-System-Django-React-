from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    storage_savings = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at', 
                 'content_hash', 'reference_count', 'storage_savings']
        read_only_fields = ['id', 'uploaded_at', 'content_hash', 'reference_count', 'storage_savings']
    
    def get_storage_savings(self, obj):
        return obj.storage_savings 