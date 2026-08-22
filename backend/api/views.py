from datetime import datetime
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    health_status = {
        "status": "healthy",
        "database": "disconnected",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    try:
        connection.ensure_connection()
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        health_status["database"] = "connected"
        return Response(health_status, status=status.HTTP_200_OK)
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["error"] = str(e)
        return Response(health_status, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

