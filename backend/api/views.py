import re
from datetime import datetime
from django.db import connection
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Users, Trips
from .utils import generate_jwt_token
from .serializers import TripsSerializer

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

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    profile_image = request.data.get('profile_image', '')

    if not name or not email or not password:
        return Response(
            {"error": "name, email, and password are required fields"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return Response(
            {"error": "Invalid email address format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Users.objects.filter(email=email).exists():
        return Response(
            {"error": "A user with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        hashed_password = make_password(password)
        user = Users.objects.create(
            name=name,
            email=email,
            password_hash=hashed_password,
            profile_image=profile_image
        )
        
        token = generate_jwt_token(user)
        return Response({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "profile_image": user.profile_image,
                "created_at": user.created_at
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"error": f"Failed to create user: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {"error": "email and password are required fields"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = Users.objects.get(email=email)
    except Users.DoesNotExist:
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(password, user.password_hash):
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token = generate_jwt_token(user)
    return Response({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_image": user.profile_image,
            "created_at": user.created_at
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def trips_list_create_view(request):
    if request.method == 'GET':
        trips = Trips.objects.filter(user=request.user)
        serializer = TripsSerializer(trips, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = TripsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def trips_detail_view(request, pk):
    try:
        trip = Trips.objects.get(pk=pk, user=request.user)
    except Trips.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TripsSerializer(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = TripsSerializer(trip, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


